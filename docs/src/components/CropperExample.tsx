import useBaseUrl from '@docusaurus/useBaseUrl'
import { type ChangeEvent, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { ControlGroup } from './ExampleFrame'
import { getCroppedImg } from './cropImage'

type CropperExampleProps = {
  cropShape?: 'rect' | 'round'
  initialCroppedAreaPercentages?: Area
  media?: 'image' | 'video'
  output?: boolean
  showGrid?: boolean
  upload?: boolean
  ratio?: number
}

export default function CropperExample({
  cropShape = 'rect',
  initialCroppedAreaPercentages,
  media = 'image',
  output = false,
  showGrid = true,
  upload = false,
  ratio = 4 / 3,
}: CropperExampleProps) {
  const defaultImage = useBaseUrl('/img/dog.jpeg')
  const defaultVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  const [image, setImage] = useState(defaultImage)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)

  const isVideo = media === 'video'

  async function showCroppedImage() {
    if (!croppedAreaPixels || isVideo) {
      return
    }

    setCroppedImage(await getCroppedImg(image, croppedAreaPixels, rotation))
  }

  function onCropComplete(_: Area, croppedPixels: Area) {
    setCroppedAreaPixels(croppedPixels)
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImage(URL.createObjectURL(file))
    setCroppedImage(null)
  }

  return (
    <div className="example-shell">
      <div className="cropper-stage">
        <Cropper
          image={isVideo ? undefined : image}
          video={isVideo ? defaultVideo : undefined}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={ratio}
          cropShape={cropShape}
          showGrid={showGrid}
          initialCroppedAreaPercentages={initialCroppedAreaPercentages}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onRotationChange={setRotation}
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
        <label>
          Rotation
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(event) => setRotation(Number(event.target.value))}
          />
        </label>
        {upload ? <input type="file" accept="image/*" onChange={onFileChange} /> : null}
        {output ? <button onClick={showCroppedImage}>Show cropped image</button> : null}
      </ControlGroup>

      {croppedImage ? (
        <div className="cropped-preview">
          <img src={croppedImage} alt="Cropped result" />
        </div>
      ) : null}
    </div>
  )
}
