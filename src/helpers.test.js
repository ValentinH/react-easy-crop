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
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, false)
      expect(areas.croppedAreaPercentages).toEqual({ height: 100, width: 100, x: -100, y: -100 })
      expect(areas.croppedAreaPixels).toEqual({ height: 1200, width: 2000, x: -2000, y: -1200 })
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
})
