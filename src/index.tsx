import React from 'react'
import { Container, CropArea, Img, Video } from './styles'
import { Area, MediaSize, Point, Size } from './types'
import {
  getCropSize,
  restrictPosition,
  getDistanceBetweenPoints,
  getRotationBetweenPoints,
  computeCroppedArea,
  getCenter,
  getInitialCropFromCroppedAreaPixels,
} from './helpers'

type Props = {
  image?: string
  video?: string
  crop: Point
  zoom: number
  rotation: number
  aspect: number
  minZoom: number
  maxZoom: number
  cropShape: 'rect' | 'round'
  cropSize?: Size
  showGrid?: boolean
  zoomSpeed: number
  crossOrigin?: string
  onCropChange: (location: Point) => void
  onZoomChange?: (zoom: number) => void
  onRotationChange?: (rotation: number) => void
  onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  onMediaError?:
    | ((event: React.SyntheticEvent<HTMLImageElement, Event>) => void)
    | ((event: React.SyntheticEvent<HTMLVideoElement, Event>) => void)
  onMediaLoaded?: (mediaSize: MediaSize) => void
  style: {
    containerStyle?: React.CSSProperties
    mediaStyle?: React.CSSProperties
    cropAreaStyle?: React.CSSProperties
  }
  classes: {
    containerClassName?: string
    mediaClassName?: string
    cropAreaClassName?: string
  }
  restrictPosition: boolean
  initialCroppedAreaPixels?: Area
  mediaProps: Record<string, any>
}

type State = {
  cropSize: Size | null
  hasWheelJustStarted: boolean
}

const MIN_ZOOM = 1
const MAX_ZOOM = 3

// this is to prevent Safari on iOS >= 10 to zoom the page
const preventZoomSafari = (e: Event) => e.preventDefault()

const getMousePoint = (e: MouseEvent | React.MouseEvent) => ({
  x: Number(e.clientX),
  y: Number(e.clientY),
})

const getTouchPoint = (touch: Touch | React.Touch) => ({
  x: Number(touch.clientX),
  y: Number(touch.clientY),
})

const getPointOnContainer = ({ x, y }: Point, containerRect: DOMRect | null) => {
  if (!containerRect) {
    throw new Error('The Cropper is not mounted')
  }
  return {
    x: containerRect.width / 2 - (x - containerRect.left),
    y: containerRect.height / 2 - (y - containerRect.top),
  }
}

const getPointOnMedia = ({ x, y }: Point, crop: Point, zoom: number) => {
  return {
    x: (x + crop.x) / zoom,
    y: (y + crop.y) / zoom,
  }
}

