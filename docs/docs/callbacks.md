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

Called when the user stops moving or zooming the media.

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

## `onCropAreaChange`

Same arguments as `onCropComplete`, but called during interaction instead of waiting for the interaction to end.

## `onMediaLoaded`

Called when the media loads.

```tsx
<Cropper
  onMediaLoaded={(mediaSize) => {
    setZoom(300 / mediaSize.naturalHeight)
  }}
/>
```

## Interaction gates

Use `onWheelRequest` and `onTouchRequest` to allow or block interactions.

```tsx
<Cropper
  onWheelRequest={(event) => event.ctrlKey}
  onTouchRequest={(event) => event.touches.length > 1}
/>
```

`onInteractionStart` and `onInteractionEnd` fire around wheel, touch, mouse, and arrow-key interactions.
