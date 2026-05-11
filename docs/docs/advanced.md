---
sidebar_position: 5
title: Advanced
---

# Advanced

## Restore a crop

Prefer `initialCroppedAreaPercentages` when restoring a saved crop. Pixel values are rounded and can drift slightly after restore.

```tsx
<Cropper
  image={image}
  crop={crop}
  zoom={zoom}
  initialCroppedAreaPercentages={{
    x: 12,
    y: 8,
    width: 60,
    height: 45,
  }}
  onCropChange={setCrop}
  onZoomChange={setZoom}
/>
```

## Restore manually

Use these helpers when you need to calculate `crop` and `zoom` yourself:

```ts
import {
  getInitialCropFromCroppedAreaPercentages,
  getInitialCropFromCroppedAreaPixels,
} from 'react-easy-crop'
```

`getInitialCropFromCroppedAreaPercentages` accepts:

```ts
(
  croppedAreaPercentages,
  mediaSize,
  rotation,
  cropSize,
  minZoom,
  maxZoom
)
```

`getInitialCropFromCroppedAreaPixels` accepts the same arguments, with pixel crop values instead of percentage values.

## Custom transform

The default media transform is:

```css
translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})
```

Override `transform` if you need flips or custom transform order.

```tsx
<Cropper
  transform={[
    `translate(${crop.x}px, ${crop.y}px)`,
    `rotateZ(${rotation}deg)`,
    `rotateY(${flipHorizontal ? 180 : 0}deg)`,
    `scale(${zoom})`,
  ].join(' ')}
/>
```
