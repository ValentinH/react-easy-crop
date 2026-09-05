import * as React from 'react'
import { useEffectEvent } from 'react'
import normalizeWheel from 'normalize-wheel'
import {
  clamp,
  computeCroppedArea,
  getCenter,
  getCropSize,
  getDistanceBetweenPoints,
  getInitialCropFromCroppedAreaPercentages,
  getInitialCropFromCroppedAreaPixels,
  getRotationBetweenPoints,
  restrictPosition,
} from './helpers'
import type {
  Area,
  CropperInteraction,
  CropperInteractionSource,
  MediaSize,
  Point,
  Size,
  VideoSrc,
} from './types'

const RESIZE_EMIT_DEBOUNCE_TIME = 250
const WHEEL_EMIT_DEBOUNCE_TIME = 250
const MIN_ZOOM = 1
const MAX_ZOOM = 3
const KEYBOARD_STEP = 1
const DEFAULT_ASPECT = 4 / 3
const ARROW_DELTAS: Readonly<Record<string, Point | undefined>> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

const useSafeLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

type ObjectFit = 'contain' | 'horizontal-cover' | 'vertical-cover'

export type CropperProps = {
  ref?: React.Ref<HTMLDivElement>
  image?: string
  video?: string | VideoSrc[]
  transform?: string
  crop: Point
  zoom?: number
  rotation?: number
  aspect?: number
  minZoom?: number
  maxZoom?: number
  cropShape?: 'rect' | 'round'
  cropSize?: Size
  objectFit?: 'contain' | 'cover' | 'horizontal-cover' | 'vertical-cover'
  showGrid?: boolean
  zoomSpeed?: number
  zoomWithScroll?: boolean
  roundCropAreaPixels?: boolean
  onCropChange: (location: Point) => void
  onZoomChange?: (zoom: number) => void
  onRotationChange?: (rotation: number) => void
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
  onCropAreaChange?: (croppedArea: Area, croppedAreaPixels: Area) => void
  onCropSizeChange?: (cropSize: Size) => void
  onMediaSizeChange?: (mediaSize: MediaSize) => void
  onInteractionStart?: (interaction: CropperInteraction) => void
  onInteractionEnd?: (interaction: CropperInteraction) => void
  onMediaLoaded?: (mediaSize: MediaSize) => void
  style?: {
    containerStyle?: React.CSSProperties
    mediaStyle?: React.CSSProperties
    cropAreaStyle?: React.CSSProperties
  }
  classes?: {
    containerClassName?: string
    mediaClassName?: string
    cropAreaClassName?: string
  }
  restrictPosition?: boolean
  mediaProps?:
    | React.ImgHTMLAttributes<HTMLImageElement>
    | React.VideoHTMLAttributes<HTMLVideoElement>
  cropperProps?: React.HTMLAttributes<HTMLDivElement>
  disableAutomaticStylesInjection?: boolean
  initialCroppedAreaPixels?: Area
  initialCroppedAreaPercentages?: Area
  onTouchRequest?: (event: React.TouchEvent<HTMLDivElement>) => boolean
  onWheelRequest?: (event: WheelEvent) => boolean
  cropAreaRef?: React.Ref<HTMLDivElement>
  mediaRef?: React.Ref<HTMLImageElement | HTMLVideoElement>
  nonce?: string
  keyboardStep?: number
}

type UiState = {
  cropSize: Size | null
  mediaObjectFit: ObjectFit
}

type CommittedInputs = {
  mediaSignature: string
  crop: Point
  zoom: number
  rotation: number
  aspect: number
  minZoom: number
  maxZoom: number
  cropSize?: Size
  objectFit: NonNullable<CropperProps['objectFit']>
  restrictPosition: boolean
  zoomWithScroll: boolean
}

type PendingCrop = {
  requested: Point
  previous: Point
}

type PendingNumber = {
  requested: number
  previous: number
}

type PendingInteractionCompletion = {
  crop?: PendingCrop
  zoom?: PendingNumber
  rotation?: PendingNumber
}

type Runtime = {
  container: HTMLDivElement | null
  media: HTMLImageElement | HTMLVideoElement | null
  document: Document | null
  window: Window | null
  containerRect: DOMRect | null
  containerPosition: Point
  mediaSize: MediaSize
  cropSize: Size | null
  previousCropSize: Size | null
  lastNotifiedMediaSize: MediaSize | null
  lastNotifiedCropSize: Size | null
  lastAreaKey: string | null
  loadedMediaSignature: string | null
  initialized: boolean
  committedInputs: CommittedInputs | null
  pendingCrop: PendingCrop | null
  pendingZoom: PendingNumber | null
  pendingInitialCompletion: PendingInteractionCompletion | null
  pendingLayout: 'initial' | 'props' | 'resize' | null
  cropSyncDue: boolean
  zoomBoundsCheckDue: boolean
  externalCompletionDue: boolean
  pendingInteractionCompletion: PendingInteractionCompletion | null
  releaseRequests: PendingInteractionCompletion | null
  resizeCompletionDue: boolean
  dragStartPosition: Point
  dragStartCrop: Point
  dragInteractionSource: CropperInteractionSource | null
  touching: boolean
  suppressNativeGesture: boolean
  gestureActive: boolean
  gestureZoomStart: number
  gestureRotationStart: number
  gestureRequests: PendingInteractionCompletion | null
  lastPinchDistance: number
  lastPinchRotation: number
  pendingDragPoint: Point | null
  pendingPinch: { pointA: Point; pointB: Point; center: Point } | null
  rafDrag: number | null
  rafPinch: number | null
  wheelTimer: number | null
  resizeTimer: number | null
  wheelActive: boolean
  keyboardKeys: Set<string>
  interactionCleanup: (() => void) | null
  gestureCleanup: (() => void) | null
  resizeObserver: ResizeObserver | null
}

type Measurement = {
  cropSize: Size
  cropSizeChanged: boolean
}

type InteractionHandlers = {
  dragAnimationFrame: () => void
  pinchAnimationFrame: () => void
  documentMouseMove: (event: MouseEvent) => void
  documentMouseUp: () => void
  documentTouchMove: (event: TouchEvent) => void
  documentTouchEnd: (event: TouchEvent) => void
  nativeGestureChange: (event: GestureEvent) => void
  nativeGestureEnd: (event: GestureEvent) => void
  wheelSettled: () => void
  resizeSettled: () => void
}

