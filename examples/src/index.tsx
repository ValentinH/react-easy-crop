import queryString from 'query-string'
import React from 'react'
import ReactDOM from 'react-dom'
import Cropper from '../../src/index'
import { Area, Point } from '../../src/types'
import './styles.css'

const urlArgs = queryString.parse(window.location.search)
const imageSrc = typeof urlArgs.img === 'string' ? urlArgs.img : '/images/dog.jpeg' // so we can change the image from our tests

type State = {
  imageSrc: string
  crop: Point
  rotation: number
  flip: { horizontal: boolean; vertical: boolean }
  zoom: number
  aspect: number
  cropShape: 'rect' | 'round'
  showGrid: boolean
  zoomSpeed: number
  restrictPosition: boolean
  croppedArea: Area | null
}

class App extends React.Component<{}, State> {
  state: State = {
    imageSrc,
    crop: { x: 0, y: 0 },
    rotation: 0,
    flip: { horizontal: false, vertical: false },
    zoom: 1,
    aspect: 4 / 3,
    cropShape: 'rect',
    showGrid: true,
    zoomSpeed: 1,
    restrictPosition: true,
    croppedArea: null,
  }

  onCropChange = (crop: Point) => {
    this.setState({ crop })
  }

  onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    console.log(croppedArea, croppedAreaPixels)
    this.setState({ croppedArea })
  }

  onZoomChange = (zoom: number) => {
    this.setState({ zoom })
  }

  onRotationChange = (rotation: number) => {
    this.setState({ rotation })
  }

  onInteractionStart = () => {
    console.log('user interaction started')
  }

  onInteractionEnd = () => {
    console.log('user interaction ended')
  }

  render() {
    return (
      <div className="App">
        <div className="controls">
          <div>
            <label>
              Rotation
              <input
                type="range"
                min={0}
                max={360}
                value={this.state.rotation}
                onChange={({ target: { value: rotation } }) =>
                  this.setState({ rotation: Number(rotation) })
                }
              />
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={this.state.flip.horizontal}
                onChange={() =>
                  this.setState(prev => ({
                    rotation: 360 - prev.rotation,
                    flip: {
                      horizontal: !prev.flip.horizontal,
                      vertical: prev.flip.vertical,
                    },
                  }))
                }
              />
              Flip Horizontal
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.state.flip.vertical}
                onChange={() =>
                  this.setState(prev => ({
                    rotation: 360 - prev.rotation,
                    flip: {
                      horizontal: prev.flip.horizontal,
                      vertical: !prev.flip.vertical,
                    },
                  }))
                }
              />
              Flip Vertical
            </label>
          </div>
          <button
            id="horizontal-center-button"
            onClick={() => {
              this.setState({
                crop: { ...this.state.crop, x: 0 },
              })
            }}
          >
            Center Horizontally
          </button>
          <div>
            <p>Crop Area:</p>
            <div>
              {(['x', 'y', 'width', 'height'] as const).map((attribute) => {
                if (!this.state.croppedArea) {
                  return null
                }

                return (
                  <div key={attribute}>
                    {attribute}:
                    <b id={`crop-area-${attribute}`}>
                      {Math.round(this.state.croppedArea[attribute])}
                    </b>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="crop-container">
          <Cropper
            image={this.state.imageSrc}
            crop={this.state.crop}
            rotation={this.state.rotation}
            zoom={this.state.zoom}
            aspect={this.state.aspect}
            cropShape={this.state.cropShape}
            showGrid={this.state.showGrid}
            zoomSpeed={this.state.zoomSpeed}
            restrictPosition={this.state.restrictPosition}
            onCropChange={this.onCropChange}
            onRotationChange={this.onRotationChange}
            onCropComplete={this.onCropComplete}
            onCropAreaChange={this.onCropComplete}
            onZoomChange={this.onZoomChange}
            onInteractionStart={this.onInteractionStart}
            onInteractionEnd={this.onInteractionEnd}
            initialCroppedAreaPixels={
              !!urlArgs.setInitialCrop ? { width: 699, height: 524, x: 875, y: 157 } : undefined // used to set the initial crop in e2e test
            }
            transform={[
              `translate(${this.state.crop.x}px, ${this.state.crop.y}px)`,
              `rotateZ(${this.state.rotation}deg)`,
              `rotateY(${this.state.flip.horizontal ? 180 : 0}deg)`,
              `rotateX(${this.state.flip.vertical ? 180 : 0}deg)`,
              `scale(${this.state.zoom})`,
            ].join(' ')}
          />
        </div>
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
