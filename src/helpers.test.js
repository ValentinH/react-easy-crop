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

  describe('computeCroppedArea', () => {
    test('should compute the correct areas when the image was not moved', () => {
      const crop = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 500, height: 300 }
      const zoom = 1
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ x: 25, y: 25, width: 50, height: 50 })
      expect(areas.croppedAreaPixels).toEqual({ height: 600, width: 1000, x: 500, y: 300 })
    })

    test('should compute the correct areas when the image was moved', () => {
      const crop = { x: 100, y: 30 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 500, height: 300 }
      const zoom = 1
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ height: 50, width: 50, x: 15, y: 20 })
      expect(areas.croppedAreaPixels).toEqual({ height: 600, width: 1000, x: 300, y: 240 })
    })

    test('should compute the correct areas when there is a zoom', () => {
      const crop = { x: 0, y: 0 }
      const imgSize = { width: 1000, height: 600, naturalWidth: 2000, naturalHeight: 1200 }
      const cropSize = { width: 500, height: 300 }
      const zoom = 2
      const areas = helpers.computeCroppedArea(crop, imgSize, cropSize, zoom)
      expect(areas.croppedAreaPercentages).toEqual({ height: 25, width: 25, x: 37.5, y: 37.5 })
      expect(areas.croppedAreaPixels).toEqual({ height: 300, width: 500, x: 750, y: 450 })
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
