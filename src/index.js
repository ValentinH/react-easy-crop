import React from 'react'
import {
  getCropSize,
  restrictPosition,
  getDistanceBetweenPoints,
  getRotationBetweenPoints,
  computeCroppedArea,
  getCenter,
  getInitialCropFromCroppedAreaPixels,
} from './helpers'
import { Container, Img, CropArea, Video } from './styles'

const MIN_ZOOM = 1
const MAX_ZOOM = 3

class Cropper extends React.Component {
  media = null
  container = null
  containerRect = {}
  mediaSize = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }
  dragStartPosition = { x: 0, y: 0 }
  dragStartCrop = { x: 0, y: 0 }
  lastPinchDistance = 0
  lastPinchRotation = 0
  rafDragTimeout = null
  rafPinchTimeout = null
  state = {
    cropSize: null,
    hasWheelJustStarted: false,
  }

  componentDidMount() {
    window.addEventListener('resize', this.computeSizes)
    this.container.addEventListener('wheel', this.onWheel, { passive: false })
    this.container.addEventListener('gesturestart', this.preventZoomSafari)
    this.container.addEventListener('gesturechange', this.preventZoomSafari)

    // when rendered via SSR, the media can already be loaded and its onLoad callback will never be called
    if (this.media && this.media.complete) {
      this.onMediaLoad()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeSizes)
    this.container.removeEventListener('wheel', this.onWheel)
    this.container.removeEventListener('gesturestart', this.preventZoomSafari)
    this.container.removeEventListener('gesturechange', this.preventZoomSafari)
    this.cleanEvents()
    clearTimeout(this.wheelTimer)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rotation !== this.props.rotation) {
      this.computeSizes()
      this.recomputeCropPosition()
    } else if (prevProps.aspect !== this.props.aspect) {
      this.computeSizes()
    } else if (prevProps.zoom !== this.props.zoom) {
      this.recomputeCropPosition()
    }
  }

  // this is to prevent Safari on iOS >= 10 to zoom the page
  preventZoomSafari = e => e.preventDefault()

  cleanEvents = () => {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onDragStopped)
    document.removeEventListener('touchmove', this.onTouchMove)
    document.removeEventListener('touchend', this.onDragStopped)
  }

  onMediaLoad = () => {
    this.computeSizes()
    this.emitCropData()
    this.setInitialCrop()

    if (this.props.onMediaLoaded) {
      this.props.onMediaLoaded(this.mediaSize)
    }

    /* Deprecated */
    if (this.props.onImageLoaded) {
      this.props.onImageLoaded(this.mediaSize)
    }
  }

  setInitialCrop = () => {
    const { initialCroppedAreaPixels, cropSize } = this.props

    if (!initialCroppedAreaPixels) {
      return
    }

    const { crop, zoom } = getInitialCropFromCroppedAreaPixels(
      initialCroppedAreaPixels,
      this.mediaSize,
      cropSize
    )
    this.props.onCropChange(crop)
    this.props.onZoomChange && this.props.onZoomChange(zoom)
  }

  getAspect() {
    const { cropSize, aspect } = this.props
    if (cropSize) {
      return cropSize.width / cropSize.height
    }
    return aspect
  }

  computeSizes = () => {
    if (this.media) {
      this.mediaSize = {
        width: this.media.offsetWidth,
        height: this.media.offsetHeight,
        naturalWidth: this.media.naturalWidth || this.media.videoWidth,
        naturalHeight: this.media.naturalHeight || this.media.videoHeight,
      }
      const cropSize = this.props.cropSize
        ? this.props.cropSize
        : getCropSize(
            this.media.offsetWidth,
            this.media.offsetHeight,
            this.props.aspect,
            this.props.rotation
          )
      this.setState({ cropSize }, this.recomputeCropPosition)
    }
    if (this.container) {
      this.containerRect = this.container.getBoundingClientRect()
    }
  }

  static getMousePoint = e => ({ x: Number(e.clientX), y: Number(e.clientY) })

  static getTouchPoint = touch => ({
    x: Number(touch.clientX),
    y: Number(touch.clientY),
  })

  onMouseDown = e => {
    e.preventDefault()
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onDragStopped)
    this.onDragStart(Cropper.getMousePoint(e))
  }

  onMouseMove = e => this.onDrag(Cropper.getMousePoint(e))

  onTouchStart = e => {
    e.preventDefault()
    document.addEventListener('touchmove', this.onTouchMove, { passive: false }) // iOS 11 now defaults to passive: true
    document.addEventListener('touchend', this.onDragStopped)
    if (e.touches.length === 2) {
      this.onPinchStart(e)
    } else if (e.touches.length === 1) {
      this.onDragStart(Cropper.getTouchPoint(e.touches[0]))
    }
  }

  onTouchMove = e => {
    // Prevent whole page from scrolling on iOS.
    e.preventDefault()
    if (e.touches.length === 2) {
      this.onPinchMove(e)
    } else if (e.touches.length === 1) {
      this.onDrag(Cropper.getTouchPoint(e.touches[0]))
    }
  }

  onDragStart = ({ x, y }) => {
    this.dragStartPosition = { x, y }
    this.dragStartCrop = { x: this.props.crop.x, y: this.props.crop.y }
    this.props.onInteractionStart()
  }

  onDrag = ({ x, y }) => {
    if (!this.state.cropSize) return

    if (this.rafDragTimeout) window.cancelAnimationFrame(this.rafDragTimeout)

    this.rafDragTimeout = window.requestAnimationFrame(() => {
      if (x === undefined || y === undefined) return
      const offsetX = x - this.dragStartPosition.x
      const offsetY = y - this.dragStartPosition.y
      const requestedPosition = {
        x: this.dragStartCrop.x + offsetX,
        y: this.dragStartCrop.y + offsetY,
      }

      const newPosition = this.props.restrictPosition
        ? restrictPosition(
            requestedPosition,
            this.mediaSize,
            this.state.cropSize,
            this.props.zoom,
            this.props.rotation
          )
        : requestedPosition
      this.props.onCropChange(newPosition)
    })
  }

  onDragStopped = () => {
    this.cleanEvents()
    this.emitCropData()
    this.props.onInteractionEnd()
  }

  onPinchStart(e) {
    const pointA = Cropper.getTouchPoint(e.touches[0])
    const pointB = Cropper.getTouchPoint(e.touches[1])
    this.lastPinchDistance = getDistanceBetweenPoints(pointA, pointB)
    this.lastPinchRotation = getRotationBetweenPoints(pointA, pointB)
    this.onDragStart(getCenter(pointA, pointB))
  }

  onPinchMove(e) {
    const pointA = Cropper.getTouchPoint(e.touches[0])
    const pointB = Cropper.getTouchPoint(e.touches[1])
    const center = getCenter(pointA, pointB)
    this.onDrag(center)

    if (this.rafPinchTimeout) window.cancelAnimationFrame(this.rafPinchTimeout)
    this.rafPinchTimeout = window.requestAnimationFrame(() => {
      const distance = getDistanceBetweenPoints(pointA, pointB)
      const newZoom = this.props.zoom * (distance / this.lastPinchDistance)
      this.setNewZoom(newZoom, center)
      this.lastPinchDistance = distance

      const rotation = getRotationBetweenPoints(pointA, pointB)
      const newRotation = this.props.rotation + (rotation - this.lastPinchRotation)
      this.props.onRotationChange && this.props.onRotationChange(newRotation)
      this.lastPinchRotation = rotation
    })
  }

  onWheel = e => {
    e.preventDefault()
    const point = Cropper.getMousePoint(e)
    const newZoom = this.props.zoom - (e.deltaY * this.props.zoomSpeed) / 200
    this.setNewZoom(newZoom, point)

    if (!this.state.hasWheelJustStarted) {
      this.setState({ hasWheelJustStarted: true }, () => this.props.onInteractionStart())
    }

    clearTimeout(this.wheelTimer)
    this.wheelTimer = setTimeout(
      () => this.setState({ hasWheelJustStarted: false }, () => this.props.onInteractionEnd()),
      250
    )
  }

  getPointOnContainer = ({ x, y }, zoom) => {
    if (!this.containerRect) {
      throw new Error('The Cropper is not mounted')
    }
    return {
      x: this.containerRect.width / 2 - (x - this.containerRect.left),
      y: this.containerRect.height / 2 - (y - this.containerRect.top),
    }
  }

  getPointOnMedia = ({ x, y }) => {
    const { crop, zoom } = this.props
    return {
      x: (x + crop.x) / zoom,
      y: (y + crop.y) / zoom,
    }
  }

  setNewZoom = (zoom, point) => {
    if (!this.state.cropSize) return

    const zoomPoint = this.getPointOnContainer(point)
    const zoomTarget = this.getPointOnMedia(zoomPoint)
    const newZoom = Math.min(this.props.maxZoom, Math.max(zoom, this.props.minZoom))
    const requestedPosition = {
      x: zoomTarget.x * newZoom - zoomPoint.x,
      y: zoomTarget.y * newZoom - zoomPoint.y,
    }
    const newPosition = this.props.restrictPosition
      ? restrictPosition(
          requestedPosition,
          this.mediaSize,
          this.state.cropSize,
          newZoom,
          this.props.rotation
        )
      : requestedPosition

    this.props.onCropChange(newPosition)

    this.props.onZoomChange && this.props.onZoomChange(newZoom)
  }

  emitCropData = () => {
    if (!this.state.cropSize) return
    // this is to ensure the crop is correctly restricted after a zoom back (https://github.com/ricardo-ch/react-easy-crop/issues/6)
    const restrictedPosition = this.props.restrictPosition
      ? restrictPosition(
          this.props.crop,
          this.mediaSize,
          this.state.cropSize,
          this.props.zoom,
          this.props.rotation
        )
      : this.props.crop
    const { croppedAreaPercentages, croppedAreaPixels } = computeCroppedArea(
      restrictedPosition,
      this.mediaSize,
      this.state.cropSize,
      this.getAspect(),
      this.props.zoom,
      this.props.rotation,
      this.props.restrictPosition
    )
    this.props.onCropComplete &&
      this.props.onCropComplete(croppedAreaPercentages, croppedAreaPixels)
  }

  recomputeCropPosition = () => {
    const newPosition = this.props.restrictPosition
      ? restrictPosition(
          this.props.crop,
          this.mediaSize,
          this.state.cropSize,
          this.props.zoom,
          this.props.rotation
        )
      : this.props.crop
    this.props.onCropChange(newPosition)
    this.emitCropData()
  }

  render() {
    const {
      image,
      video,
      mediaProps,
      crop: { x, y },
      rotation,
      zoom,
      cropShape,
      showGrid,
      style: { containerStyle, cropAreaStyle, mediaStyle, imageStyle },
      classes: { containerClassName, cropAreaClassName, mediaClassName, imageClassName },
      crossOrigin,
    } = this.props

    // imageStyle and imageClassName are deprecated

    return (
      <Container
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        ref={el => (this.container = el)}
        data-testid="container"
        containerStyle={containerStyle}
        className={containerClassName}
      >
        {image ? (
          <Img
            src={image}
            ref={el => (this.media = el)}
            onLoad={this.onMediaLoad}
            onError={this.props.onMediaError || this.props.onImgError}
            alt=""
            style={{
              transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${zoom})`,
            }}
            mediaStyle={mediaStyle || imageStyle}
            className={mediaClassName || imageClassName}
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
              ref={el => (this.media = el)}
              onLoadedMetadata={this.onMediaLoad}
              onError={this.props.onMediaError}
              alt=""
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${zoom})`,
              }}
              mediaStyle={mediaStyle || imageStyle}
              className={mediaClassName || imageClassName}
              crossOrigin={crossOrigin}
              {...mediaProps}
              controls={false}
            />
          )
        )}
        {this.state.cropSize && (
          <CropArea
            cropShape={cropShape}
            showGrid={showGrid}
            style={{
              width: this.state.cropSize.width,
              height: this.state.cropSize.height,
            }}
            data-testid="cropper"
            cropAreaStyle={cropAreaStyle}
            className={cropAreaClassName}
          />
        )}
      </Container>
    )
  }
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
  crossOrigin: undefined,
  restrictPosition: true,
  onInteractionStart: () => {},
  onInteractionEnd: () => {},
}

export default Cropper
