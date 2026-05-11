export const basicExampleCode = `import { useState } from 'react'
import Cropper, { type Point } from 'react-easy-crop'

type BasicExampleProps = {
  image: string
}

export default function BasicExample({ image }: BasicExampleProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <>
      <div className="cropper">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
        />
      </div>

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
    </>
  )
}`

export const outputExampleCode = `import { useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'

type OutputExampleProps = {
  image: string
}

export default function OutputExample({ image }: OutputExampleProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)

  function onCropComplete(_: Area, croppedPixels: Area) {
    setCroppedAreaPixels(croppedPixels)
  }

  async function showCroppedImage() {
    if (!croppedAreaPixels) {
      return
    }

    setCroppedImage(await getCroppedImg(image, croppedAreaPixels, rotation))
  }

  return (
    <>
      <div className="cropper">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onRotationChange={setRotation}
          onZoomChange={setZoom}
        />
      </div>

      <button onClick={showCroppedImage}>Show cropped image</button>

      {croppedImage ? <img src={croppedImage} alt="Cropped result" /> : null}
    </>
  )
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return null
  }

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise<string | null>((resolve) => {
    croppedCanvas.toBlob((file) => {
      resolve(file ? URL.createObjectURL(file) : null)
    }, 'image/jpeg')
  })
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}`

export const uploadExampleCode = `import { type ChangeEvent, useState } from 'react'
import Cropper, { type Point } from 'react-easy-crop'

export default function UploadExample() {
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImage(URL.createObjectURL(file))
  }

  return (
    <>
      <input type="file" accept="image/*" onChange={onFileChange} />

      {image ? (
        <div className="cropper">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          />
        </div>
      ) : null}
    </>
  )
}`

export const roundExampleCode = `import { useState } from 'react'
import Cropper, { type Point } from 'react-easy-crop'

type RoundExampleProps = {
  image: string
}

export default function RoundExample({ image }: RoundExampleProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <div className="cropper">
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape="round"
        showGrid={false}
        onCropChange={setCrop}
        onZoomChange={setZoom}
      />
    </div>
  )
}`

export const videoExampleCode = `import { useState } from 'react'
import Cropper, { type Point } from 'react-easy-crop'

type VideoExampleProps = {
  video: string
}

export default function VideoExample({ video }: VideoExampleProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <div className="cropper">
      <Cropper
        video={video}
        crop={crop}
        zoom={zoom}
        aspect={4 / 3}
        onCropChange={setCrop}
        onZoomChange={setZoom}
      />
    </div>
  )
}`

export const restoreExampleCode = `import { useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'

const STORAGE_KEY = 'react-easy-crop-demo-crop'

type RestoreExampleProps = {
  image: string
}

export default function RestoreExample({ image }: RestoreExampleProps) {
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
    <>
      <div className="cropper">
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

      <button onClick={saveCrop}>Save crop</button>
      <button onClick={resetCrop}>Reset</button>
    </>
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
}`
