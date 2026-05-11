---
sidebar_position: 1
title: Getting started
---

# Getting started

Install the package:

```shell
pnpm add react-easy-crop
```

```shell
npm install react-easy-crop --save
```

The cropper fills its parent with `position: absolute`, so wrap it in an element with a stable size and `position: relative`.

```tsx
import { useState } from 'react'
import Cropper from 'react-easy-crop'

export default function Demo({ image }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  function onCropComplete(croppedArea, croppedAreaPixels) {
    console.log(croppedArea, croppedAreaPixels)
  }

  return (
    <div style={{ position: 'relative', width: 400, height: 300 }}>
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={4 / 3}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
      />
    </div>
  )
}
```

## Features

- Drag, zoom, rotate, touch, and keyboard interactions.
- Crop dimensions as pixels and percentages.
- Images as URLs or base64 strings.
- HTML5 video cropping.
- Mobile-friendly gestures.

## Examples

- [Basic cropper](/docs/examples/basic)
- [Cropped output](/docs/examples/output)
- [User upload](/docs/examples/upload)
- [Round crop area](/docs/examples/round)
- [Video cropper](/docs/examples/video)
- [Restore saved crop](/docs/examples/restore)
