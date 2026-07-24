import Cropper, { getInitialCropFromCroppedAreaPixels, type Area } from 'react-easy-crop'

const crop = { x: 0, y: 0 }
const area: Area = { x: 0, y: 0, width: 100, height: 100 }

getInitialCropFromCroppedAreaPixels(
  area,
  { width: 100, height: 100, naturalWidth: 100, naturalHeight: 100 },
  0,
  { width: 100, height: 100 },
  1,
  3
)

export const example = <Cropper image="image.jpg" crop={crop} onCropChange={() => undefined} />
