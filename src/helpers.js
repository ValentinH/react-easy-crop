/**
 * Compute the dimension of the crop area based on image size,
 * aspect ratio and optionally rotatation
 * @param {number} imgWidth width of the src image in pixels
 * @param {number} imgHeight height of the src image in pixels
 * @param {number} aspect aspect ratio of the crop
 * @param {rotation} rotation rotation in degrees
 */
export function getCropSize(imgWidth, imgHeight, aspect, rotation = 0) {
  const { width, height } = translateSize(imgWidth, imgHeight, rotation)

  if (imgWidth >= imgHeight * aspect && width > imgHeight * aspect) {
    return {
      width: imgHeight * aspect,
      height: imgHeight,
    }
  }

  if (width > imgHeight * aspect) {
    return {
      width: imgWidth,
      height: imgWidth / aspect,
    }
  }

  if (width > height * aspect) {
    return {
      width: height * aspect,
      height: height,
    }
  }

  return {
    width: width,
    height: width / aspect,
  }
}

/**
 * Ensure a new image position stays in the crop area.
 * @param {{x: number, y number}} position new x/y position requested for the image
 * @param {{width: number, height: number}} imageSize width/height of the src image
 * @param {{width: number, height: number}} cropSize width/height of the crop area
 * @param {number} zoom zoom value
 * @param {rotation} rotation rotation in degrees
 * @returns {{x: number, y number}}
 */
export function restrictPosition(position, imageSize, cropSize, zoom, rotation = 0) {
  const { width, height } = translateSize(imageSize.width, imageSize.height, rotation)

  return {
    x: restrictPositionCoord(position.x, width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, height, cropSize.height, zoom),
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
 * @param {number} rotation rotation value (in deg)
 * @param {boolean} restrictPosition whether we should limit or not the cropped area
 */
export function computeCroppedArea(
  crop,
  imgSize,
  cropSize,
  aspect,
  zoom,
  rotation = 0,
  restrictPosition = true
) {
  // if the image is rotated by the user, we cannot limit the position anymore
  // as it might need to be negative.
  const limitAreaFn = restrictPosition && rotation === 0 ? limitArea : noOp
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
  const widthInPixels = Math.round(
    limitAreaFn(imgSize.naturalWidth, (croppedAreaPercentages.width * imgSize.naturalWidth) / 100)
  )
  const heightInPixels = Math.round(
    limitAreaFn(
      imgSize.naturalHeight,
      (croppedAreaPercentages.height * imgSize.naturalHeight) / 100
    )
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
    x: Math.round(
      limitAreaFn(
        imgSize.naturalWidth - sizePixels.width,
        (croppedAreaPercentages.x * imgSize.naturalWidth) / 100
      )
    ),
    y: Math.round(
      limitAreaFn(
        imgSize.naturalHeight - sizePixels.height,
        (croppedAreaPercentages.y * imgSize.naturalHeight) / 100
      )
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

/**
 *
 * Returns an x,y point once rotated around xMid,yMid
 * @param {number} x
 * @param {number} y
 * @param {number} xMid
 * @param {number} yMid
 * @param {number} degrees
 */
export function rotateAroundMidPoint(x, y, xMid, yMid, degrees) {
  const cos = Math.cos
  const sin = Math.sin
  const radian = (degrees * Math.PI) / 180 // Convert to radians
  // Subtract midpoints, so that midpoint is translated to origin
  // and add it in the end again
  const xr = (x - xMid) * cos(radian) - (y - yMid) * sin(radian) + xMid
  const yr = (x - xMid) * sin(radian) + (y - yMid) * cos(radian) + yMid

  return [xr, yr]
}

/**
 *
 * Returns the new bounding area of a rotated rectangle.
 * @param {number} width
 * @param {number} height
 * @param {number} rotation
 */
export function translateSize(width, height, rotation) {
  const centerX = width / 2
  const centerY = height / 2

  const outerBounds = [
    rotateAroundMidPoint(0, 0, centerX, centerY, rotation),
    rotateAroundMidPoint(width, 0, centerX, centerY, rotation),
    rotateAroundMidPoint(width, height, centerX, centerY, rotation),
    rotateAroundMidPoint(0, height, centerX, centerY, rotation),
  ]

  const { minX, maxX, minY, maxY } = outerBounds.reduce(
    (res, [x, y]) => ({
      minX: Math.min(x, 'minX' in res ? res.minX : x),
      maxX: Math.max(x, 'maxX' in res ? res.maxX : x),
      minY: Math.min(y, 'minY' in res ? res.minY : y),
      maxY: Math.max(y, 'maxY' in res ? res.maxY : y),
    }),
    {}
  )

  return { width: maxX - minX, height: maxY - minY }
}
