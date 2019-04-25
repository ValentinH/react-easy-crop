import React from 'react'
import {
  getCropSize,
  restrictPosition,
  getDistanceBetweenPoints,
  computeCroppedArea,
  getCenter,
} from './helpers'
import { Container, Img, CropArea } from './styles'

const MIN_ZOOM = 1
const MAX_ZOOM = 3

class Cropper extends React.Component {
  image = null
  container = null
  containerRect = {}
  imageSize = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }
  dragStartPosition = { x: 0, y: 0 }
  dragStartCrop = { x: 0, y: 0 }
  lastPinchDistance = 0
  rafDragTimeout = null
  rafZoomTimeout = null
  state = {
    cropSize: null,
  }

  componentDidMount() {
    window.addEventListener('resize', this.computeSizes)
    this.container.addEventListener('wheel', this.onWheel, { passive: false })
    this.container.addEventListener('gesturestart', this.preventZoomSafari)
    this.container.addEventListener('gesturechange', this.preventZoomSafari)

    // when rendered via SSR, the image can already be loaded and its onLoad callback will never be called
    if (this.image && this.image.complete) {
      this.onImgLoad()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeSizes)
    this.container.removeEventListener('wheel', this.onWheel)
    this.container.removeEventListener('gesturestart', this.preventZoomSafari)
    this.container.removeEventListener('gesturechange', this.preventZoomSafari)
    this.cleanEvents()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.aspect !== this.props.aspect) {
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

  onImgLoad = () => {
    this.computeSizes()
    this.emitCropData()
  }

  getAspect() {
    const { cropSize, aspect } = this.props
    if (cropSize) {
      return cropSize.width / cropSize.height
    }
    return aspect
  }

  computeSizes = () => {
    if (this.image) {
      this.imageSize = {
        width: this.image.width,
        height: this.image.height,
        naturalWidth: this.image.naturalWidth,
        naturalHeight: this.image.naturalHeight,
      }
      const cropSize = this.props.cropSize
        ? this.props.cropSize
        : getCropSize(this.image.width, this.image.height, this.props.aspect)
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
  }

  onDrag = ({ x, y }) => {
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
        ? restrictPosition(requestedPosition, this.imageSize, this.state.cropSize, this.props.zoom)
        : requestedPosition
      this.props.onCropChange(newPosition)
    })
  }

  onDragStopped = () => {
    this.cleanEvents()
    this.emitCropData()
  }

  onPinchStart(e) {
    const pointA = Cropper.getTouchPoint(e.touches[0])
    const pointB = Cropper.getTouchPoint(e.touches[1])
    this.lastPinchDistance = getDistanceBetweenPoints(pointA, pointB)
    this.onDragStart(getCenter(pointA, pointB))
  }

  onPinchMove(e) {
    const pointA = Cropper.getTouchPoint(e.touches[0])
    const pointB = Cropper.getTouchPoint(e.touches[1])
    const center = getCenter(pointA, pointB)
    this.onDrag(center)

    if (this.rafZoomTimeout) window.cancelAnimationFrame(this.rafZoomTimeout)
    this.rafZoomTimeout = window.requestAnimationFrame(() => {
      const distance = getDistanceBetweenPoints(pointA, pointB)
      const newZoom = this.props.zoom * (distance / this.lastPinchDistance)
      this.setNewZoom(newZoom, center)
      this.lastPinchDistance = distance
    })
  }

  onWheel = e => {
    e.preventDefault()
    const point = Cropper.getMousePoint(e)
    const newZoom = this.props.zoom - (e.deltaY * this.props.zoomSpeed) / 200
    this.setNewZoom(newZoom, point)
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

  getPointOnImage = ({ x, y }) => {
    const { crop, zoom } = this.props
    return {
      x: (x + crop.x) / zoom,
      y: (y + crop.y) / zoom,
    }
  }

  setNewZoom = (zoom, point) => {
    const zoomPoint = this.getPointOnContainer(point)
    const zoomTarget = this.getPointOnImage(zoomPoint)
    const newZoom = Math.min(this.props.maxZoom, Math.max(zoom, this.props.minZoom))
    const requestedPosition = {
      x: zoomTarget.x * newZoom - zoomPoint.x,
      y: zoomTarget.y * newZoom - zoomPoint.y,
    }
    const newPosition = this.props.restrictPosition
      ? restrictPosition(requestedPosition, this.imageSize, this.state.cropSize, newZoom)
      : requestedPosition

    this.props.onCropChange(newPosition)

    this.props.onZoomChange && this.props.onZoomChange(newZoom)
  }

  emitCropData = () => {
    if (!this.state.cropSize) return
    // this is to ensure the crop is correctly restricted after a zoom back (https://github.com/ricardo-ch/react-easy-crop/issues/6)
    const restrictedPosition = this.props.restrictPosition
      ? restrictPosition(this.props.crop, this.imageSize, this.state.cropSize, this.props.zoom)
      : this.props.crop
    const { croppedAreaPercentages, croppedAreaPixels } = computeCroppedArea(
      restrictedPosition,
      this.imageSize,
      this.state.cropSize,
      this.getAspect(),
      this.props.zoom,
      this.props.restrictPosition
    )
    this.props.onCropComplete &&
      this.props.onCropComplete(croppedAreaPercentages, croppedAreaPixels)
  }

  recomputeCropPosition = () => {
    const newPosition = this.props.restrictPosition
      ? restrictPosition(this.props.crop, this.imageSize, this.state.cropSize, this.props.zoom)
      : this.props.crop
    this.props.onCropChange(newPosition)
    this.emitCropData()
  }

  render() {
    const {
      crop: { x, y },
      zoom,
      cropShape,
      showGrid,
      style: { containerStyle, cropAreaStyle, imageStyle },
      classes: { containerClassName, cropAreaClassName, imageClassName },
      crossOrigin,
    } = this.props

    return (
      <Container
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        ref={el => (this.container = el)}
        data-testid="container"
        containerStyle={containerStyle}
        className={containerClassName}
      >
        <Img
          src={this.props.image}
          ref={el => (this.image = el)}
          onLoad={this.onImgLoad}
          onError={this.props.onImgError}
          alt=""
          style={{
            transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          }}
          imageStyle={imageStyle}
          className={imageClassName}
          crossOrigin={crossOrigin}
        />
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
  aspect: 4 / 3,
  maxZoom: MAX_ZOOM,
  minZoom: MIN_ZOOM,
  cropShape: 'rect',
  showGrid: true,
  style: {},
  classes: {},
  zoomSpeed: 1,
  crossOrigin: undefined,
  restrictPosition: true,
}

export default Cropper
