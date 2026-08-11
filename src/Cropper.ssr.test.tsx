// @vitest-environment node

import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { expect, test, vi } from 'vitest'
import Cropper from './Cropper'

test('server rendering does not access browser globals or warn about layout effects', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  expect(() =>
    renderToString(<Cropper image="/image.jpg" crop={{ x: 0, y: 0 }} onCropChange={vi.fn()} />)
  ).not.toThrow()
  expect(consoleError).not.toHaveBeenCalled()

  consoleError.mockRestore()
})

test('server rendering preserves the automatic stylesheet nonce without warnings', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  const html = renderToString(
    <Cropper image="/image.jpg" crop={{ x: 0, y: 0 }} onCropChange={vi.fn()} nonce="abc" />
  )

  expect(html).toContain('<style nonce="abc">')
  expect(consoleError).not.toHaveBeenCalled()

  consoleError.mockRestore()
})
