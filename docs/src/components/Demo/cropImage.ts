import { Area } from 'react-easy-crop/dist/types'

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // set width to double image size to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = image.width * 2
  canvas.height = image.height * 2

  // translate canvas context to a central location to allow rotating around the center.
  ctx.translate(image.width, image.height)
  ctx.rotate(getRadianAngle(rotation))
  ctx.translate(-image.width, -image.height)

  // draw rotated image and store data.
  ctx.drawImage(image, image.width / 2, image.height / 2)
  const data = ctx.getImageData(0, 0, image.width * 2, image.height * 2)

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(data, 0 - image.width / 2 - pixelCrop.x, 0 - image.height / 2 - pixelCrop.y)

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(file => {
      resolve(URL.createObjectURL(file))
    }, 'image/jpeg')
  })
}
