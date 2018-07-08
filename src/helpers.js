/**
 * Compute the dimension of the crop area based on image size and aspect ratio
 * @param {number} imgWidth width of the src image in pixels
 * @param {number} imgHeight height of the src image in pixels
 * @param {number} aspect aspect ratio of the crop
 */
export function getCropSize(imgWidth, imgHeight, aspect) {
  if (imgWidth >= imgHeight * aspect) {
    return {
      width: imgHeight * aspect,
      height: imgHeight,
    }
  }
  return {
    width: imgWidth,
    height: imgWidth / aspect,
  }
}

/**
 * Ensure a new image position stays in the crop area.
 * @param {{x: number, y number}} position new x/y position requested for the image
 * @param {{width: number, height: number}} imageSize width/height of the src image
 * @param {{width: number, height: number}} cropSize width/height of the crop area
 * @param {number} zoom zoom value
 * @returns {{x: number, y number}}
 */
export function restrictPosition(position, imageSize, cropSize, zoom) {
  return {
    x: restrictPositionCoord(position.x, imageSize.width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, imageSize.height, cropSize.height, zoom),
  }
}

function restrictPositionCoord(position, imageSize, cropSize, zoom) {
  const maxPosition = (imageSize * zoom) / 2 - cropSize / 2
  return Math.min(maxPosition, Math.max(position, -maxPosition))
}

export function getDistanceBetweenPoints(pointA, pointB) {
  return Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2))
}

/**
 * Compute the output cropped area of the image in percentages and pixels.
 * x/y are the top-left coordinates on the src image
 * @param {{x: number, y number}} crop x/y position of the current center of the image
 * @param {{width: number, height: number, naturalWidth: number, naturelHeight: number}} imageSize width/height of the src image (default is size on the screen, natural is the original size)
 * @param {{width: number, height: number}} cropSize width/height of the crop area
 * @param {number} zoom zoom value
 */
export function computeCroppedArea(crop, imgSize, cropSize, zoom) {
  const croppedAreaPercentages = {
    x: limitArea(
      100,
      (((imgSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / imgSize.width) * 100
    ),
    y: limitArea(
      100,
      (((imgSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) / imgSize.height) * 100
    ),
    width: limitArea(100, ((cropSize.width / imgSize.width) * 100) / zoom),
    height: limitArea(100, ((cropSize.height / imgSize.height) * 100) / zoom),
  }
  const croppedAreaPixels = {
    x: limitArea(imgSize.naturalWidth, (croppedAreaPercentages.x * imgSize.naturalWidth) / 100),
    y: limitArea(imgSize.naturalHeight, (croppedAreaPercentages.y * imgSize.naturalHeight) / 100),
    width: limitArea(
      imgSize.naturalWidth,
      (croppedAreaPercentages.width * imgSize.naturalWidth) / 100
    ),
    height: limitArea(
      imgSize.naturalHeight,
      (croppedAreaPercentages.height * imgSize.naturalHeight) / 100
    ),
  }
  return { croppedAreaPercentages, croppedAreaPixels }
}

/**
 * Ensure the returned value is between 0 and max
 * @param {number} max
 * @param {number} value
 */
function limitArea(max, value) {
  return Math.min(max, Math.max(0, value))
}
