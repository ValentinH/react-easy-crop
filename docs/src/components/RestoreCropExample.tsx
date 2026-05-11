import useBaseUrl from '@docusaurus/useBaseUrl'
import { useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { ControlGroup } from './ExampleFrame'

const STORAGE_KEY = 'react-easy-crop-demo-crop'

export default function RestoreCropExample() {
  const image = useBaseUrl('/img/dog.jpeg')
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [initialCroppedAreaPercentages, setInitialCroppedAreaPercentages] = useState<
    Area | undefined
  >(readSavedCrop)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  function onCropComplete(area: Area) {
    setCroppedArea(area)
  }

  function saveCrop() {
    if (!croppedArea) {
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(croppedArea))
    setInitialCroppedAreaPercentages(croppedArea)
  }

  function resetCrop() {
    localStorage.removeItem(STORAGE_KEY)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setInitialCroppedAreaPercentages(undefined)
  }

  return (
    <div className="example-shell">
      <div className="cropper-stage">
        <Cropper
          key={JSON.stringify(initialCroppedAreaPercentages)}
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          initialCroppedAreaPercentages={initialCroppedAreaPercentages}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>

      <ControlGroup>
        <label>
          Zoom
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <button onClick={saveCrop}>Save crop</button>
        <button className="button-secondary" onClick={resetCrop}>
          Reset
        </button>
      </ControlGroup>
    </div>
  )
}

function readSavedCrop() {
  const savedCrop = localStorage.getItem(STORAGE_KEY)

  if (!savedCrop) {
    return undefined
  }

  try {
    return JSON.parse(savedCrop) as Area
  } catch {
    return undefined
  }
}
