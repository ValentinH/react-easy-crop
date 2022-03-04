import queryString from 'query-string'
import * as React from 'react'
import ReactDOM from 'react-dom'
import debounce from 'lodash/debounce'
import Cropper from '../../src/index'
import { Area, Point } from '../../src/types'
import './styles.css'

const TEST_IMAGES = {
  '/images/dog.jpeg': 'Landscape',
  '/images/flower.jpeg': 'Portrait',
  '/images/cat.jpeg': 'Small portrait',

  // Photos used in tests, used to verify values:
  '/images/2000x1200.jpeg': '2000x1200',
}

const urlArgs = queryString.parse(window.location.search)
const imageSrcFromQuery =
  typeof urlArgs.img === 'string' ? urlArgs.img : Object.keys(TEST_IMAGES)[0] // so we can change the image from our tests

type HashType = 'percent' | 'pixel'

type State = {
  imageSrc: string
  crop: Point
  rotation: number
  flip: { horizontal: boolean; vertical: boolean }
  hashType: HashType
  zoom: number
  aspect: number
  cropShape: 'rect' | 'round'
  showGrid: boolean
  zoomSpeed: number
  restrictPosition: boolean
  croppedArea: Area | null
  croppedAreaPixels: Area | null
  initialCroppedAreaPercentages: Area | undefined
  initialCroppedAreaPixels: Area | undefined
  requireCtrlKey: boolean
  requireMultiTouch: boolean
}

const hashNames = ['imageSrc', 'hashType', 'x', 'y', 'width', 'height', 'rotation'] as const

const debouncedUpdateHash = debounce(
  ({ hashType, croppedArea, croppedAreaPixels, imageSrc, rotation }: State) => {
    if (hashType === 'percent') {
      if (croppedArea) {
        window.location.hash = `${imageSrc},percent,${croppedArea.x},${croppedArea.y},${croppedArea.width},${croppedArea.height},${rotation}`
      }
    } else {
      if (croppedAreaPixels) {
        window.location.hash = `${imageSrc},pixel,${croppedAreaPixels.x},${croppedAreaPixels.y},${croppedAreaPixels.width},${croppedAreaPixels.height},${rotation}`
      }
    }
  },
  150
)

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)

    let rotation = 0
    let initialCroppedAreaPercentages: Area | undefined = undefined
    let initialCroppedAreaPixels: Area | undefined = undefined
    let hashType: HashType = 'percent'
    let imageSrc = imageSrcFromQuery

    if (window && !urlArgs.setInitialCrop) {
      const hashArray = window.location.hash.slice(1).split(',')

      if (hashArray.length === hashNames.length) {
        const hashInfo = {} as Record<typeof hashNames[number], string>
        hashNames.forEach((key, index) => (hashInfo[key] = hashArray[index]))

        const {
          rotation: rotationFromHash,
          hashType: hashTypeFromHash,
          imageSrc: imageSrcFromHash,
          ...croppedArea
        } = hashInfo

        rotation = parseFloat(rotationFromHash)
        imageSrc = imageSrcFromHash

        // create a new object called parsedCroppedArea with values converted to floats
        const parsedCroppedArea = {
          x: parseFloat(croppedArea.x),
          y: parseFloat(croppedArea.y),
          width: parseFloat(croppedArea.width),
          height: parseFloat(croppedArea.height),
        } as Area

        if (hashTypeFromHash === 'percent') {
          initialCroppedAreaPercentages = parsedCroppedArea
        } else {
          initialCroppedAreaPixels = parsedCroppedArea
          hashType = 'pixel'
        }
      }
    }

    this.state = {
      imageSrc,
      crop: { x: 0, y: 0 },
      rotation,
      flip: { horizontal: false, vertical: false },
      hashType,
      zoom: 1,
      aspect: 4 / 3,
      cropShape: 'rect',
      showGrid: true,
      zoomSpeed: 1,
      restrictPosition: true,
      croppedArea: null,
      croppedAreaPixels: null,
      initialCroppedAreaPercentages,
      initialCroppedAreaPixels,
      requireCtrlKey: false,
      requireMultiTouch: false,
    }
  }

  onCropChange = (crop: Point) => {
    this.setState({ crop })
  }

  onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    console.log('onCropComplete!', croppedArea, croppedAreaPixels)

    this.setState({ croppedArea, croppedAreaPixels }, this.updateHash)
  }

  onCropAreaChange = (croppedArea: Area, croppedAreaPixels: Area) => {
    console.log('onCropAreaChange!', croppedArea, croppedAreaPixels)

    this.setState({ croppedArea, croppedAreaPixels })
  }

  updateHash = () => {
    if (urlArgs.setInitialCrop) {
      return
    }

    debouncedUpdateHash(this.state)
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

  onHashTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ hashType: e.target.value as HashType }, this.updateHash)
  }

  onImageSrcChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      imageSrc: e.target.value,
      initialCroppedAreaPercentages: undefined,
      initialCroppedAreaPixels: undefined,
    })
  }

  render() {
    return (
      <div className="App">
        <div className="controls">
          <div>
            <label>
              <input
                type="range"
                min={0}
                max={360}
                list="rotation-detents"
                value={this.state.rotation}
                onChange={({ target: { value: rotation } }) =>
                  this.setState({ rotation: Number(rotation) })
                }
              />
              {this.state.rotation}°
            </label>
            <datalist id="rotation-detents">
              <option value="90" />
              <option value="180" />
              <option value="270" />
            </datalist>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={this.state.flip.horizontal}
                onChange={() =>
                  this.setState((prev) => ({
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
                  this.setState((prev) => ({
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
            <label>
              <input
                type="checkbox"
                checked={this.state.requireCtrlKey}
                onChange={() =>
                  this.setState((prev) => ({
                    requireCtrlKey: !prev.requireCtrlKey,
                  }))
                }
              />
              Require Ctrl Key
            </label>
            <label>
              <input
                type="checkbox"
                checked={this.state.requireMultiTouch}
                onChange={() =>
                  this.setState((prev) => ({
                    requireMultiTouch: !prev.requireMultiTouch,
                  }))
                }
              />
              Require Multi-Touch
            </label>
            <div>
              <label>
                Save to hash:
                <select value={this.state.hashType} onChange={this.onHashTypeChange}>
                  <option value="percent">Percent</option>
                  <option value="pixel">Pixel</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                Picture:
                <select value={this.state.imageSrc} onChange={this.onImageSrcChange}>
                  {Object.entries(TEST_IMAGES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
            crop: {this.state.crop.x}, {this.state.crop.y}
            <br />
            zoom: {this.state.zoom}
          </div>
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
            onWheelRequest={
              this.state.requireCtrlKey
                ? (e) => {
                    return e.ctrlKey
                  }
                : undefined
            }
            onTouchRequest={
              this.state.requireMultiTouch
                ? (e) => {
                    return e.touches.length > 1
                  }
                : undefined
            }
            onCropChange={this.onCropChange}
            onRotationChange={this.onRotationChange}
            onCropComplete={this.onCropComplete}
            onCropAreaChange={this.onCropAreaChange}
            onZoomChange={this.onZoomChange}
            onInteractionStart={this.onInteractionStart}
            onInteractionEnd={this.onInteractionEnd}
            initialCroppedAreaPixels={
              Boolean(urlArgs.setInitialCrop) // used to set the initial crop in e2e test
                ? { width: 699, height: 524, x: 875, y: 157 }
                : this.state.initialCroppedAreaPixels
            }
            initialCroppedAreaPercentages={this.state.initialCroppedAreaPercentages}
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
