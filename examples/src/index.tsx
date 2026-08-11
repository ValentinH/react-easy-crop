import queryString from 'query-string'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import debounce from 'lodash.debounce'
import Cropper, { Area, CropperInteraction, Point } from '../../src/index'
import './styles.css'
import Iframe from './iframe'

const TEST_IMAGES = {
  './images/dog.jpeg': 'Landscape',
  './images/flower.jpeg': 'Portrait',
  './images/cat.jpeg': 'Small portrait',

  // Photos used in tests, used to verify values:
  './images/2000x1200.jpeg': '2000x1200',
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
  iframed: boolean
}

type Action =
  | { type: 'set-crop'; crop: Point }
  | { type: 'set-crop-result'; croppedArea: Area; croppedAreaPixels: Area }
  | { type: 'set-zoom'; zoom: number }
  | { type: 'set-rotation'; rotation: number }
  | { type: 'toggle-flip'; axis: 'horizontal' | 'vertical' }
  | { type: 'toggle-ctrl-key' }
  | { type: 'toggle-multi-touch' }
  | { type: 'set-hash-type'; hashType: HashType }
  | { type: 'set-image'; imageSrc: string }

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

function createInitialState(): State {
  let rotation = 0
  let initialCroppedAreaPercentages: Area | undefined
  let initialCroppedAreaPixels: Area | undefined
  let hashType: HashType = 'percent'
  let imageSrc = imageSrcFromQuery
  const query = new URLSearchParams(window.location.search)

  if (!urlArgs.setInitialCrop) {
    const hashArray = window.location.hash.slice(1).split(',')

    if (hashArray.length === hashNames.length) {
      const hashInfo = {} as Record<(typeof hashNames)[number], string>
      hashNames.forEach((key, index) => (hashInfo[key] = hashArray[index]))

      const {
        rotation: rotationFromHash,
        hashType: hashTypeFromHash,
        imageSrc: imageSrcFromHash,
        ...croppedArea
      } = hashInfo

      rotation = parseFloat(rotationFromHash)
      imageSrc = imageSrcFromHash

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

  return {
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
    iframed: Boolean(query.get('iframed')),
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set-crop':
      return { ...state, crop: action.crop }
    case 'set-crop-result':
      return {
        ...state,
        croppedArea: action.croppedArea,
        croppedAreaPixels: action.croppedAreaPixels,
      }
    case 'set-zoom':
      return { ...state, zoom: action.zoom }
    case 'set-rotation':
      return { ...state, rotation: action.rotation }
    case 'toggle-flip':
      return {
        ...state,
        rotation: 360 - state.rotation,
        flip: { ...state.flip, [action.axis]: !state.flip[action.axis] },
      }
    case 'toggle-ctrl-key':
      return { ...state, requireCtrlKey: !state.requireCtrlKey }
    case 'toggle-multi-touch':
      return { ...state, requireMultiTouch: !state.requireMultiTouch }
    case 'set-hash-type':
      return { ...state, hashType: action.hashType }
    case 'set-image':
      return {
        ...state,
        imageSrc: action.imageSrc,
        initialCroppedAreaPercentages: undefined,
        initialCroppedAreaPixels: undefined,
      }
  }
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, undefined, createInitialState)

  function updateHash(nextState: State) {
    if (!urlArgs.setInitialCrop) {
      debouncedUpdateHash(nextState)
    }
  }

  function onCropChange(crop: Point) {
    dispatch({ type: 'set-crop', crop })
  }

  function onCropComplete(croppedArea: Area, croppedAreaPixels: Area) {
    console.log('onCropComplete!', croppedArea, croppedAreaPixels)
    dispatch({ type: 'set-crop-result', croppedArea, croppedAreaPixels })
    updateHash({ ...state, croppedArea, croppedAreaPixels })
  }

  function onCropAreaChange(croppedArea: Area, croppedAreaPixels: Area) {
    console.log('onCropAreaChange!', croppedArea, croppedAreaPixels)
    dispatch({ type: 'set-crop-result', croppedArea, croppedAreaPixels })
  }

  function onZoomChange(zoom: number) {
    dispatch({ type: 'set-zoom', zoom })
  }

  function onRotationChange(rotation: number) {
    dispatch({ type: 'set-rotation', rotation })
  }

  function onInteractionStart(interaction: CropperInteraction) {
    console.log('user interaction started', interaction)
  }

  function onInteractionEnd(interaction: CropperInteraction) {
    console.log('user interaction ended', interaction)
  }

  function onHashTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const hashType = event.target.value as HashType
    dispatch({ type: 'set-hash-type', hashType })
    updateHash({ ...state, hashType })
  }

  function onImageSrcChange(event: React.ChangeEvent<HTMLSelectElement>) {
    dispatch({ type: 'set-image', imageSrc: event.target.value })
  }

  if (state.iframed) {
    return (
      <Iframe>
        <div className="crop-container">
          <Cropper
            image={state.imageSrc}
            crop={state.crop}
            rotation={state.rotation}
            zoom={state.zoom}
            aspect={state.aspect}
            cropShape={state.cropShape}
            showGrid={state.showGrid}
            zoomSpeed={state.zoomSpeed}
            restrictPosition={state.restrictPosition}
            onCropChange={onCropChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropComplete}
            onCropAreaChange={onCropAreaChange}
            onZoomChange={onZoomChange}
            onInteractionStart={onInteractionStart}
            onInteractionEnd={onInteractionEnd}
          />
        </div>
      </Iframe>
    )
  }

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
              value={state.rotation}
              onChange={({ target: { value: rotation } }) =>
                dispatch({ type: 'set-rotation', rotation: Number(rotation) })
              }
            />
            {state.rotation}°
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
              checked={state.flip.horizontal}
              onChange={() => dispatch({ type: 'toggle-flip', axis: 'horizontal' })}
            />
            Flip Horizontal
          </label>
          <label>
            <input
              type="checkbox"
              checked={state.flip.vertical}
              onChange={() => dispatch({ type: 'toggle-flip', axis: 'vertical' })}
            />
            Flip Vertical
          </label>
          <label>
            <input
              type="checkbox"
              checked={state.requireCtrlKey}
              onChange={() => dispatch({ type: 'toggle-ctrl-key' })}
            />
            Require Ctrl Key
          </label>
          <label>
            <input
              type="checkbox"
              checked={state.requireMultiTouch}
              onChange={() => dispatch({ type: 'toggle-multi-touch' })}
            />
            Require Multi-Touch
          </label>
          <div>
            <label>
              Save to hash:
              <select value={state.hashType} onChange={onHashTypeChange}>
                <option value="percent">Percent</option>
                <option value="pixel">Pixel</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Picture:
              <select id="picture-select" value={state.imageSrc} onChange={onImageSrcChange}>
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
            dispatch({ type: 'set-crop', crop: { ...state.crop, x: 0 } })
          }}
        >
          Center Horizontally
        </button>
        <div>
          crop: {state.crop.x}, {state.crop.y}
          <br />
          zoom: {state.zoom}
        </div>
        <div>
          <p>Crop Area:</p>
          <div>
            {(['x', 'y', 'width', 'height'] as const).map((attribute) => {
              if (!state.croppedArea) {
                return null
              }

              return (
                <div key={attribute}>
                  {attribute}:
                  <b id={`crop-area-${attribute}`}>{Math.round(state.croppedArea[attribute])}</b>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="crop-container">
        <Cropper
          image={state.imageSrc}
          crop={state.crop}
          rotation={state.rotation}
          zoom={state.zoom}
          aspect={state.aspect}
          cropShape={state.cropShape}
          showGrid={state.showGrid}
          zoomSpeed={state.zoomSpeed}
          restrictPosition={state.restrictPosition}
          roundCropAreaPixels
          onWheelRequest={
            state.requireCtrlKey
              ? (e) => {
                  return e.ctrlKey
                }
              : undefined
          }
          onTouchRequest={
            state.requireMultiTouch
              ? (e) => {
                  return e.touches.length > 1
                }
              : undefined
          }
          onCropChange={onCropChange}
          onRotationChange={onRotationChange}
          onCropComplete={onCropComplete}
          onCropAreaChange={onCropAreaChange}
          onZoomChange={onZoomChange}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
          initialCroppedAreaPixels={
            Boolean(urlArgs.setInitialCrop) // used to set the initial crop in e2e test
              ? { width: 699, height: 524, x: 875, y: 157 }
              : state.initialCroppedAreaPixels
          }
          initialCroppedAreaPercentages={state.initialCroppedAreaPercentages}
          transform={[
            `translate(${state.crop.x}px, ${state.crop.y}px)`,
            `rotateZ(${state.rotation}deg)`,
            `rotateY(${state.flip.horizontal ? 180 : 0}deg)`,
            `rotateX(${state.flip.vertical ? 180 : 0}deg)`,
            `scale(${state.zoom})`,
          ].join(' ')}
        />
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No root element found')
}
const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
