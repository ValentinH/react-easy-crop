import * as helpers from './helpers'

describe('Helpers', () => {
  describe('getCropSize', () => {
    test('when image width is higher than the height based on the aspect', () => {
      const cropSize = helpers.getCropSize(1200, 600, 4 / 3)
      expect(cropSize).toEqual({ height: 600, width: 800 })
    })
    test('when image width is smaller than the height based on the aspect', () => {
      const cropSize = helpers.getCropSize(600, 1200, 4 / 3)
      expect(cropSize).toEqual({ height: 450, width: 600 })
    })
    test('when image dimensions exactly match the aspect', () => {
      const cropSize = helpers.getCropSize(800, 600, 4 / 3)
      expect(cropSize).toEqual({ height: 600, width: 800 })
    })
    test('when rotated 66 degrees', () => {
      const cropSize = helpers.getCropSize(1800, 600, 16 / 9, 66)
      expect(cropSize).toEqual({ height: 600, width: 1066.6666666666665 })
    })
    test('when rotated 90 degrees', () => {
      const cropSize = helpers.getCropSize(1800, 600, 16 / 9, 90)
      expect(cropSize).toEqual({ height: 337.5, width: 600 })
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

    test('when zoomed, we should be able to drag the image further', () => {
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
    test('should compute the correct areas when the image was not moved and not zoomed', () => {
      const crop = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 1
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ x: 0, y: 0, width: 100, height: 100 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: 0, y: 0 })
    })

    test('should compute the correct areas when the image was moved but not zoomed', () => {
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

    test('should not limit the position within image bounds when restrictPosition is false', () => {
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
      expect(areas.croppedAreaPercentages).toEqual({ height: 100, width: 100, x: 0, y: 0 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: 0, y: 0 })
    })

    test('should compute the correct areas when there is a rotation and the image was moved', () => {
      const crop = { x: 50, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 1000, height: 600 }
      const aspect = 5 / 3
      const zoom = 1
      const rotation = 45
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, rotation)
      expect(areas.croppedAreaPercentages).toEqual({ height: 100, width: 100, x: -5, y: 0 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: -100, y: 0 })
    })
  })

  describe('getInitialCropFromCroppedAreaPixels', () => {
    test('should compute the correct crop and zoom when the image was not moved and not zoomed', () => {
      const croppedAreaPixels = { height: 1200, width: 2000, x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(croppedAreaPixels, imgSize)

      expect(crop).toEqual({ x: 0, y: 0 })
      expect(zoom).toEqual(1)
    })

    test('should compute the correct crop and zoom when the image was moved but not zoomed', () => {
      const croppedAreaPixels = { height: 1200, width: 1600, x: 100, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(croppedAreaPixels, imgSize)

      expect(crop).toEqual({ x: 50, y: 0 })
      expect(zoom).toEqual(1)
    })

    test('should compute the correct crop and zoom when there is a zoom', () => {
      const croppedAreaPixels = { height: 600, width: 1000, x: 500, y: 300 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(croppedAreaPixels, imgSize)

      expect(crop).toEqual({ x: 0, y: 0 })
      expect(zoom).toEqual(2)
    })

    test('should compute the correct crop and zoom even when restrictPosition was false', () => {
      const croppedAreaPixels = { height: 1200, width: 2000, x: -2000, y: -1200 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }

      const { crop, zoom } = helpers.getInitialCropFromCroppedAreaPixels(croppedAreaPixels, imgSize)

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
      [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 0 }],
      [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 0, y: 50 }],
      [{ x: 0, y: 0 }, { x: 100, y: 100 }, { x: 50, y: 50 }],
      [{ x: 100, y: 1000 }, { x: 0, y: 400 }, { x: 50, y: 700 }],
      [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
    ])('.getCenter(%o, %o)', (a, b, expected) => {
      const center = helpers.getCenter(a, b)
      expect(center).toEqual(expected)
    })
  })
  describe('rotateAroundMidPoint', () => {
    test('sould rotate correctly around supplied values', () => {
      expect(helpers.rotateAroundMidPoint(0, 0, 66, 77, 90)).toEqual([143, 11])
    })
    test.each([
      [[0, 0, 66, 77, 9], [12.858023328818689, -9.37667691848084]],
      [[40, 0, 66, 77, 99], [146.1192983168716, 63.36555695262421]],
      [[0, 40, 660, 77, 88], [673.9437927760558, -583.8892272105957]],
      [[70, 40, 9, 737, 240], [-625.1197064377536, 1032.6724503691496]],
      [[40, 40, 636, 77, 45], [240.72730931671987, -370.5985924910845]],
    ])('.rotateAroundMidPoint(%s)', (params, expected) => {
      expect(helpers.rotateAroundMidPoint(...params)).toEqual(expected)
    })
  })
  describe('translateSize', () => {
    test('should return correct bounding area once rotated', () => {
      expect(helpers.translateSize(50, 50, 66)).toEqual({
        height: 66.01410503592005,
        width: 66.01410503592005,
      })
    })
    test.each([
      [
        [780, 2000, 45],
        {
          height: 1965.756851698602,
          width: 1965.756851698602,
        },
      ],
      [
        [1780, 60, 95],
        {
          height: 1778.4559071681665,
          width: 214.90890397633643,
        },
      ],
    ])('.translateSize(%s)', (params, expected) => {
      expect(helpers.translateSize(...params)).toEqual(expected)
    })
  })
})