const Cropper = (props: Props) => {
  const [mediaSize, setMediaSize] = React.useState<MediaSize>({
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
  })
  const [cropSize, setCropSize] = React.useState<Size | null>(null)
  const [containerRect, setContainerRect] = React.useState<DOMRect | null>(null)
  const [dragStartPosition, setDragStartPosition] = React.useState<Point>({ x: 0, y: 0 })
  const [dragStartCrop, setDragCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [lastPinchDistance, setLastPinchDistance] = React.useState(0)
  const [lastPinchRotation, setLastPinchRotation] = React.useState(0)
  const [hasWheelJustStarted, setHasWheelJustStarted] = React.useState(false)
  const [wheelTimer, setWheelTimer] = React.useState<number | null>(null)
  const [rafDragTimeout, setRafDragTimeout] = React.useState<number | null>(null)
  const [rafPinchTimeout, setRafPinchTimeout] = React.useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const imageRef = React.useRef<HTMLImageElement | null>(null)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)

  const setInitialCrop = React.useCallback(() => {
    if (!props.initialCroppedAreaPixels) {
      return
    }

    const { crop, zoom } = getInitialCropFromCroppedAreaPixels(
      props.initialCroppedAreaPixels,
      mediaSize,
      props.cropSize
    )
    props.onCropChange(crop)
    props.onZoomChange?.(zoom)
  }, [mediaSize, props])

  const getAspect = React.useCallback(() => {
    if (props.cropSize) {
      return props.cropSize.width / props.cropSize.height
    }
    return props.aspect
  }, [props.aspect, props.cropSize])

  const computeSizes = React.useCallback(() => {
    const media = imageRef.current || videoRef.current
    if (media) {
      setMediaSize({
        width: media.offsetWidth,
        height: media.offsetHeight,
        naturalWidth: imageRef.current?.naturalWidth || videoRef.current?.videoWidth || 0,
        naturalHeight: imageRef.current?.naturalHeight || videoRef.current?.videoHeight || 0,
      })
      const cropSize = props.cropSize
        ? props.cropSize
        : getCropSize(media.offsetWidth, media.offsetHeight, props.aspect, props.rotation)
      setCropSize(cropSize)
    }
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect())
    }
  }, [props.cropSize, props.aspect, props.rotation])

  const emitCropData = React.useCallback(() => {
    if (!cropSize) return
    // this is to ensure the crop is correctly restricted after a zoom back (https://github.com/ricardo-ch/react-easy-crop/issues/6)
    const restrictedPosition = props.restrictPosition
      ? restrictPosition(props.crop, mediaSize, cropSize, props.zoom, props.rotation)
      : props.crop
    const { croppedAreaPercentages, croppedAreaPixels } = computeCroppedArea(
      restrictedPosition,
      mediaSize,
      cropSize,
      getAspect(),
      props.zoom,
      props.rotation,
      props.restrictPosition
    )
    props.onCropComplete?.(croppedAreaPercentages, croppedAreaPixels)
  }, [
    cropSize,
    getAspect,
    mediaSize,
    props.crop,
    props.onCropComplete,
    props.restrictPosition,
    props.rotation,
    props.zoom,
  ])

  const onMediaLoad = React.useCallback(() => {
    computeSizes()
    emitCropData()
    setInitialCrop()

    if (props.onMediaLoaded) {
      props.onMediaLoaded(mediaSize)
    }
  }, [computeSizes, emitCropData, mediaSize, props, setInitialCrop])

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onDragStopped)
    onDragStart(getMousePoint(e))
  }

  const onMouseMove = (e: MouseEvent) => onDrag(getMousePoint(e))

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    document.addEventListener('touchmove', onTouchMove, { passive: false }) // iOS 11 now defaults to passive: true
    document.addEventListener('touchend', onDragStopped)
    if (e.touches.length === 2) {
      onPinchStart(e)
    } else if (e.touches.length === 1) {
      onDragStart(getTouchPoint(e.touches[0]))
    }
  }

  const onTouchMove = (e: TouchEvent) => {
    // Prevent whole page from scrolling on iOS.
    e.preventDefault()
    if (e.touches.length === 2) {
      onPinchMove(e)
    } else if (e.touches.length === 1) {
      onDrag(getTouchPoint(e.touches[0]))
    }
  }

  const onDragStart = ({ x, y }: Point) => {
    setDragStartPosition({ x, y })
    setDragCrop({ ...props.crop })
    props.onInteractionStart?.()
  }

  const onDrag = ({ x, y }: Point) => {
    if (rafDragTimeout) window.cancelAnimationFrame(rafDragTimeout)

    const timeout = window.requestAnimationFrame(() => {
      if (!cropSize) return
      if (x === undefined || y === undefined) return
      const offsetX = x - dragStartPosition.x
      const offsetY = y - dragStartPosition.y
      const requestedPosition = {
        x: dragStartCrop.x + offsetX,
        y: dragStartCrop.y + offsetY,
      }

      const newPosition = props.restrictPosition
        ? restrictPosition(requestedPosition, mediaSize, cropSize, props.zoom, props.rotation)
        : requestedPosition
      props.onCropChange(newPosition)
    })
    setRafDragTimeout(timeout)
  }

  const cleanEvents = React.useCallback(() => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onDragStopped)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onDragStopped)
  }, [onDragStopped, onMouseMove, onTouchMove])

  const onDragStopped = React.useCallback(() => {
    cleanEvents()
    emitCropData()
    props.onInteractionEnd?.()
  }, [cleanEvents, emitCropData, props.onInteractionEnd])

  const onPinchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const pointA = getTouchPoint(e.touches[0])
    const pointB = getTouchPoint(e.touches[1])
    setLastPinchDistance(getDistanceBetweenPoints(pointA, pointB))
    setLastPinchRotation(getRotationBetweenPoints(pointA, pointB))
    onDragStart(getCenter(pointA, pointB))
  }

  const onPinchMove = (e: TouchEvent) => {
    const pointA = getTouchPoint(e.touches[0])
    const pointB = getTouchPoint(e.touches[1])
    const center = getCenter(pointA, pointB)
    onDrag(center)

    if (rafPinchTimeout) window.cancelAnimationFrame(rafPinchTimeout)
    const timeout = window.requestAnimationFrame(() => {
      const distance = getDistanceBetweenPoints(pointA, pointB)
      const newZoom = props.zoom * (distance / lastPinchDistance)
      setNewZoom(newZoom, center)
      setLastPinchDistance(distance)

      const rotation = getRotationBetweenPoints(pointA, pointB)
      const newRotation = props.rotation + (rotation - lastPinchRotation)
      props.onRotationChange && props.onRotationChange(newRotation)
      setLastPinchRotation(rotation)
    })
    setRafPinchTimeout(timeout)
  }

  const setNewZoom = React.useCallback(
    (zoom: number, point: Point) => {
      if (!cropSize) return

      const zoomPoint = getPointOnContainer(point, containerRect)
      const zoomTarget = getPointOnMedia(zoomPoint, props.crop, props.zoom)
      const newZoom = Math.min(props.maxZoom, Math.max(zoom, props.minZoom))
      const requestedPosition = {
        x: zoomTarget.x * newZoom - zoomPoint.x,
        y: zoomTarget.y * newZoom - zoomPoint.y,
      }
      const newPosition = props.restrictPosition
        ? restrictPosition(requestedPosition, mediaSize, cropSize, newZoom, props.rotation)
        : requestedPosition

      props.onCropChange(newPosition)
      props.onZoomChange?.(newZoom)
    },
    [containerRect, cropSize, mediaSize, props]
  )

  const onWheel = React.useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const point = getMousePoint(e)
      const newZoom = props.zoom - (e.deltaY * props.zoomSpeed) / 200
      setNewZoom(newZoom, point)

      if (!hasWheelJustStarted) {
        setHasWheelJustStarted(true)
        props.onInteractionStart?.()
      }

      if (wheelTimer) {
        clearTimeout(wheelTimer)
      }
      const timer = window.setTimeout(() => {
        setHasWheelJustStarted(false)
        props.onInteractionEnd?.()
      }, 250)
      setWheelTimer(timer)
    },
    [
      props.zoom,
      props.zoomSpeed,
      props.onInteractionStart,
      props.onInteractionEnd,
      setNewZoom,
      hasWheelJustStarted,
      wheelTimer,
    ]
  )

  const recomputeCropPosition = React.useCallback(() => {
    if (!cropSize) return

    const newPosition = props.restrictPosition
      ? restrictPosition(props.crop, mediaSize, cropSize, props.zoom, props.rotation)
      : props.crop
    props.onCropChange(newPosition)
    emitCropData()
  }, [cropSize, emitCropData, mediaSize, props])

  // mount effect
  React.useEffect(() => {
    const containerElement = containerRef.current
    window.addEventListener('resize', computeSizes)
    if (containerElement) {
      containerElement.addEventListener('wheel', onWheel, { passive: false })
      containerElement.addEventListener('gesturestart', preventZoomSafari)
      containerElement.addEventListener('gesturechange', preventZoomSafari)
    }

    // when rendered via SSR, the image can already be loaded and its onLoad callback will never be called
    if (imageRef.current && imageRef.current.complete) {
      onMediaLoad()
    }

    return () => {
      window.removeEventListener('resize', computeSizes)
      if (containerElement) {
        containerElement.removeEventListener('wheel', onWheel)
        containerElement.removeEventListener('gesturestart', preventZoomSafari)
        containerElement.removeEventListener('gesturechange', preventZoomSafari)
      }
      cleanEvents()
      if (wheelTimer) {
        clearTimeout(wheelTimer)
      }
    }
  }, [cleanEvents, computeSizes, onMediaLoad, onWheel, wheelTimer])

  React.useEffect(() => {
    recomputeCropPosition()
  }, [cropSize, recomputeCropPosition])

  const {
    image,
    video,
    mediaProps,
    crop: { x, y },
    rotation,
    zoom,
    cropShape,
    showGrid,
    style: { containerStyle, cropAreaStyle, mediaStyle },
    classes: { containerClassName, cropAreaClassName, mediaClassName },
    crossOrigin,
  } = props

  return (
    <Container
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      ref={containerRef}
      data-testid="container"
      style={containerStyle}
      className={containerClassName}
    >
      {image ? (
        <Img
          src={image}
          ref={imageRef}
          onLoad={onMediaLoad}
          onError={props.onMediaError}
          alt=""
          style={{
            ...mediaStyle,
            transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${zoom})`,
          }}
          className={mediaClassName}
          crossOrigin={crossOrigin}
          {...mediaProps}
        />
      ) : (
        video && (
          <Video
            autoPlay
            loop
            muted={true}
            src={video}
            ref={videoRef}
            onLoadedMetadata={onMediaLoad}
            onError={props.onMediaError}
            alt=""
            style={{
              ...mediaStyle,
              transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${zoom})`,
            }}
            className={mediaClassName}
            crossOrigin={crossOrigin}
            {...mediaProps}
            controls={false}
          />
        )
      )}
      {cropSize && (
        <CropArea
          cropShape={cropShape}
          showGrid={showGrid}
          style={{
            ...cropAreaStyle,
            width: cropSize.width,
            height: cropSize.height,
          }}
          data-testid="cropper"
          className={cropAreaClassName}
        />
      )}
    </Container>
  )
}

Cropper.defaultProps = {
  zoom: 1,
  rotation: 0,
  aspect: 4 / 3,
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  cropShape: 'rect',
  showGrid: true,
  style: {},
  classes: {},
  mediaProps: {},
  zoomSpeed: 1,
  restrictPosition: true,
}

export default Cropper
