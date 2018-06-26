import React from 'react'
import { Container, Img, CropArea } from './styles'

const MIN_ZOOM = 1
const MAX_ZOOM = 3

class Cropper extends React.Component {
  image = null
  container = null
  imageSize = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }
  dragStartPosition = { x: 0, y: 0 }
  dragStartCrop = { x: 0, y: 0 }
  lastPinchDistance = 0
  rafTimeout = null
  state = {
    cropSize: null,
  }

  componentDidMount() {
    window.addEventListener('resize', this.computeSizes)
    this.container.addEventListener('gesturestart', this.preventZoomSafari)
    this.container.addEventListener('gesturechange', this.preventZoomSafari)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeSizes)
    this.container.removeEventListener('gesturestart', this.preventZoomSafari)
    this.container.removeEventListener('gesturechange', this.preventZoomSafari)
    this.cleanEvents()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.zoom !== this.props.zoom) {
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

  computeSizes = () => {
    if (this.image) {
      this.imageSize = {
        width: this.image.width,
        height: this.image.height,
        naturalWidth: this.image.naturalWidth,
        naturalHeight: this.image.naturalHeight,
      }
      let cropSize
      if (this.image.width >= this.image.height * this.props.aspect) {
        cropSize = {
          width: this.image.height * this.props.aspect,
          height: this.image.height,
        }
      } else {
        cropSize = {
          width: this.image.width,
          height: this.image.width / this.props.aspect,
        }
      }
      this.setState({ cropSize }, this.recomputeCropPosition)
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
    if (this.rafTimeout) window.cancelAnimationFrame(this.rafTimeout)

    this.rafTimeout = window.requestAnimationFrame(() => {
      if (x === undefined || y === undefined) return
      const offsetX = x - this.dragStartPosition.x
      const offsetY = y - this.dragStartPosition.y

      this.props.onCropChange({
        x: Cropper.restrictDrag(
          this.dragStartCrop.x + offsetX,
          this.imageSize.width,
          this.state.cropSize.width,
          this.props.zoom
        ),
        y: Cropper.restrictDrag(
          this.dragStartCrop.y + offsetY,
          this.imageSize.height,
          this.state.cropSize.height,
          this.props.zoom
        ),
      })
    })
  }

  onDragStopped = () => {
    this.cleanEvents()
    this.emitCropData()
  }

  static getDistanceBetweenPoints = (pointA, pointB) =>
    Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2))

  onPinchStart(e) {
    const pointA = Cropper.getTouchPoint(e.touches[0])
    const pointB = Cropper.getTouchPoint(e.touches[1])
    this.lastPinchDistance = Cropper.getDistanceBetweenPoints(pointA, pointB)
  }

  onPinchMove(e) {
    if (this.rafTimeout) window.cancelAnimationFrame(this.rafTimeout)
    this.rafTimeout = window.requestAnimationFrame(() => {
      const pointA = Cropper.getTouchPoint(e.touches[0])
      const pointB = Cropper.getTouchPoint(e.touches[1])
      const distance = Cropper.getDistanceBetweenPoints(pointA, pointB)

      const newZoom = this.props.zoom * (distance / this.lastPinchDistance)
      this.setNewZoom(newZoom)
      this.lastPinchDistance = distance
    })
  }

  onWheel = e => {
    e.preventDefault()
    const newZoom = this.props.zoom - e.deltaY / 200
    this.setNewZoom(newZoom)
  }

  setNewZoom = zoom => {
    const newZoom = Math.min(MAX_ZOOM, Math.max(zoom, MIN_ZOOM))
    this.props.onZoomChange && this.props.onZoomChange(newZoom)
  }

  static restrictDrag(position, imageSize, cropSize, zoom) {
    const maxDrag = (imageSize * zoom) / 2 - cropSize / 2
    return Math.min(maxDrag, Math.max(position, -maxDrag))
  }

  emitCropData = () => {
    if (!this.state.cropSize) return
    const croppedArea = this.computeCroppedArea()
    const croppedAreaPixels = {
      x: (croppedArea.x * this.imageSize.naturalWidth) / 100,
      y: (croppedArea.y * this.imageSize.naturalHeight) / 100,
      width: (croppedArea.width * this.imageSize.naturalWidth) / 100,
      height: (croppedArea.height * this.imageSize.naturalHeight) / 100,
    }
    this.props.onCropComplete && this.props.onCropComplete(croppedArea, croppedAreaPixels)
  }

  /**
   * Compute the cropped area of the image in percent.
   * x and y are the center coordinates of the crop area.
   */
  computeCroppedArea = () => {
    const {
      crop: { x, y },
      zoom,
    } = this.props
    return {
      x:
        (((this.imageSize.width - this.state.cropSize.width / zoom) / 2 - x / zoom) /
          this.imageSize.width) *
        100,
      y:
        (((this.imageSize.height - this.state.cropSize.height / zoom) / 2 - y / zoom) /
          this.imageSize.height) *
        100,
      width: ((this.state.cropSize.width / this.imageSize.width) * 100) / zoom,
      height: ((this.state.cropSize.height / this.imageSize.height) * 100) / zoom,
    }
  }

  recomputeCropPosition = () => {
    this.props.onCropChange({
      x: Cropper.restrictDrag(
        this.props.crop.x,
        this.imageSize.width,
        this.state.cropSize.width,
        this.props.zoom
      ),
      y: Cropper.restrictDrag(
        this.props.crop.y,
        this.imageSize.height,
        this.state.cropSize.height,
        this.props.zoom
      ),
    })
    this.emitCropData()
  }

  render() {
    const {
      crop: { x, y },
      zoom,
    } = this.props
    return (
      <Container
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        onWheel={this.onWheel}
        innerRef={el => (this.container = el)}
        data-testid="container"
      >
        <Img
          src={this.props.image}
          innerRef={el => (this.image = el)}
          onLoad={this.onImgLoad}
          alt=""
          style={{
            transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          }}
        />
        {this.state.cropSize && (
          <CropArea
            style={{
              width: this.state.cropSize.width,
              height: this.state.cropSize.height,
            }}
            data-testid="cropper"
          />
        )}
      </Container>
    )
  }
}

Cropper.defaultProps = {
  zoom: 1,
  aspect: 4 / 3,
}

export default Cropper
