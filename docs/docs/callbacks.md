---
sidebar_position: 4
title: Callbacks
---

# Callbacks

## `onCropChange`

Called every time the crop position changes. Use it to update controlled `crop` state.

```tsx
<Cropper crop={crop} onCropChange={setCrop} />
```

## `onZoomChange`

Called every time zoom changes. Use it to update controlled `zoom` state.

```tsx
<Cropper zoom={zoom} onZoomChange={setZoom} />
```

## `onRotationChange`

Called when rotation changes through gestures or controlled UI.

```tsx
<Cropper rotation={rotation} onRotationChange={setRotation} />
```

## `onCropComplete`

Called once after media initialization, when a mouse, touch, or keyboard interaction ends, and after wheel or resize activity has been quiet for 250 ms.

```tsx
function onCropComplete(croppedArea, croppedAreaPixels) {
  saveCrop(croppedArea)
  renderPreview(croppedAreaPixels)
}
```

Both arguments have this shape:

```js
{
  x: number,
  y: number,
  width: number,
  height: number,
}
```

`croppedArea` is percentages. `croppedAreaPixels` is pixels.

Unrelated renders and values that calculate the same crop do not emit the callback again. If the cropper corrects a controlled crop or zoom value, crop callbacks run after the corrected value commits.

## `onCropAreaChange`

Same arguments as `onCropComplete`, but called once per committed crop change during interactions and relevant controlled updates instead of waiting for completion.

## `onMediaLoaded`

Called when the media loads.

```tsx
<Cropper
  onMediaLoaded={(mediaSize) => {
    setZoom(300 / mediaSize.naturalHeight)
  }}
/>
```

## Size changes

`onMediaSizeChange` receives `{ width, height, naturalWidth, naturalHeight }` when the measured media size changes. `onCropSizeChange` receives `{ width, height }` when the crop area size changes. Equal measurements and unrelated renders do not emit either callback.

## Interaction gates

Use `onWheelRequest` and `onTouchRequest` to allow or block interactions.

```tsx
<Cropper
  onWheelRequest={(event) => event.ctrlKey}
  onTouchRequest={(event) => event.touches.length > 1}
/>
```

`onInteractionStart` and `onInteractionEnd` fire around wheel, touch, mouse, and arrow-key interactions.

They receive an interaction object with a `source` field:

```tsx
<Cropper
  onInteractionStart={({ source }) => {
    if (source === 'touch') {
      // ...
    }
  }}
/>
```

`source` is `'mouse'`, `'touch'`, `'wheel'`, or `'keyboard'`.
