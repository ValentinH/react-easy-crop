import Cropper, { getInitialCropFromCroppedAreaPixels, type Area } from 'react-easy-crop'

const area: Area = { x: 0, y: 0, width: 100, height: 100 }

void Cropper
getInitialCropFromCroppedAreaPixels(
  area,
  { width: 100, height: 100, naturalWidth: 100, naturalHeight: 100 },
  0,
  { width: 100, height: 100 },
  1,
  3
)
