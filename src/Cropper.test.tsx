// @vitest-environment jsdom

import * as React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Cropper, { CropperProps } from './Cropper'

const CONTAINER_RECT = {
  x: 0,
  y: 0,
  top: 0,
  right: 400,
  bottom: 300,
  left: 0,
  width: 400,
  height: 300,
  toJSON: () => ({}),
}

class MockResizeObserver {
  static instances: MockResizeObserver[] = []

  readonly disconnect = vi.fn()
  readonly observe = vi.fn()
  readonly unobserve = vi.fn()

  constructor(readonly callback: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this)
  }
}

function setMediaDimensions(container: HTMLElement, media: HTMLImageElement | HTMLVideoElement) {
  const getBoundingClientRect = vi
    .spyOn(container, 'getBoundingClientRect')
    .mockReturnValue(CONTAINER_RECT)
  Object.defineProperties(media, {
    offsetWidth: { configurable: true, value: 400 },
    offsetHeight: { configurable: true, value: 200 },
  })

  if (media instanceof HTMLImageElement) {
    Object.defineProperties(media, {
      naturalWidth: { configurable: true, value: 1000 },
      naturalHeight: { configurable: true, value: 500 },
    })
  } else {
    Object.defineProperties(media, {
      videoWidth: { configurable: true, value: 1000 },
      videoHeight: { configurable: true, value: 500 },
    })
  }

  return getBoundingClientRect
}

