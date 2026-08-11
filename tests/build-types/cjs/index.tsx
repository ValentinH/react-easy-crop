import { createRef } from 'react'
import Cropper, { getInitialCropFromCroppedAreaPixels, type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

const crop = { x: 0, y: 0 }
const area: Area = { x: 0, y: 0, width: 100, height: 100 }
const containerRef = createRef<HTMLDivElement>()
const cropAreaRef = createRef<HTMLDivElement>()
const mediaRef = createRef<HTMLImageElement | HTMLVideoElement>()

getInitialCropFromCroppedAreaPixels(
  area,
  { width: 100, height: 100, naturalWidth: 100, naturalHeight: 100 },
  0,
  { width: 100, height: 100 },
  1,
  3
)

export const example = (
  <Cropper
    ref={containerRef}
    image="image.jpg"
    crop={crop}
    cropAreaRef={cropAreaRef}
    mediaRef={mediaRef}
    onCropChange={() => undefined}
    onMediaSizeChange={(mediaSize) => void mediaSize.naturalWidth}
  />
)