type GestureEvent = UIEvent & {
  rotation: number
  scale: number
  clientX: number
  clientY: number
}

const EMPTY_MEDIA_SIZE: MediaSize = {
  width: 0,
  height: 0,
  naturalWidth: 0,
  naturalHeight: 0,
}

function createRuntime(): Runtime {
  return {
    container: null,
    media: null,
    document: null,
    window: null,
    containerRect: null,
    containerPosition: { x: 0, y: 0 },
    mediaSize: EMPTY_MEDIA_SIZE,
    cropSize: null,
    previousCropSize: null,
    lastNotifiedMediaSize: null,
    lastNotifiedCropSize: null,
    lastAreaKey: null,
    loadedMediaSignature: null,
    initialized: false,
    committedInputs: null,
    pendingCrop: null,
    pendingZoom: null,
    pendingInitialCompletion: null,
    pendingLayout: null,
    cropSyncDue: false,
    zoomBoundsCheckDue: false,
    externalCompletionDue: false,
    pendingInteractionCompletion: null,
    releaseRequests: null,
    resizeCompletionDue: false,
    dragStartPosition: { x: 0, y: 0 },
    dragStartCrop: { x: 0, y: 0 },
    dragInteractionSource: null,
    touching: false,
    suppressNativeGesture: false,
    gestureActive: false,
    gestureZoomStart: 0,
    gestureRotationStart: 0,
    gestureRequests: null,
    lastPinchDistance: 0,
    lastPinchRotation: 0,
    pendingDragPoint: null,
    pendingPinch: null,
    rafDrag: null,
    rafPinch: null,
    wheelTimer: null,
    resizeTimer: null,
    wheelActive: false,
    keyboardKeys: new Set(),
    interactionCleanup: null,
    gestureCleanup: null,
    resizeObserver: null,
  }
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') {
    return ref(value)
  } else if (ref) {
    ref.current = value
  }
}

function cleanupAssignedRef<T>(
  ref: React.Ref<T> | undefined,
  cleanup: void | (() => void),
  value: T
) {
  if (typeof cleanup === 'function') {
    cleanup()
  } else if (typeof ref === 'function') {
    ref(null)
  } else if (ref?.current === value) {
    ref.current = null
  } else {
    return
  }
}

function pointsEqual(first: Point, second: Point) {
  return first.x === second.x && first.y === second.y
}

function sizesEqual(first: Size | null | undefined, second: Size | null | undefined) {
  return first?.width === second?.width && first?.height === second?.height
}

function mediaSizesEqual(first: MediaSize | null, second: MediaSize) {
  return (
    first?.width === second.width &&
    first.height === second.height &&
    first.naturalWidth === second.naturalWidth &&
    first.naturalHeight === second.naturalHeight
  )
}

function getMousePoint(event: MouseEvent | React.MouseEvent | GestureEvent): Point {
  return { x: Number(event.clientX), y: Number(event.clientY) }
}

function getTouchPoint(touch: Touch | React.Touch): Point {
  return { x: Number(touch.clientX), y: Number(touch.clientY) }
}

function getMediaSignature(image: string | undefined, video: string | VideoSrc[] | undefined) {
  if (image) return `image:${image}`
  if (typeof video === 'string') return `video:${video}`
  if (video) return `video:${JSON.stringify(video)}`
  return 'none'
}

function areaKey(percentages: Area, pixels: Area) {
  return [
    percentages.x,
    percentages.y,
    percentages.width,
    percentages.height,
    pixels.x,
    pixels.y,
    pixels.width,
    pixels.height,
  ].join(':')
}

