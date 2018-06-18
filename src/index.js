import React from 'react'
import { Container, Img, CropArea } from './styles'

const DEFAULT_ASPECT = 4 / 3
const MIN_ZOOM = 1
const MAX_ZOOM = 3

class Cropper extends React.Component {
  image = null
  imageSize = { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }
  dragStartPosition = { x: 0, y: 0 }
  dragStartCrop = { x: 0, y: 0 }
  rafTimeout = null
  state = {
    cropSize: null,
  }

  componentDidMount() {
    window.addEventListener('resize', this.computeSizes)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.computeSizes)
    this.cleanEvents()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.zoom !== this.props.zoom) {
      this.recomputeCropPosition()
    }
  }

  cleanEvents = () => {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('touchmove', this.onDrag)
    document.removeEventListener('mouseup', this.dragStopped)
    document.removeEventListener('touchend', this.dragStopped)
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
      const aspect = this.props.aspect || DEFAULT_ASPECT
      let cropSize
      if (this.image.width >= this.image.height * aspect) {
        cropSize = {
          width: this.image.height * aspect,
          height: this.image.height,
        }
      } else {
        cropSize = {
          width: this.image.width,
          height: this.image.width / aspect,
        }
      }
      this.setState({ cropSize }, this.recomputeCropPosition)
    }
  }

  static getEventXY = e => ({
    x: Number(e.clientX || (e.touches && e.touches[0].clientX)),
    y: Number(e.clientY || (e.touches && e.touches[0].clientY)),
  })

  dragStart = e => {
    e.preventDefault()
    const { x, y } = Cropper.getEventXY(e)
    this.dragStartPosition = { x, y }
    this.dragStartCrop = { x: this.props.crop.x, y: this.props.crop.y }
    document.addEventListener('mousemove', this.onDrag)
    document.addEventListener('touchmove', this.onDrag)
    document.addEventListener('mouseup', this.dragStopped)
    document.addEventListener('touchend', this.dragStopped)
  }

  onDrag = e => {
    if (this.rafTimeout) window.cancelAnimationFrame(this.rafTimeout)

    this.rafTimeout = window.requestAnimationFrame(() => {
      const { x, y } = Cropper.getEventXY(e)
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

  dragStopped = () => {
    this.cleanEvents()
    this.emitCropData()
  }

  onWheel = e => {
    e.preventDefault()
    let newZoom = this.props.zoom - e.deltaY / 200
    newZoom = Math.min(MAX_ZOOM, Math.max(newZoom, MIN_ZOOM))
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
      <Container onMouseDown={this.dragStart} onTouchStart={this.dragStart} onWheel={this.onWheel}>
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
          />
        )}
      </Container>
    )
  }
}

export default Cropper