function requiredProps(overrides: Partial<CropperProps> = {}): CropperProps {
  return {
    image: '/image.jpg',
    crop: { x: 0, y: 0 },
    onCropChange: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  MockResizeObserver.instances = []
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('Cropper hooks implementation', () => {
  test('measures media and exposes the React 19 refs', () => {
    const containerRef = React.createRef<HTMLDivElement>()
    const mediaRef = React.createRef<HTMLImageElement | HTMLVideoElement>()
    const cropAreaRef = React.createRef<HTMLDivElement>()
    const onMediaLoaded = vi.fn()
    const onMediaSizeChange = vi.fn()
    const onCropSizeChange = vi.fn()

    const view = render(
      <Cropper
        {...requiredProps({ onMediaLoaded, onMediaSizeChange, onCropSizeChange })}
        ref={containerRef}
        mediaRef={mediaRef}
        cropAreaRef={cropAreaRef}
      />
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)

    expect(containerRef.current).toBe(container)
    expect(mediaRef.current).toBe(image)
    expect(cropAreaRef.current).toBe(view.getByTestId('cropper'))
    expect(onMediaLoaded).toHaveBeenCalledOnce()
    expect(onMediaSizeChange).toHaveBeenCalledWith({
      width: 400,
      height: 200,
      naturalWidth: 1000,
      naturalHeight: 500,
    })
    expect(onCropSizeChange).toHaveBeenCalledOnce()
    expect(onCropSizeChange.mock.calls[0][0].width).toBeCloseTo(400 / 1.5)
    expect(onCropSizeChange.mock.calls[0][0].height).toBe(200)

    view.unmount()
    expect(containerRef.current).toBeNull()
    expect(mediaRef.current).toBeNull()
    expect(cropAreaRef.current).toBeNull()
  })

  test('runs React 19 callback-ref cleanups', () => {
    const containerCleanup = vi.fn()
    const mediaCleanup = vi.fn()
    const cropAreaCleanup = vi.fn()
    const containerRef: React.RefCallback<HTMLDivElement> = vi.fn((element) =>
      element ? containerCleanup : undefined
    )
    const mediaRef: React.RefCallback<HTMLImageElement | HTMLVideoElement> = vi.fn((element) =>
      element ? mediaCleanup : undefined
    )
    const cropAreaRef: React.RefCallback<HTMLDivElement> = vi.fn((element) =>
      element ? cropAreaCleanup : undefined
    )

    const view = render(
      <Cropper
        {...requiredProps()}
        ref={containerRef}
        mediaRef={mediaRef}
        cropAreaRef={cropAreaRef}
      />
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)

    view.unmount()

    expect(containerCleanup).toHaveBeenCalledOnce()
    expect(mediaCleanup).toHaveBeenCalledOnce()
    expect(cropAreaCleanup).toHaveBeenCalledOnce()
  })

  test('controlled StrictMode parents settle and ignore fresh objects and callbacks', () => {
    const events = {
      cropChanges: [] as Array<{ crop: { x: number; y: number }; revision: number }>,
      cropAreas: [] as unknown[][],
      cropCompletions: [] as unknown[][],
      cropSizes: [] as unknown[],
      mediaSizes: [] as unknown[],
      interactionStarts: [] as unknown[],
      interactionEnds: [] as unknown[],
    }

    function ControlledCropper() {
      const [crop, setCrop] = React.useState({ x: 500, y: 500 })
      const [revision, setRevision] = React.useState(0)

      return (
        <>
          <button onClick={() => setRevision((value) => value + 1)}>rerender</button>
          <output data-testid="controlled-crop">
            {crop.x}:{crop.y}
          </output>
          <Cropper
            ref={() => undefined}
            image="/image.jpg"
            crop={{ x: crop.x, y: crop.y }}
            onCropChange={(nextCrop) => {
              events.cropChanges.push({ crop: nextCrop, revision })
              setCrop(nextCrop)
            }}
            onCropAreaChange={(...args) => events.cropAreas.push(args)}
            onCropComplete={(...args) => events.cropCompletions.push(args)}
            onCropSizeChange={(size) => events.cropSizes.push(size)}
            onMediaSizeChange={(size) => events.mediaSizes.push(size)}
            onInteractionStart={(interaction) => events.interactionStarts.push(interaction)}
            onInteractionEnd={(interaction) => events.interactionEnds.push(interaction)}
            style={{ containerStyle: {}, mediaStyle: {}, cropAreaStyle: {} }}
            classes={{}}
            mediaProps={{}}
            cropperProps={{}}
          />
        </>
      )
    }

    const view = render(
      <React.StrictMode>
        <ControlledCropper />
      </React.StrictMode>
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)

    expect(events.cropChanges).toHaveLength(1)
    expect(events.cropChanges[0].crop.x).toBeCloseTo(400 / 6)
    expect(events.cropChanges[0].crop.y).toBe(0)
    expect(events.cropAreas).toHaveLength(1)
    expect(events.cropCompletions).toHaveLength(1)
    expect(events.cropSizes).toHaveLength(1)
    expect(events.mediaSizes).toHaveLength(1)

    events.cropChanges.splice(0)
    events.cropAreas.splice(0)
    events.cropCompletions.splice(0)
    events.cropSizes.splice(0)
    events.mediaSizes.splice(0)
    events.interactionStarts.splice(0)
    events.interactionEnds.splice(0)
    fireEvent.click(view.getByRole('button', { name: 'rerender' }))

    expect(events.cropChanges).toEqual([])
    expect(events.cropAreas).toEqual([])
    expect(events.cropCompletions).toEqual([])
    expect(events.cropSizes).toEqual([])
    expect(events.mediaSizes).toEqual([])

    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 80, clientY: 100 })
    fireEvent.mouseUp(document)

    expect(events.cropChanges).toHaveLength(1)
    expect(events.cropChanges[0].revision).toBe(1)
    expect(events.cropChanges[0].crop.x).toBeCloseTo(400 / 6 - 20)
    expect(events.cropChanges[0].crop.y).toBe(0)
    expect(events.cropAreas).toHaveLength(1)
    expect(events.cropCompletions).toHaveLength(1)
    expect(events.interactionStarts).toEqual([{ source: 'mouse' }])
    expect(events.interactionEnds).toEqual([{ source: 'mouse' }])
  })

  test('flushes the final drag frame before completing the controlled interaction', () => {
    let frameId = 0
    const frames = new Map<number, FrameRequestCallback>()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameId += 1
      frames.set(frameId, callback)
      return frameId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames.delete(id)
    })
    const onCropComplete = vi.fn()

    function ControlledCropper() {
      const [crop, setCrop] = React.useState({ x: 0, y: 0 })

      return (
        <>
          <output data-testid="drag-crop">
            {crop.x}:{crop.y}
          </output>
          <Cropper
            image="/image.jpg"
            crop={crop}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
          />
        </>
      )
    }

    const view = render(<ControlledCropper />)
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    onCropComplete.mockClear()

    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 80, clientY: 100 })
    expect(frames.size).toBe(1)

    fireEvent.mouseUp(document)

    expect(frames.size).toBe(0)
    expect(view.getByTestId('drag-crop').textContent).toBe('-20:0')
    expect(onCropComplete).toHaveBeenCalledOnce()
  })

  test('waits for the exact final controlled drag value before completing', () => {
    let frameId = 0
    const frames = new Map<number, FrameRequestCallback>()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameId += 1
      frames.set(frameId, callback)
      return frameId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames.delete(id)
    })
    const requestedCrops: Array<{ x: number; y: number }> = []
    const onCropComplete = vi.fn()

    function DelayedControlledCropper() {
      const [crop, setCrop] = React.useState({ x: 0, y: 0 })

      return (
        <>
          <button onClick={() => setCrop(requestedCrops[0])}>apply first</button>
          <button onClick={() => setCrop(requestedCrops[requestedCrops.length - 1])}>
            apply final
          </button>
          <Cropper
            image="/image.jpg"
            crop={crop}
            onCropChange={(nextCrop) => requestedCrops.push(nextCrop)}
            onCropComplete={onCropComplete}
          />
        </>
      )
    }

    const view = render(<DelayedControlledCropper />)
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    onCropComplete.mockClear()

    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 90, clientY: 100 })
    const firstFrame = frames.entries().next().value
    if (!firstFrame) throw new Error('Expected a scheduled drag frame')
    frames.delete(firstFrame[0])
    act(() => firstFrame[1](0))
    fireEvent.mouseMove(document, { clientX: 80, clientY: 100 })
    fireEvent.mouseUp(document)

    expect(requestedCrops.map(({ x }) => x)).toEqual([-10, -20])
    fireEvent.click(view.getByRole('button', { name: 'apply first' }))
    expect(onCropComplete).not.toHaveBeenCalled()

    fireEvent.click(view.getByRole('button', { name: 'apply final' }))
    expect(onCropComplete).toHaveBeenCalledOnce()
  })

  test('native listeners use the latest callback without resubscribing', () => {
    const addEventListener = vi.spyOn(HTMLElement.prototype, 'addEventListener')
    const removeEventListener = vi.spyOn(HTMLElement.prototype, 'removeEventListener')
    const firstRequest = vi.fn(() => false)
    const secondRequest = vi.fn(() => false)
    const view = render(<Cropper {...requiredProps({ onWheelRequest: firstRequest })} />)
    const container = view.getByTestId('container')

    const wheelListenerCalls = () =>
      addEventListener.mock.calls.filter(
        ([type], index) => type === 'wheel' && addEventListener.mock.contexts[index] === container
      )

    expect(wheelListenerCalls()).toHaveLength(1)
    const wheelListener = wheelListenerCalls()[0][1]

    fireEvent.wheel(container, { deltaY: -100 })
    expect(firstRequest).toHaveBeenCalledOnce()

    view.rerender(<Cropper {...requiredProps({ onWheelRequest: secondRequest })} />)
    fireEvent.wheel(container, { deltaY: -100 })

    expect(firstRequest).toHaveBeenCalledOnce()
    expect(secondRequest).toHaveBeenCalledOnce()
    expect(wheelListenerCalls()).toHaveLength(1)

    view.unmount()
    expect(
      removeEventListener.mock.calls.some(
        ([type, listener], index) =>
          type === 'wheel' &&
          listener === wheelListener &&
          removeEventListener.mock.contexts[index] === container
      )
    ).toBe(true)
  })

  test('active mouse listeners use the latest controlled crop and callbacks', () => {
    const firstCropChange = vi.fn()
    const secondCropChange = vi.fn()
    const firstInteractionEnd = vi.fn()
    const secondInteractionEnd = vi.fn()
    const view = render(
      <Cropper
        {...requiredProps({
          onCropChange: firstCropChange,
          onInteractionEnd: firstInteractionEnd,
        })}
      />
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    firstCropChange.mockClear()

    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(document, { clientX: 90, clientY: 100 })
    expect(firstCropChange).toHaveBeenCalledWith({ x: -10, y: 0 })

    view.rerender(
      <Cropper
        {...requiredProps({
          crop: { x: -10, y: 0 },
          onCropChange: secondCropChange,
          onInteractionEnd: secondInteractionEnd,
        })}
      />
    )
    fireEvent.mouseMove(document, { clientX: 80, clientY: 100 })
    fireEvent.mouseUp(document)

    expect(firstCropChange).toHaveBeenCalledOnce()
    expect(secondCropChange).toHaveBeenCalledWith({ x: -20, y: 0 })
    expect(firstInteractionEnd).not.toHaveBeenCalled()
    expect(secondInteractionEnd).toHaveBeenCalledWith({ source: 'mouse' })
  })

  test('active touch and gesture listeners use the latest callbacks', () => {
    const firstCropChange = vi.fn()
    const secondCropChange = vi.fn()
    const firstRotationChange = vi.fn()
    const secondRotationChange = vi.fn()
    const view = render(
      <Cropper
        {...requiredProps({
          onCropChange: firstCropChange,
          onRotationChange: firstRotationChange,
        })}
      />
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    firstCropChange.mockClear()

    fireEvent.touchStart(container, { touches: [{ clientX: 100, clientY: 100 }] })
    view.rerender(
      <Cropper
        {...requiredProps({
          onCropChange: secondCropChange,
          onRotationChange: secondRotationChange,
        })}
      />
    )
    fireEvent.touchMove(document, { touches: [{ clientX: 80, clientY: 100 }] })
    fireEvent.touchEnd(document)

    expect(firstCropChange).not.toHaveBeenCalled()
    expect(secondCropChange).toHaveBeenCalledWith({ x: -20, y: 0 })

    const gesture = (type: string) => {
      const event = new Event(type, { bubbles: true, cancelable: true })
      Object.assign(event, { clientX: 100, clientY: 100, rotation: 5, scale: 1 })
      return event
    }
    container.dispatchEvent(gesture('gesturestart'))
    view.rerender(
      <Cropper
        {...requiredProps({
          onCropChange: secondCropChange,
          onRotationChange: secondRotationChange,
        })}
      />
    )
    document.dispatchEvent(gesture('gesturechange'))

    expect(firstRotationChange).not.toHaveBeenCalled()
    expect(secondRotationChange).toHaveBeenCalledWith(5)
  })

  test('pending wheel completion uses the latest callback', () => {
    vi.useFakeTimers()
    const firstInteractionEnd = vi.fn()
    const secondInteractionEnd = vi.fn()
    const view = render(
      <Cropper
        {...requiredProps({
          onZoomChange: vi.fn(),
          onInteractionEnd: firstInteractionEnd,
        })}
      />
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)

    fireEvent.wheel(container, { clientX: 100, clientY: 100, deltaY: -100 })
    view.rerender(
      <Cropper
        {...requiredProps({
          onZoomChange: vi.fn(),
          onInteractionEnd: secondInteractionEnd,
        })}
      />
    )
    act(() => vi.advanceTimersByTime(250))

    expect(firstInteractionEnd).not.toHaveBeenCalled()
    expect(secondInteractionEnd).toHaveBeenCalledWith({ source: 'wheel' })
  })

  test('installs high-frequency document listeners only for an active interaction', () => {
    const addEventListener = vi.spyOn(Document.prototype, 'addEventListener')
    const removeEventListener = vi.spyOn(Document.prototype, 'removeEventListener')
    const view = render(<Cropper {...requiredProps()} />)
    const container = view.getByTestId('container')
    const callsFor = (type: string) =>
      addEventListener.mock.calls.filter(
        ([eventType], index) =>
          eventType === type && addEventListener.mock.contexts[index] === document
      )

    expect(callsFor('mousemove')).toHaveLength(0)
    expect(callsFor('touchmove')).toHaveLength(0)

    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 })
    expect(callsFor('mousemove')).toHaveLength(1)

    fireEvent.mouseUp(document)
    expect(
      removeEventListener.mock.calls.some(
        ([type], index) =>
          type === 'mousemove' && removeEventListener.mock.contexts[index] === document
      )
    ).toBe(true)
  })

  test('prevents Safari gestures while a rejected touch is active and clears the gate on end', () => {
    const onRotationChange = vi.fn()
    const onTouchRequest = vi.fn(() => false)
    const view = render(<Cropper {...requiredProps({ onRotationChange, onTouchRequest })} />)
    const container = view.getByTestId('container')
    const gesture = (type: string) => {
      const event = new Event(type, { bubbles: true, cancelable: true })
      Object.assign(event, { clientX: 100, clientY: 100, rotation: 5, scale: 1 })
      return event
    }

    const unrelatedChange = gesture('gesturechange')
    document.dispatchEvent(unrelatedChange)
    expect(unrelatedChange.defaultPrevented).toBe(false)

    fireEvent.touchStart(container, {
      touches: [{ clientX: 100, clientY: 100 }],
    })
    const blockedStart = gesture('gesturestart')
    const blockedChange = gesture('gesturechange')
    container.dispatchEvent(blockedStart)
    document.dispatchEvent(blockedChange)

    expect(blockedStart.defaultPrevented).toBe(true)
    expect(blockedChange.defaultPrevented).toBe(true)
    expect(onRotationChange).not.toHaveBeenCalled()

    fireEvent.touchEnd(document)
    container.dispatchEvent(gesture('gesturestart'))
    document.dispatchEvent(gesture('gesturechange'))

    expect(onRotationChange).toHaveBeenCalledWith(5)
  })

  test('settles wheel interactions 250ms after the final allowed event at a zoom bound', () => {
    vi.useFakeTimers()
    const onInteractionEnd = vi.fn()

    function ControlledCropper() {
      const [zoom, setZoom] = React.useState(1)

      return (
        <Cropper
          {...requiredProps()}
          zoom={zoom}
          maxZoom={1.1}
          onZoomChange={setZoom}
          onInteractionEnd={onInteractionEnd}
        />
      )
    }

    const view = render(<ControlledCropper />)
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)

    fireEvent.wheel(container, { clientX: 100, clientY: 100, deltaY: -100 })
    act(() => vi.advanceTimersByTime(200))
    fireEvent.wheel(container, { clientX: 100, clientY: 100, deltaY: -100 })
    act(() => vi.advanceTimersByTime(249))
    expect(onInteractionEnd).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(onInteractionEnd).toHaveBeenCalledOnce()
  })

  test('ends a multi-key keyboard interaction after the final arrow is released', () => {
    const onCropComplete = vi.fn()
    const onInteractionStart = vi.fn()
    const onInteractionEnd = vi.fn()

    function ControlledCropper() {
      const [crop, setCrop] = React.useState({ x: 0, y: 0 })

      return (
        <Cropper
          image="/image.jpg"
          crop={crop}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
        />
      )
    }

    const view = render(<ControlledCropper />)
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    onCropComplete.mockClear()
    const cropArea = view.getByTestId('cropper')

    fireEvent.keyDown(cropArea, { key: 'ArrowLeft' })
    fireEvent.keyDown(cropArea, { key: 'ArrowRight' })
    fireEvent.keyUp(cropArea, { key: 'ArrowLeft' })

    expect(onInteractionStart).toHaveBeenCalledOnce()
    expect(onInteractionEnd).not.toHaveBeenCalled()
    expect(onCropComplete).not.toHaveBeenCalled()

    fireEvent.keyDown(cropArea, { key: 'ArrowRight', repeat: true })
    fireEvent.keyUp(cropArea, { key: 'ArrowRight' })

    expect(onInteractionEnd).toHaveBeenCalledOnce()
    expect(onCropComplete).toHaveBeenCalledOnce()
  })

  test('debounces resize completion and cancels pending work on unmount', () => {
    vi.useFakeTimers()
    const onCropComplete = vi.fn()
    const view = render(<Cropper {...requiredProps({ onCropComplete })} />)
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    const getBoundingClientRect = setMediaDimensions(container, image)
    fireEvent.load(image)
    onCropComplete.mockClear()

    const observer = MockResizeObserver.instances[0]
    const notifyResize = () => observer.callback([], observer as unknown as ResizeObserver)

    act(notifyResize)
    getBoundingClientRect.mockReturnValue({ ...CONTAINER_RECT, right: 300, width: 300 })
    act(notifyResize)
    getBoundingClientRect.mockReturnValue({ ...CONTAINER_RECT, right: 320, width: 320 })
    act(notifyResize)

    act(() => vi.advanceTimersByTime(249))
    expect(onCropComplete).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onCropComplete).toHaveBeenCalledOnce()

    getBoundingClientRect.mockReturnValue({ ...CONTAINER_RECT, right: 340, width: 340 })
    act(notifyResize)
    view.unmount()
    act(() => vi.advanceTimersByTime(250))

    expect(onCropComplete).toHaveBeenCalledOnce()
    expect(observer.disconnect).toHaveBeenCalledOnce()
  })

  test('StrictMode replay and unmount clean every external subscription', () => {
    const onCropChange = vi.fn()
    const view = render(
      <React.StrictMode>
        <Cropper {...requiredProps({ onCropChange })} />
      </React.StrictMode>
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    onCropChange.mockClear()
    fireEvent.mouseDown(container, { clientX: 10, clientY: 10 })

    view.unmount()
    fireEvent.mouseMove(document, { clientX: 30, clientY: 30 })

    expect(onCropChange).not.toHaveBeenCalled()
    expect(MockResizeObserver.instances.length).toBeGreaterThanOrEqual(2)
    expect(
      MockResizeObserver.instances.every((observer) => observer.disconnect.mock.calls.length)
    ).toBe(true)
  })

  test('reloads video only when its source signature changes', () => {
    const load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined)
    const firstVideo = [
      { src: '/video.mp4', type: 'video/mp4' },
      { src: '/video.webm', type: 'video/webm' },
    ]
    const view = render(<Cropper {...requiredProps({ image: undefined, video: firstVideo })} />)
    load.mockClear()

    view.rerender(
      <Cropper
        {...requiredProps({
          image: undefined,
          video: firstVideo.map((source) => ({ ...source })),
        })}
      />
    )
    expect(load).not.toHaveBeenCalled()

    view.rerender(
      <Cropper {...requiredProps({ image: undefined, video: '/replacement-video.mp4' })} />
    )
    expect(load).toHaveBeenCalledOnce()
  })

  test('cancels old-media interaction work when the source changes', () => {
    vi.useFakeTimers()
    const onCropComplete = vi.fn()
    const onInteractionEnd = vi.fn()
    const view = render(
      <Cropper
        {...requiredProps({
          onCropComplete,
          onInteractionEnd,
          onZoomChange: vi.fn(),
        })}
      />
    )
    const container = view.getByTestId('container')
    const image = view.container.querySelector('img') as HTMLImageElement
    setMediaDimensions(container, image)
    fireEvent.load(image)
    onCropComplete.mockClear()

    fireEvent.wheel(container, { clientX: 100, clientY: 100, deltaY: -100 })
    view.rerender(
      <Cropper
        {...requiredProps({
          image: '/replacement.jpg',
          onCropComplete,
          onInteractionEnd,
          onZoomChange: vi.fn(),
        })}
      />
    )
    expect(view.queryByTestId('cropper')).toBeNull()
    fireEvent.load(image)
    onCropComplete.mockClear()

    act(() => vi.advanceTimersByTime(250))

    expect(onCropComplete).not.toHaveBeenCalled()
    expect(onInteractionEnd).not.toHaveBeenCalled()
  })
})