export function useCropper(props: CropperProps) {
  const {
    ref,
    image,
    video,
    crop,
    zoom = 1,
    rotation = 0,
    aspect = DEFAULT_ASPECT,
    minZoom = MIN_ZOOM,
    maxZoom = MAX_ZOOM,
    cropSize: requestedCropSize,
    objectFit = 'contain',
    zoomSpeed = 1,
    zoomWithScroll = true,
    restrictPosition: shouldRestrictPosition = true,
    keyboardStep = KEYBOARD_STEP,
    onCropChange,
    onZoomChange,
    onRotationChange,
    onCropComplete,
    onCropAreaChange,
    onCropSizeChange,
    onMediaSizeChange,
    onInteractionStart,
    onInteractionEnd,
    onMediaLoaded,
    onTouchRequest,
    onWheelRequest,
    initialCroppedAreaPixels,
    initialCroppedAreaPercentages,
    cropAreaRef,
    mediaRef,
  } = props
  const mediaSignature = getMediaSignature(image, video)
  const runtimeRef = React.useRef<Runtime | null>(null)
  const interactionHandlersRef = React.useRef<InteractionHandlers | null>(null)
  const [ui, setUi] = React.useState<UiState>(() => ({
    cropSize: null,
    mediaObjectFit: objectFit === 'cover' ? 'horizontal-cover' : objectFit,
  }))

  function getRuntime() {
    if (!runtimeRef.current) runtimeRef.current = createRuntime()
    return runtimeRef.current
  }

  function getCommittedInputs(signature: string): CommittedInputs {
    return {
      mediaSignature: signature,
      crop: { x: crop.x, y: crop.y },
      zoom,
      rotation,
      aspect,
      minZoom,
      maxZoom,
      cropSize: requestedCropSize
        ? { width: requestedCropSize.width, height: requestedCropSize.height }
        : undefined,
      objectFit,
      restrictPosition: shouldRestrictPosition,
      zoomWithScroll,
    }
  }

  function resolveObjectFit(
    naturalWidth: number,
    naturalHeight: number,
    containerRect: DOMRect
  ): ObjectFit {
    if (objectFit !== 'cover') return objectFit
    if (!naturalWidth || !naturalHeight || !containerRect.height) return 'horizontal-cover'
    const containerAspect = containerRect.width / containerRect.height
    const mediaAspect = naturalWidth / naturalHeight
    return mediaAspect < containerAspect ? 'horizontal-cover' : 'vertical-cover'
  }

  function measure(): Measurement | null {
    const runtime = getRuntime()
    const media = runtime.media
    const container = runtime.container
    if (!media || !container) return null

    const containerRect = container.getBoundingClientRect()
    const naturalWidth =
      media.tagName === 'IMG'
        ? (media as HTMLImageElement).naturalWidth
        : (media as HTMLVideoElement).videoWidth
    const naturalHeight =
      media.tagName === 'IMG'
        ? (media as HTMLImageElement).naturalHeight
        : (media as HTMLVideoElement).videoHeight
    if (!naturalWidth || !naturalHeight) return null

    const resolvedObjectFit = resolveObjectFit(naturalWidth, naturalHeight, containerRect)
    // Offset dimensions still describe the old class until React commits this update.
    if (ui.mediaObjectFit !== resolvedObjectFit) {
      setUi((current) => ({ ...current, mediaObjectFit: resolvedObjectFit }))
      return null
    }
    const containerAspect = containerRect.width / containerRect.height
    const mediaAspect = naturalWidth / naturalHeight
    const isMediaScaledDown = media.offsetWidth < naturalWidth || media.offsetHeight < naturalHeight
    let renderedMediaSize: Size

    if (!isMediaScaledDown) {
      renderedMediaSize = { width: media.offsetWidth, height: media.offsetHeight }
    } else if (resolvedObjectFit === 'horizontal-cover') {
      renderedMediaSize = {
        width: containerRect.width,
        height: containerRect.width / mediaAspect,
      }
    } else if (resolvedObjectFit === 'vertical-cover') {
      renderedMediaSize = {
        width: containerRect.height * mediaAspect,
        height: containerRect.height,
      }
    } else {
      renderedMediaSize =
        containerAspect > mediaAspect
          ? { width: containerRect.height * mediaAspect, height: containerRect.height }
          : { width: containerRect.width, height: containerRect.width / mediaAspect }
    }

    const mediaSize: MediaSize = { ...renderedMediaSize, naturalWidth, naturalHeight }
    const nextCropSize =
      requestedCropSize ||
      getCropSize(
        mediaSize.width,
        mediaSize.height,
        containerRect.width,
        containerRect.height,
        aspect,
        rotation
      )
    const cropSizeChanged = !sizesEqual(runtime.cropSize, nextCropSize)

    runtime.containerRect = containerRect
    runtime.containerPosition = { x: containerRect.left, y: containerRect.top }
    runtime.mediaSize = mediaSize
    runtime.cropSize = nextCropSize
    setUi((current) => {
      if (
        sizesEqual(current.cropSize, nextCropSize) &&
        current.mediaObjectFit === resolvedObjectFit
      ) {
        return current
      }
      return { cropSize: nextCropSize, mediaObjectFit: resolvedObjectFit }
    })

    if (!mediaSizesEqual(runtime.lastNotifiedMediaSize, mediaSize)) {
      runtime.lastNotifiedMediaSize = mediaSize
      onMediaSizeChange?.(mediaSize)
    }
    if (!sizesEqual(runtime.lastNotifiedCropSize, nextCropSize)) {
      runtime.lastNotifiedCropSize = nextCropSize
      onCropSizeChange?.(nextCropSize)
    }

    return { cropSize: nextCropSize, cropSizeChanged }
  }

  function getCropData() {
    const runtime = getRuntime()
    if (!runtime.initialized || !runtime.cropSize) return null
    const position = shouldRestrictPosition
      ? restrictPosition(crop, runtime.mediaSize, runtime.cropSize, zoom, rotation)
      : crop
    const cropAspect = requestedCropSize
      ? requestedCropSize.width / requestedCropSize.height
      : aspect
    return computeCroppedArea(
      position,
      runtime.mediaSize,
      runtime.cropSize,
      cropAspect,
      zoom,
      rotation,
      shouldRestrictPosition
    )
  }

  function emitCropAreaChange() {
    const runtime = getRuntime()
    const data = getCropData()
    if (!data) return
    const key = areaKey(data.croppedAreaPercentages, data.croppedAreaPixels)
    if (runtime.lastAreaKey === key) return
    runtime.lastAreaKey = key
    onCropAreaChange?.(data.croppedAreaPercentages, data.croppedAreaPixels)
  }

  function emitCropComplete() {
    const data = getCropData()
    if (!data) return
    onCropComplete?.(data.croppedAreaPercentages, data.croppedAreaPixels)
  }

  function interactionCompletionCommitted(completion: PendingInteractionCompletion) {
    const cropCommitted = !completion.crop || pointsEqual(crop, completion.crop.requested)
    const zoomCommitted = !completion.zoom || zoom === completion.zoom.requested
    const rotationCommitted = !completion.rotation || rotation === completion.rotation.requested
    return cropCommitted && zoomCommitted && rotationCommitted
  }

  function requestRestrictedCrop(position: Point) {
    const runtime = getRuntime()
    if (!runtime.cropSize) return false
    const nextPosition = shouldRestrictPosition
      ? restrictPosition(position, runtime.mediaSize, runtime.cropSize, zoom, rotation)
      : position
    if (pointsEqual(nextPosition, crop)) return false
    runtime.pendingCrop = { requested: nextPosition, previous: crop }
    for (const completion of [
      runtime.pendingInteractionCompletion,
      runtime.pendingInitialCompletion,
      runtime.gestureRequests,
    ]) {
      if (completion && interactionCompletionCommitted(completion)) {
        completion.crop = { requested: nextPosition, previous: crop }
      }
    }
    onCropChange(nextPosition)
    return true
  }

  function saveContainerBounds() {
    const runtime = getRuntime()
    if (!runtime.container) return
    const bounds = runtime.container.getBoundingClientRect()
    runtime.containerRect = bounds
    runtime.containerPosition = { x: bounds.left, y: bounds.top }
  }

  function cancelExternalWork() {
    const runtime = getRuntime()
    if (runtime.rafDrag !== null) runtime.window?.cancelAnimationFrame(runtime.rafDrag)
    if (runtime.rafPinch !== null) runtime.window?.cancelAnimationFrame(runtime.rafPinch)
    if (runtime.wheelTimer !== null) runtime.window?.clearTimeout(runtime.wheelTimer)
    if (runtime.resizeTimer !== null) runtime.window?.clearTimeout(runtime.resizeTimer)
    runtime.interactionCleanup?.()
    runtime.interactionCleanup = null
    runtime.gestureCleanup?.()
    runtime.gestureCleanup = null
    runtime.rafDrag = null
    runtime.rafPinch = null
    runtime.wheelTimer = null
    runtime.resizeTimer = null
    runtime.wheelActive = false
    runtime.keyboardKeys.clear()
    runtime.dragInteractionSource = null
    runtime.touching = false
    runtime.suppressNativeGesture = false
    runtime.gestureActive = false
    runtime.gestureRequests = null
    runtime.pendingDragPoint = null
    runtime.pendingPinch = null
    runtime.releaseRequests = null
  }

  const cancelExternalWorkEvent = useEffectEvent(() => {
    cancelExternalWork()
  })

  function cancelTransientWork() {
    const runtime = getRuntime()
    cancelExternalWork()
    runtime.pendingCrop = null
    runtime.pendingZoom = null
    runtime.pendingInitialCompletion = null
    runtime.pendingLayout = null
    runtime.cropSyncDue = false
    runtime.zoomBoundsCheckDue = false
    runtime.externalCompletionDue = false
    runtime.pendingInteractionCompletion = null
    runtime.resizeCompletionDue = false
  }

  function setNewZoom(nextZoom: number, point: Point, shouldUpdatePosition: boolean) {
    const runtime = getRuntime()
    if (!runtime.cropSize || !onZoomChange) return false
    const restrictedZoom = clamp(nextZoom, minZoom, maxZoom)
    let changed = restrictedZoom !== zoom

    if (shouldUpdatePosition && runtime.containerRect) {
      const pointOnContainer = {
        x: runtime.containerRect.width / 2 - (point.x - runtime.containerPosition.x),
        y: runtime.containerRect.height / 2 - (point.y - runtime.containerPosition.y),
      }
      const zoomTarget = {
        x: (pointOnContainer.x + crop.x) / zoom,
        y: (pointOnContainer.y + crop.y) / zoom,
      }
      const requestedPosition = {
        x: zoomTarget.x * restrictedZoom - pointOnContainer.x,
        y: zoomTarget.y * restrictedZoom - pointOnContainer.y,
      }
      const nextPosition = shouldRestrictPosition
        ? restrictPosition(
            requestedPosition,
            runtime.mediaSize,
            runtime.cropSize,
            restrictedZoom,
            rotation
          )
        : requestedPosition
      if (!pointsEqual(nextPosition, crop)) {
        changed = true
        if (runtime.releaseRequests) {
          runtime.releaseRequests.crop = { requested: nextPosition, previous: crop }
        }
        onCropChange(nextPosition)
      }
    }
    if (restrictedZoom !== zoom) {
      if (runtime.releaseRequests) {
        runtime.releaseRequests.zoom = { requested: restrictedZoom, previous: zoom }
      }
      onZoomChange(restrictedZoom)
    }
    return changed
  }

  function applyDrag(point: Point) {
    const runtime = getRuntime()
    if (!runtime.cropSize || !runtime.dragInteractionSource) return false
    const requestedPosition = {
      x: runtime.dragStartCrop.x + point.x - runtime.dragStartPosition.x,
      y: runtime.dragStartCrop.y + point.y - runtime.dragStartPosition.y,
    }
    const nextPosition = shouldRestrictPosition
      ? restrictPosition(requestedPosition, runtime.mediaSize, runtime.cropSize, zoom, rotation)
      : requestedPosition
    if (pointsEqual(nextPosition, crop)) return false
    if (runtime.releaseRequests) {
      runtime.releaseRequests.crop = { requested: nextPosition, previous: crop }
    }
    onCropChange(nextPosition)
    return true
  }

  function handleDragAnimationFrame() {
    const runtime = getRuntime()
    runtime.rafDrag = null
    const point = runtime.pendingDragPoint
    runtime.pendingDragPoint = null
    if (point) applyDrag(point)
  }

  function onDragAnimationFrame() {
    interactionHandlersRef.current?.dragAnimationFrame()
  }

  function scheduleDrag(point: Point) {
    const runtime = getRuntime()
    if (!runtime.window || !runtime.dragInteractionSource) return
    runtime.pendingDragPoint = point
    if (runtime.rafDrag !== null) runtime.window.cancelAnimationFrame(runtime.rafDrag)
    const frame = runtime.window.requestAnimationFrame(onDragAnimationFrame)
    runtime.rafDrag = runtime.pendingDragPoint ? frame : null
  }

  function applyPinch({ pointA, pointB, center }: { pointA: Point; pointB: Point; center: Point }) {
    const runtime = getRuntime()
    if (!runtime.dragInteractionSource || !runtime.cropSize) return false
    const distance = getDistanceBetweenPoints(pointA, pointB)
    const nextZoom = onZoomChange
      ? clamp(zoom * (distance / runtime.lastPinchDistance), minZoom, maxZoom)
      : zoom
    runtime.lastPinchDistance = distance
    const pinchRotation = getRotationBetweenPoints(pointA, pointB)
    const nextRotation = onRotationChange
      ? rotation + pinchRotation - runtime.lastPinchRotation
      : rotation
    const requestedPosition = {
      x: runtime.dragStartCrop.x + center.x - runtime.dragStartPosition.x,
      y: runtime.dragStartCrop.y + center.y - runtime.dragStartPosition.y,
    }
    const nextPosition = shouldRestrictPosition
      ? restrictPosition(
          requestedPosition,
          runtime.mediaSize,
          runtime.cropSize,
          nextZoom,
          nextRotation
        )
      : requestedPosition
    const changed =
      !pointsEqual(nextPosition, crop) || nextZoom !== zoom || nextRotation !== rotation
    if (!pointsEqual(nextPosition, crop)) {
      if (runtime.releaseRequests) {
        runtime.releaseRequests.crop = { requested: nextPosition, previous: crop }
      }
      onCropChange(nextPosition)
    }
    if (nextZoom !== zoom) {
      if (runtime.releaseRequests) {
        runtime.releaseRequests.zoom = { requested: nextZoom, previous: zoom }
      }
      onZoomChange?.(nextZoom)
    }
    if (onRotationChange) {
      if (nextRotation !== rotation) {
        if (runtime.releaseRequests) {
          runtime.releaseRequests.rotation = { requested: nextRotation, previous: rotation }
        }
      }
      onRotationChange(nextRotation)
    }
    runtime.lastPinchRotation = pinchRotation
    return changed
  }

  function handlePinchAnimationFrame() {
    const runtime = getRuntime()
    runtime.rafPinch = null
    const pinch = runtime.pendingPinch
    runtime.pendingPinch = null
    if (pinch) applyPinch(pinch)
  }

  function onPinchAnimationFrame() {
    interactionHandlersRef.current?.pinchAnimationFrame()
  }

  function schedulePinch(event: TouchEvent) {
    const runtime = getRuntime()
    if (!runtime.window) return
    const pointA = getTouchPoint(event.touches[0])
    const pointB = getTouchPoint(event.touches[1])
    const center = getCenter(pointA, pointB)
    runtime.pendingPinch = { pointA, pointB, center }
    if (runtime.rafPinch !== null) runtime.window.cancelAnimationFrame(runtime.rafPinch)
    const frame = runtime.window.requestAnimationFrame(onPinchAnimationFrame)
    runtime.rafPinch = runtime.pendingPinch ? frame : null
  }

  function flushInteractionFrames() {
    const runtime = getRuntime()
    const point = runtime.pendingDragPoint
    const pinch = runtime.pendingPinch
    if (runtime.rafDrag !== null) runtime.window?.cancelAnimationFrame(runtime.rafDrag)
    if (runtime.rafPinch !== null) runtime.window?.cancelAnimationFrame(runtime.rafPinch)
    runtime.rafDrag = null
    runtime.rafPinch = null
    runtime.pendingDragPoint = null
    runtime.pendingPinch = null
    runtime.releaseRequests = {}
    if (pinch) applyPinch(pinch)
    else if (point) applyDrag(point)
    const completion = runtime.releaseRequests || {}
    runtime.releaseRequests = null
    return completion
  }

  function stopDrag() {
    const runtime = getRuntime()
    const source = runtime.dragInteractionSource
    if (!source) return
    const completion = flushInteractionFrames()
    runtime.touching = false
    runtime.suppressNativeGesture = false
    runtime.dragInteractionSource = null
    runtime.interactionCleanup?.()
    runtime.interactionCleanup = null
    runtime.gestureCleanup?.()
    runtime.gestureCleanup = null
    if (completion.crop || completion.zoom || completion.rotation) {
      runtime.pendingInteractionCompletion = completion
    } else {
      emitCropComplete()
    }
    onInteractionEnd?.({ source })
  }

  function handleDocumentMouseMove(event: MouseEvent) {
    const runtime = getRuntime()
    if (runtime.dragInteractionSource === 'mouse') scheduleDrag(getMousePoint(event))
  }

  function onDocumentMouseMove(event: MouseEvent) {
    interactionHandlersRef.current?.documentMouseMove(event)
  }

  function handleDocumentMouseUp() {
    if (getRuntime().dragInteractionSource === 'mouse') stopDrag()
  }

  function onDocumentMouseUp() {
    interactionHandlersRef.current?.documentMouseUp()
  }

  function handleDocumentTouchMove(event: TouchEvent) {
    const runtime = getRuntime()
    if (runtime.dragInteractionSource !== 'touch') return
    event.preventDefault()
    if (event.touches.length === 2) {
      schedulePinch(event)
    } else if (event.touches.length === 1) {
      scheduleDrag(getTouchPoint(event.touches[0]))
    }
  }

  function onDocumentTouchMove(event: TouchEvent) {
    interactionHandlersRef.current?.documentTouchMove(event)
  }

  function handleDocumentTouchEnd(event: TouchEvent) {
    const runtime = getRuntime()
    if (runtime.dragInteractionSource === 'touch') {
      stopDrag()
      return
    }
    if (
      runtime.suppressNativeGesture &&
      (event.type === 'touchcancel' || event.touches.length === 0)
    ) {
      runtime.suppressNativeGesture = false
      runtime.interactionCleanup?.()
      runtime.interactionCleanup = null
      runtime.gestureCleanup?.()
      runtime.gestureCleanup = null
    }
  }

  function onDocumentTouchEnd(event: TouchEvent) {
    interactionHandlersRef.current?.documentTouchEnd(event)
  }

  function attachDragListeners(source: CropperInteractionSource) {
    const runtime = getRuntime()
    const currentDocument = runtime.document
    if (!currentDocument) return false
    runtime.interactionCleanup?.()
    if (source === 'mouse') {
      currentDocument.addEventListener('mousemove', onDocumentMouseMove)
      currentDocument.addEventListener('mouseup', onDocumentMouseUp)
      runtime.interactionCleanup = () => {
        currentDocument.removeEventListener('mousemove', onDocumentMouseMove)
        currentDocument.removeEventListener('mouseup', onDocumentMouseUp)
      }
    } else {
      currentDocument.addEventListener('touchmove', onDocumentTouchMove, { passive: false })
      currentDocument.addEventListener('touchend', onDocumentTouchEnd)
      currentDocument.addEventListener('touchcancel', onDocumentTouchEnd)
      runtime.interactionCleanup = () => {
        currentDocument.removeEventListener('touchmove', onDocumentTouchMove)
        currentDocument.removeEventListener('touchend', onDocumentTouchEnd)
        currentDocument.removeEventListener('touchcancel', onDocumentTouchEnd)
      }
    }
    return true
  }

  function suppressGestureForRejectedTouch() {
    const runtime = getRuntime()
    const currentDocument = runtime.document
    if (!currentDocument) return
    runtime.interactionCleanup?.()
    runtime.suppressNativeGesture = true
    currentDocument.addEventListener('touchend', onDocumentTouchEnd)
    currentDocument.addEventListener('touchcancel', onDocumentTouchEnd)
    runtime.interactionCleanup = () => {
      currentDocument.removeEventListener('touchend', onDocumentTouchEnd)
      currentDocument.removeEventListener('touchcancel', onDocumentTouchEnd)
    }
  }

  function startDrag(point: Point, source: CropperInteractionSource) {
    const runtime = getRuntime()
    if (!attachDragListeners(source)) return false
    saveContainerBounds()
    runtime.dragStartPosition = point
    runtime.dragStartCrop = { ...crop }
    runtime.dragInteractionSource = source
    onInteractionStart?.({ source })
    return true
  }

  function startPinch(event: React.TouchEvent<HTMLDivElement>) {
    const runtime = getRuntime()
    const pointA = getTouchPoint(event.touches[0])
    const pointB = getTouchPoint(event.touches[1])
    runtime.lastPinchDistance = getDistanceBetweenPoints(pointA, pointB)
    runtime.lastPinchRotation = getRotationBetweenPoints(pointA, pointB)
    return startDrag(getCenter(pointA, pointB), 'touch')
  }

  function handleNativeGestureChange(event: GestureEvent) {
    event.preventDefault()
    const runtime = getRuntime()
    if (!runtime.gestureActive || runtime.touching || runtime.suppressNativeGesture) return
    const point = getMousePoint(event)
    runtime.releaseRequests = runtime.gestureRequests || {}
    setNewZoom(runtime.gestureZoomStart - 1 + event.scale, point, true)
    const nextRotation = runtime.gestureRotationStart + event.rotation
    if (onRotationChange && nextRotation !== rotation) {
      runtime.releaseRequests.rotation = { requested: nextRotation, previous: rotation }
      onRotationChange(nextRotation)
    }
    runtime.gestureRequests = runtime.releaseRequests
    runtime.releaseRequests = null
  }

  function onNativeGestureChange(event: GestureEvent) {
    interactionHandlersRef.current?.nativeGestureChange(event)
  }

  function handleNativeGestureEnd(event: GestureEvent) {
    event.preventDefault()
    const runtime = getRuntime()
    const wasActive = runtime.gestureActive
    runtime.gestureActive = false
    runtime.gestureCleanup?.()
    runtime.gestureCleanup = null
    if (wasActive) {
      const completion = runtime.gestureRequests
      if (completion && !interactionCompletionCommitted(completion)) {
        runtime.pendingInteractionCompletion = completion
      } else {
        emitCropComplete()
      }
    }
    runtime.gestureRequests = null
  }

  function onNativeGestureEnd(event: GestureEvent) {
    interactionHandlersRef.current?.nativeGestureEnd(event)
  }

  function attachGestureListeners() {
    const runtime = getRuntime()
    const currentDocument = runtime.document
    if (!currentDocument) return false
    runtime.gestureCleanup?.()
    currentDocument.addEventListener('gesturechange', onNativeGestureChange as EventListener)
    currentDocument.addEventListener('gestureend', onNativeGestureEnd as EventListener)
    runtime.gestureCleanup = () => {
      currentDocument.removeEventListener('gesturechange', onNativeGestureChange as EventListener)
      currentDocument.removeEventListener('gestureend', onNativeGestureEnd as EventListener)
    }
    return true
  }

  const onNativeGestureStart = useEffectEvent((event: GestureEvent) => {
    event.preventDefault()
    const runtime = getRuntime()
    if (!attachGestureListeners()) return
    if (runtime.touching || runtime.suppressNativeGesture) {
      runtime.gestureActive = false
      return
    }
    saveContainerBounds()
    runtime.gestureActive = true
    runtime.gestureRequests = null
    runtime.gestureZoomStart = zoom
    runtime.gestureRotationStart = rotation
  })

  function handleWheelSettled() {
    const runtime = getRuntime()
    runtime.wheelTimer = null
    if (!runtime.wheelActive) return
    runtime.wheelActive = false
    emitCropComplete()
    onInteractionEnd?.({ source: 'wheel' })
  }

  function onWheelSettled() {
    interactionHandlersRef.current?.wheelSettled()
  }

  function restartWheelTimer() {
    const runtime = getRuntime()
    if (!runtime.window) return
    if (runtime.wheelTimer !== null) runtime.window.clearTimeout(runtime.wheelTimer)
    runtime.wheelTimer = runtime.window.setTimeout(onWheelSettled, WHEEL_EMIT_DEBOUNCE_TIME)
  }

  const onNativeWheel = useEffectEvent((event: WheelEvent) => {
    if (!zoomWithScroll) return
    if (onWheelRequest && !onWheelRequest(event)) return

    event.preventDefault()
    const runtime = getRuntime()
    if (!runtime.wheelActive) saveContainerBounds()
    const { pixelY } = normalizeWheel(event)
    const changed = setNewZoom(zoom - (pixelY * zoomSpeed) / 200, getMousePoint(event), true)

    if (changed && !runtime.wheelActive) {
      runtime.wheelActive = true
      onInteractionStart?.({ source: 'wheel' })
    }
    if (runtime.wheelActive) restartWheelTimer()
  })

  function handleResizeSettled() {
    const runtime = getRuntime()
    runtime.resizeTimer = null
    if (
      runtime.pendingCrop ||
      runtime.pendingInteractionCompletion ||
      runtime.pendingInitialCompletion ||
      runtime.pendingLayout
    ) {
      runtime.resizeCompletionDue = true
      return
    }
    emitCropComplete()
  }

  function onResizeSettled() {
    interactionHandlersRef.current?.resizeSettled()
  }

  function scheduleResizeCompletion() {
    const runtime = getRuntime()
    if (!runtime.window) return
    if (runtime.resizeTimer !== null) runtime.window.clearTimeout(runtime.resizeTimer)
    runtime.resizeTimer = runtime.window.setTimeout(onResizeSettled, RESIZE_EMIT_DEBOUNCE_TIME)
  }

  function recomputeLayout(isResize: boolean) {
    const runtime = getRuntime()
    if (!runtime.initialized) return
    runtime.pendingLayout = isResize || runtime.pendingLayout === 'resize' ? 'resize' : 'props'
    const previousCropSize = runtime.previousCropSize
    const measurement = measure()
    if (!measurement) return
    const resize = runtime.pendingLayout === 'resize'
    runtime.pendingLayout = null
    const nextCropSize = measurement.cropSize
    let adjustedCrop = crop

    if (measurement.cropSizeChanged && previousCropSize?.width && previousCropSize.height) {
      adjustedCrop = {
        x: crop.x * (nextCropSize.width / previousCropSize.width),
        y: crop.y * (nextCropSize.height / previousCropSize.height),
      }
    }
    runtime.previousCropSize = nextCropSize

    const requestedCorrection = requestRestrictedCrop(adjustedCrop)
    if (!requestedCorrection) emitCropAreaChange()
    if (resize) scheduleResizeCompletion()
  }

  const onExternalResize = useEffectEvent(() => {
    recomputeLayout(true)
  })

  function initializeMedia() {
    const runtime = getRuntime()
    runtime.pendingLayout = 'initial'
    const measurement = measure()
    if (!measurement) return
    runtime.pendingLayout = null

    runtime.loadedMediaSignature = mediaSignature
    runtime.initialized = true
    runtime.previousCropSize = measurement.cropSize
    runtime.lastAreaKey = null
    runtime.pendingCrop = null
    runtime.pendingInitialCompletion = null
    onMediaLoaded?.(runtime.mediaSize)

    const restored = initialCroppedAreaPercentages
      ? getInitialCropFromCroppedAreaPercentages(
          initialCroppedAreaPercentages,
          runtime.mediaSize,
          rotation,
          measurement.cropSize,
          minZoom,
          maxZoom
        )
      : initialCroppedAreaPixels
      ? getInitialCropFromCroppedAreaPixels(
          initialCroppedAreaPixels,
          runtime.mediaSize,
          rotation,
          measurement.cropSize,
          minZoom,
          maxZoom
        )
      : null

    if (restored) {
      const completion: PendingInteractionCompletion = {
        crop: { requested: restored.crop, previous: crop },
        zoom: { requested: onZoomChange ? restored.zoom : zoom, previous: zoom },
      }
      runtime.pendingInitialCompletion = interactionCompletionCommitted(completion)
        ? null
        : completion
      onCropChange(restored.crop)
      onZoomChange?.(restored.zoom)
      if (runtime.pendingInitialCompletion) return
    } else if (requestRestrictedCrop(crop)) {
      runtime.pendingInitialCompletion = { crop: runtime.pendingCrop || undefined }
      return
    }

    // Let onMediaLoaded's controlled updates commit before publishing the initial crop.
    runtime.pendingInitialCompletion = {}
    setUi((current) => ({ ...current }))
  }

  const onMountedImageReady = useEffectEvent(() => {
    const runtime = getRuntime()
    const media = runtime.media
    if (
      media?.tagName === 'IMG' &&
      (media as HTMLImageElement).complete &&
      runtime.loadedMediaSignature !== mediaSignature
    ) {
      initializeMedia()
    }
  })

  function synchronizeInputs(signature: string) {
    const runtime = getRuntime()
    const next = getCommittedInputs(signature)
    const previous = runtime.committedInputs
    runtime.committedInputs = next

    if (!previous) return
    if (previous.mediaSignature !== signature) {
      cancelTransientWork()
      runtime.initialized = false
      runtime.loadedMediaSignature = null
      runtime.lastAreaKey = null
      runtime.containerRect = null
      runtime.mediaSize = EMPTY_MEDIA_SIZE
      runtime.cropSize = null
      runtime.previousCropSize = null
      runtime.lastNotifiedMediaSize = null
      runtime.lastNotifiedCropSize = null
      const resetObjectFit = objectFit === 'cover' ? 'horizontal-cover' : objectFit
      setUi((current) =>
        current.cropSize === null && current.mediaObjectFit === resetObjectFit
          ? current
          : { cropSize: null, mediaObjectFit: resetObjectFit }
      )
      if (runtime.media?.tagName === 'VIDEO') {
        ;(runtime.media as HTMLVideoElement).load()
      }
      return
    }
    if (!runtime.initialized) {
      if (runtime.pendingLayout === 'initial') initializeMedia()
      return
    }

    const measurementInputsChanged =
      previous.rotation !== rotation ||
      previous.aspect !== aspect ||
      previous.objectFit !== objectFit ||
      !sizesEqual(previous.cropSize, requestedCropSize)
    const cropInputsChanged =
      !pointsEqual(previous.crop, crop) ||
      previous.zoom !== zoom ||
      measurementInputsChanged ||
      previous.restrictPosition !== shouldRestrictPosition

    // Record work before any controlled correction can defer this commit.
    if (measurementInputsChanged && !runtime.pendingLayout) runtime.pendingLayout = 'props'
    runtime.cropSyncDue = runtime.cropSyncDue || cropInputsChanged
    runtime.zoomBoundsCheckDue =
      runtime.zoomBoundsCheckDue || previous.minZoom !== minZoom || previous.maxZoom !== maxZoom
    if (
      (measurementInputsChanged || previous.zoom !== zoom) &&
      !runtime.dragInteractionSource &&
      !runtime.wheelActive &&
      !runtime.gestureActive &&
      runtime.keyboardKeys.size === 0 &&
      !runtime.pendingInteractionCompletion &&
      !runtime.pendingInitialCompletion &&
      runtime.resizeTimer === null &&
      !runtime.resizeCompletionDue
    ) {
      runtime.externalCompletionDue = true
    }
    if (
      runtime.pendingInitialCompletion &&
      !interactionCompletionCommitted(runtime.pendingInitialCompletion)
    )
      return

    const pendingCrop = runtime.pendingCrop
    if (pendingCrop) {
      if (pointsEqual(crop, pendingCrop.requested) || !pointsEqual(crop, pendingCrop.previous)) {
        runtime.pendingCrop = null
      } else {
        return
      }
    }

    if (runtime.zoomBoundsCheckDue && onZoomChange) {
      runtime.zoomBoundsCheckDue = false
      const restrictedZoom = clamp(zoom, minZoom, maxZoom)
      if (restrictedZoom !== zoom) {
        runtime.pendingZoom = { requested: restrictedZoom, previous: zoom }
        onZoomChange(restrictedZoom)
        return
      }
      runtime.pendingZoom = null
    }
    if (runtime.pendingZoom) {
      if (zoom === runtime.pendingZoom.previous) return
      runtime.pendingZoom = null
    }

    if (runtime.pendingLayout) {
      recomputeLayout(runtime.pendingLayout === 'resize')
      if (runtime.pendingLayout) return
      runtime.cropSyncDue = false
    } else if (runtime.cropSyncDue) {
      runtime.cropSyncDue = false
      if (requestRestrictedCrop(crop)) return
      emitCropAreaChange()
    }
    if (runtime.pendingCrop) return

    let completionDue = false
    if (runtime.pendingInitialCompletion) {
      runtime.pendingInitialCompletion = null
      emitCropAreaChange()
      completionDue = true
    }
    if (runtime.resizeCompletionDue) {
      runtime.resizeCompletionDue = false
      completionDue = true
    }
    const interactionCompletion = runtime.pendingInteractionCompletion
    if (interactionCompletion && interactionCompletionCommitted(interactionCompletion)) {
      runtime.pendingInteractionCompletion = null
      completionDue = true
    }
    if (runtime.externalCompletionDue && !runtime.pendingInteractionCompletion) {
      runtime.externalCompletionDue = false
      completionDue = true
    }
    if (completionDue) emitCropComplete()
  }

  const onDocumentScroll = useEffectEvent((event: Event) => {
    event.preventDefault()
    saveContainerBounds()
  })

  function setContainerElement(element: HTMLDivElement | null) {
    const runtime = getRuntime()
    if (!element) {
      runtime.container = null
      runtime.containerRect = null
      runtime.document = null
      runtime.window = null
      assignRef(ref, null)
      return
    }
    runtime.container = element
    runtime.document = element.ownerDocument
    runtime.window = element.ownerDocument.defaultView
    const refCleanup = assignRef(ref, element)
    return () => cleanupAssignedRef(ref, refCleanup, element)
  }

  function setMediaElement<T extends HTMLImageElement | HTMLVideoElement>(
    element: T | null,
    tagName: 'IMG' | 'VIDEO'
  ) {
    const runtime = getRuntime()
    if (!element) {
      if (runtime.media?.tagName === tagName) runtime.media = null
      assignRef(mediaRef, null)
      return
    }
    runtime.media = element
    const refCleanup = assignRef(mediaRef, element)
    return () => {
      if (runtime.media === element) runtime.media = null
      cleanupAssignedRef(mediaRef, refCleanup, element)
    }
  }

  function setImageElement(element: HTMLImageElement | null) {
    return setMediaElement(element, 'IMG')
  }

  function setVideoElement(element: HTMLVideoElement | null) {
    return setMediaElement(element, 'VIDEO')
  }

  function setCropAreaElement(element: HTMLDivElement | null) {
    if (!element) {
      assignRef(cropAreaRef, null)
      return
    }
    const refCleanup = assignRef(cropAreaRef, element)
    return () => cleanupAssignedRef(cropAreaRef, refCleanup, element)
  }

  function onMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault()
    startDrag(getMousePoint(event), 'mouse')
  }

  function onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1 && event.touches.length !== 2) return
    if (onTouchRequest && !onTouchRequest(event)) {
      suppressGestureForRejectedTouch()
      return
    }
    const runtime = getRuntime()
    runtime.suppressNativeGesture = false
    runtime.touching =
      event.touches.length === 2
        ? startPinch(event)
        : startDrag(getTouchPoint(event.touches[0]), 'touch')
  }

  function onMediaLoad() {
    initializeMedia()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const runtime = getRuntime()
    if (!runtime.initialized || !runtime.cropSize) return
    const delta = ARROW_DELTAS[event.key]
    if (!delta) return
    const step = event.shiftKey ? keyboardStep * 0.2 : keyboardStep
    const nextCrop = {
      x: crop.x + delta.x * step,
      y: crop.y + delta.y * step,
    }
    event.preventDefault()
    const restrictedCrop = shouldRestrictPosition
      ? restrictPosition(nextCrop, runtime.mediaSize, runtime.cropSize, zoom, rotation)
      : nextCrop
    if (pointsEqual(restrictedCrop, crop)) return
    const interactionWasInactive = runtime.keyboardKeys.size === 0
    runtime.keyboardKeys.add(event.key)
    if (interactionWasInactive) {
      onInteractionStart?.({ source: 'keyboard' })
    }
    onCropChange(restrictedCrop)
  }

  function onKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
    const runtime = getRuntime()
    if (!ARROW_DELTAS[event.key]) return
    event.preventDefault()
    if (!runtime.keyboardKeys.delete(event.key)) return
    if (runtime.keyboardKeys.size > 0) return
    emitCropComplete()
    onInteractionEnd?.({ source: 'keyboard' })
  }

  React.useEffect(() => {
    const runtime = getRuntime()
    const container = runtime.container
    if (!container) return

    const currentDocument = container.ownerDocument
    const currentWindow = currentDocument.defaultView
    if (!currentWindow) return
    runtime.document = currentDocument
    runtime.window = currentWindow

    let ignoreInitialResize = true
    if (currentWindow.ResizeObserver) {
      runtime.resizeObserver = new currentWindow.ResizeObserver(() => {
        if (ignoreInitialResize) {
          ignoreInitialResize = false
          return
        }
        onExternalResize()
      })
      runtime.resizeObserver.observe(container)
    } else {
      currentWindow.addEventListener('resize', onExternalResize)
    }

    container.addEventListener('wheel', onNativeWheel, { passive: false })
    container.addEventListener('gesturestart', onNativeGestureStart as EventListener)
    currentDocument.addEventListener('scroll', onDocumentScroll)
    onMountedImageReady()

    return () => {
      runtime.resizeObserver?.disconnect()
      runtime.resizeObserver = null
      currentWindow.removeEventListener('resize', onExternalResize)
      container.removeEventListener('wheel', onNativeWheel)
      container.removeEventListener('gesturestart', onNativeGestureStart as EventListener)
      currentDocument.removeEventListener('scroll', onDocumentScroll)
      cancelExternalWorkEvent()
      runtime.container = null
      runtime.media = null
      runtime.containerRect = null
      runtime.document = null
      runtime.window = null
    }
  }, [])

  useSafeLayoutEffect(() => {
    interactionHandlersRef.current = {
      dragAnimationFrame: handleDragAnimationFrame,
      pinchAnimationFrame: handlePinchAnimationFrame,
      documentMouseMove: handleDocumentMouseMove,
      documentMouseUp: handleDocumentMouseUp,
      documentTouchMove: handleDocumentTouchMove,
      documentTouchEnd: handleDocumentTouchEnd,
      nativeGestureChange: handleNativeGestureChange,
      nativeGestureEnd: handleNativeGestureEnd,
      wheelSettled: handleWheelSettled,
      resizeSettled: handleResizeSettled,
    }
    synchronizeInputs(mediaSignature)
  })

  return {
    cropSize: ui.cropSize,
    mediaObjectFit: ui.mediaObjectFit,
    setContainerElement,
    setImageElement,
    setVideoElement,
    setCropAreaElement,
    onMouseDown,
    onTouchStart,
    onMediaLoad,
    onKeyDown,
    onKeyUp,
  }
}
