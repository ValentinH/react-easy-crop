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

export function getRotationBetweenPoints(pointA, pointB) {
  return (Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180) / Math.PI
}

/**
 * Compute the output cropped area of the image in percentages and pixels.
 * x/y are the top-left coordinates on the src image
 * @param {{x: number, y number}} crop x/y position of the current center of the image
 * @param {{width: number, height: number, naturalWidth: number, naturelHeight: number}} imageSize width/height of the src image (default is size on the screen, natural is the original size)
 * @param {{width: number, height: number}} cropSize width/height of the crop area
 * @param {number} aspect aspect value
 * @param {number} zoom zoom value
 * @param {boolean} restrictPosition whether we should limit or not the cropped area
 */
export function computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, restrictPosition = true) {
  const limitAreaFn = restrictPosition ? limitArea : noOp
  const croppedAreaPercentages = {
    x: limitAreaFn(
      100,
      (((imgSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / imgSize.width) * 100
    ),
    y: limitAreaFn(
      100,
      (((imgSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) / imgSize.height) * 100
    ),
    width: limitAreaFn(100, ((cropSize.width / imgSize.width) * 100) / zoom),
    height: limitAreaFn(100, ((cropSize.height / imgSize.height) * 100) / zoom),
  }

  // we compute the pixels size naively
  const widthInPixels = limitAreaFn(
    imgSize.naturalWidth,
    (croppedAreaPercentages.width * imgSize.naturalWidth) / 100,
    true
  )
  const heightInPixels = limitAreaFn(
    imgSize.naturalHeight,
    (croppedAreaPercentages.height * imgSize.naturalHeight) / 100,
    true
  )
  const isImgWiderThanHigh = imgSize.naturalWidth >= imgSize.naturalHeight * aspect

  // then we ensure the width and height exactly match the aspect (to avoid rounding approximations)
  // if the image is wider than high, when zoom is 0, the crop height will be equals to iamge height
  // thus we want to compute the width from the height and aspect for accuracy.
  // Otherwise, we compute the height from width and aspect.
  const sizePixels = isImgWiderThanHigh
    ? {
        width: Math.round(heightInPixels * aspect),
        height: heightInPixels,
      }
    : {
        width: widthInPixels,
        height: Math.round(widthInPixels / aspect),
      }
  const croppedAreaPixels = {
    ...sizePixels,
    x: limitAreaFn(
      imgSize.naturalWidth - sizePixels.width,
      (croppedAreaPercentages.x * imgSize.naturalWidth) / 100,
      true
    ),
    y: limitAreaFn(
      imgSize.naturalHeight - sizePixels.height,
      (croppedAreaPercentages.y * imgSize.naturalHeight) / 100,
      true
    ),
  }
  return { croppedAreaPercentages, croppedAreaPixels }
}

/**
 * Ensure the returned value is between 0 and max
 * @param {number} max
 * @param {number} value
 * @param {boolean} shouldRound
 */
function limitArea(max, value, shouldRound = false) {
  const v = shouldRound ? Math.round(value) : value
  return Math.min(max, Math.max(0, v))
}

function noOp(max, value) {
  return value
}

/**
 * Compute the crop and zoom from the croppedAreaPixels
 * @param {{x: number, y: number, width: number, height: number}} croppedAreaPixels
 * @param {{width: number, height: number, naturalWidth: number, naturelHeight: number}} imageSize width/height of the src image (default is size on the screen, natural is the original size)
 */
export function getInitialCropFromCroppedAreaPixels(croppedAreaPixels, imageSize) {
  const aspect = croppedAreaPixels.width / croppedAreaPixels.height
  const imageZoom = imageSize.width / imageSize.naturalWidth
  const isHeightMaxSize = imageSize.naturalWidth >= imageSize.naturalHeight * aspect

  const zoom = isHeightMaxSize
    ? imageSize.naturalHeight / croppedAreaPixels.height
    : imageSize.naturalWidth / croppedAreaPixels.width

  const cropZoom = imageZoom * zoom

  const crop = {
    x: ((imageSize.naturalWidth - croppedAreaPixels.width) / 2 - croppedAreaPixels.x) * cropZoom,
    y: ((imageSize.naturalHeight - croppedAreaPixels.height) / 2 - croppedAreaPixels.y) * cropZoom,
  }
  return { crop, zoom }
}

/**
 * Return the point that is the center of point a and b
 * @param {{x: number, y: number}} a
 * @param {{x: number, y: number}} b
 */
export function getCenter(a, b) {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2,
  }
}
