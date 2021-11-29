import * as helpers from './helpers'

describe('Helpers', () => {
  describe('getCropSize', () => {
    test('when media width is higher than the height based on the aspect', () => {
      const cropSize = helpers.getCropSize(1200, 600, 1000, 600, 4 / 3)
      expect(cropSize).toEqual({ height: 600, width: 800 })
    })
    test('when media width is smaller than the height based on the aspect', () => {
      const cropSize = helpers.getCropSize(600, 1200, 1000, 600, 4 / 3)
      expect(cropSize).toEqual({ height: 450, width: 600 })
    })
    test('when media dimensions exactly match the horizontal aspect', () => {
      const cropSize = helpers.getCropSize(800, 600, 1000, 600, 4 / 3)
      expect(cropSize).toEqual({ height: 600, width: 800 })
    })
    test('when media dimensions exactly match the vertical aspect', () => {
      const cropSize = helpers.getCropSize(600, 800, 1200, 800, 3 / 4)
      expect(cropSize).toEqual({ height: 800, width: 600 })
    })
    test('when rotated 66 degrees', () => {
      const cropSize = helpers.getCropSize(1000, 524, 1000, 600, 16 / 9, 66)
      expect(cropSize.width).toBeCloseTo(885, 0)
      expect(cropSize.height).toBeCloseTo(498, 0)
    })
    test('when rotated 90 degrees', () => {
      const cropSize = helpers.getCropSize(1800, 600, 1000, 600, 16 / 9, 90)
      expect(cropSize.width).toBeCloseTo(600, 0)
      expect(cropSize.height).toBeCloseTo(337.5, 1)
    })
    test('when rotated 90 degrees and container is vertical', () => {
      const cropSize = helpers.getCropSize(600, 314, 600, 800, 1000 / 1910, 90)
      expect(cropSize.width).toBeCloseTo(314, 0)
      expect(cropSize.height).toBeCloseTo(600, 0)
    })
  })

  describe('restrictPosition', () => {
    test('position within the cropped area should be returned as-is', () => {
      const position = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600 }
      const cropSize = { width: 500, height: 200 }
      const zoom = 1
      const result = helpers.restrictPosition(position, imgSize, cropSize, zoom)
      expect(result).toEqual({ x: 0, y: 0 })
    })

    test('position too far on the bottom-right should be limited', () => {
      const position = { x: 600, y: 500 }
      const imgSize = { width: 1000, height: 500 }
      const cropSize = { width: 500, height: 200 }
      const zoom = 1
      const result = helpers.restrictPosition(position, imgSize, cropSize, zoom)
      expect(result).toEqual({ x: 250, y: 150 })
    })

    test('position too far on the top-left should be limited', () => {
      const position = { x: -600, y: -500 }
      const imgSize = { width: 1000, height: 500 }
      const cropSize = { width: 500, height: 200 }
      const zoom = 1
      const result = helpers.restrictPosition(position, imgSize, cropSize, zoom)
      expect(result).toEqual({ x: -250, y: -150 })
    })

    test('when zoomed, we should be able to drag the media further', () => {
      const position = { x: 500, y: 300 }
      const imgSize = { width: 1000, height: 500 }
      const cropSize = { width: 500, height: 200 }
      const zoom = 2
      const result = helpers.restrictPosition(position, imgSize, cropSize, zoom)
      expect(result).toEqual({ x: 500, y: 300 })
    })

    test('when zoomed, position should still be limited', () => {
      const position = { x: 5000, y: 3000 }
      const imgSize = { width: 1000, height: 500 }
      const cropSize = { width: 500, height: 200 }
      const zoom = 3
      const result = helpers.restrictPosition(position, imgSize, cropSize, zoom)
      expect(result).toEqual({ x: 1250, y: 650 })
    })
  })

  describe('getDistanceBetweenPoints', () => {
    test('should handle horizontal distance only', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 100, y: 0 }
      const distance = helpers.getDistanceBetweenPoints(a, b)
      expect(distance).toEqual(100)
    })

    test('should handle vertical distance only', () => {
      const a = { x: 0, y: 200 }
      const b = { x: 0, y: 0 }
      const distance = helpers.getDistanceBetweenPoints(a, b)
      expect(distance).toEqual(200)
    })

    test('should handle horizontal and vertical distance', () => {
      const a = { x: 0, y: 50 }
      const b = { x: 25, y: 0 }
      const distance = helpers.getDistanceBetweenPoints(a, b)
      expect(distance).toBeCloseTo(55.9)
    })
  })

  describe('getRotationBetweenPoints', () => {
    test('should handle positive rotation', () => {
      const a = { x: 0, y: 0 }
      const b = { x: 10, y: 10 }
      const rotation = helpers.getRotationBetweenPoints(a, b)
      expect(rotation).toEqual(45)
    })

    test('should handle negative rotation', () => {
      const a = { x: 20, y: 20 }
      const b = { x: 10, y: 10 }
      const rotation = helpers.getRotationBetweenPoints(a, b)
      expect(rotation).toEqual(-135)
    })

    test('should handle zero rotation', () => {
      const a = { x: 10, y: 10 }
      const b = { x: 10, y: 10 }
      const rotation = helpers.getRotationBetweenPoints(a, b)
      expect(rotation).toEqual(0)
    })
  })

  describe('computeCroppedArea', () => {
    test('should compute the correct areas when the media was not moved and not zoomed', () => {
      const crop = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 1
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ x: 0, y: 0, width: 100, height: 100 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: 0, y: 0 })
    })

    test('should compute the correct areas when the media was moved but not zoomed', () => {
      const crop = { x: 50, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 800, height: 600 }
      const aspect = 4 / 3
      const zoom = 1
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ height: 100, width: 80, x: 5, y: 0 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 1600, x: 100, y: 0 })
    })

    test('should compute the correct areas when there is a zoom', () => {
      const crop = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 2
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ height: 50, width: 50, x: 25, y: 25 })
      expect(areas.croppedAreaPixels).toEqual({ height: 600, width: 1000, x: 500, y: 300 })
    })

    test('should not limit the position within media bounds when restrictPosition is false', () => {
      const crop = { x: 1000, y: 600 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 1
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, 0, false)
      expect(areas.croppedAreaPercentages).toEqual({ height: 100, width: 100, x: -100, y: -100 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: -2000, y: -1200 })
    })

    test('should compute the correct areas when there is a rotation', () => {
      const crop = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 1
      const rotation = 45
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, rotation)
      expect(areas.croppedAreaPercentages).toEqual({
        height: 53.03300858899106,
        width: 88.38834764831843,
        x: 5.805826175840782,
        y: 23.48349570550447,
      })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: 131, y: 531 })
    })

    test('should compute the correct areas when there is a rotation and the media was moved', () => {
      const crop = { x: 50, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 1
      const rotation = 45
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, rotation)

      expect(areas.croppedAreaPercentages).toEqual({
        height: 53.03300858899106,
        width: 88.38834764831843,
        x: 1.3864087934248597,
        y: 23.48349570550447,
      })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: 31, y: 531 })
    })
  })

  describe('getInitialCropFromCroppedAreaPixels', () => {
    test('should compute the correct crop and zoom when the media was not moved and not zoomed', () => {
      const croppedAreaPixels = { height: 1200, width: 2000, x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { height: 600, width: 1000 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(
        croppedAreaPixels,
        imgSize,
        0,
        cropSize,
        1,
        3
      )

      expect(crop).toEqual({ x: 0, y: 0 })
      expect(zoom).toEqual(1)
    })

    test('should compute the correct crop and zoom when the media was moved but not zoomed', () => {
      const croppedAreaPixels = { height: 1200, width: 1600, x: 100, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 800, height: 600 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(
        croppedAreaPixels,
        imgSize,
        0,
        cropSize,
        1,
        3
      )

      expect(zoom).toEqual(1)
      expect(crop).toEqual({ x: 50, y: 0 })
    })

    test('should compute the correct crop and zoom even when cropSize is used', () => {
      const croppedAreaPixels = { width: 873, height: 873, x: 0, y: 0 }
      const imgSize = { width: 875, height: 458, naturalWidth: 1910, naturalHeight: 1000 }
      const cropSize = { width: 400, height: 400 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(
        croppedAreaPixels,
        imgSize,
        0,
        cropSize,
        1,
        3
      )

      expect(crop.x).toBeCloseTo(237.6, 1)
      expect(crop.y).toBeCloseTo(29.1, 1)
      expect(zoom).toBeCloseTo(1, 3)
    })

    test('should compute the correct crop and zoom when there is a zoom', () => {
      const croppedAreaPixels = { height: 600, width: 1000, x: 500, y: 300 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { height: 600, width: 1000 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(
        croppedAreaPixels,
        imgSize,
        0,
        cropSize,
        1,
        3
      )

      expect(crop).toEqual({ x: 0, y: 0 })
      expect(zoom).toEqual(2)
    })

    test('should compute the correct crop and zoom even when restrictPosition was false', () => {
      const croppedAreaPixels = { height: 1200, width: 2000, x: -2000, y: -1200 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(
        croppedAreaPixels,
        imgSize,
        0,
        cropSize,
        1,
        3
      )

      expect(crop).toEqual({ x: 1000, y: 600 })
      expect(zoom).toEqual(1)
    })
  })

  describe('getCenter', () => {
    test('should simply return the center between a and b', () => {
      const center = helpers.getCenter({ x: 0, y: 0 }, { x: 100, y: 0 })
      expect(center).toEqual({ x: 50, y: 0 })
    })

    test.each([
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 0 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 0, y: 50 },
      ],
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 50, y: 50 },
      ],
      [
        { x: 100, y: 1000 },
        { x: 0, y: 400 },
        { x: 50, y: 700 },
      ],
      [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
    ])('.getCenter(%o, %o)', (a, b, expected) => {
      const center = helpers.getCenter(a, b)
      expect(center).toEqual(expected)
    })
  })

  describe('rotateSize', () => {
    test('should return correct bounding area once rotated', () => {
      expect(helpers.rotateSize(50, 50, 66)).toEqual({
        height: 66.01410503592005,
        width: 66.01410503592005,
      })
    })
    test.each([
      [
        { width: 780, height: 2000, rotation: 45 },
        {
          height: 1965.756851698602,
          width: 1965.756851698602,
        },
      ],
      [
        { width: 1780, height: 60, rotation: 95 },
        {
          height: 1778.4559071681665,
          width: 214.9089039763364,
        },
      ],
    ])('.rotateSize(%s)', ({ width, height, rotation }, expected) => {
      expect(helpers.rotateSize(width, height, rotation)).toEqual(expected)
    })
  })
})
