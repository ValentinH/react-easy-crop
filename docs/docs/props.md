---
sidebar_position: 3
title: Props
---

# Props

| Prop | Type | Required | Description |
| --- | --- | :-: | --- |
| `image` | `string` |  | Image to crop. `image` or `video` is required. |
| `video` | `string \| Array<{ src: string; type?: string }>` |  | Video to crop. `image` or `video` is required. |
| `crop` | `{ x: number; y: number }` | yes | Media position. `{ x: 0, y: 0 }` centers the media under the cropper. |
| `zoom` | `number` |  | Zoom between `minZoom` and `maxZoom`. Defaults to `1`. |
| `rotation` | `number` |  | Rotation in degrees. Defaults to `0`. |
| `aspect` | `number` |  | Crop area ratio. Defaults to `4 / 3`. |
| `minZoom` | `number` |  | Minimum zoom. Defaults to `1`. |
| `maxZoom` | `number` |  | Maximum zoom. Defaults to `3`. |
| `zoomWithScroll` | `boolean` |  | Enable scroll zoom. Defaults to `true`. |
| `cropShape` | `'rect' \| 'round'` |  | Crop area shape. Defaults to `'rect'`. |
| `cropSize` | `{ width: number; height: number }` |  | Fixed crop area size in pixels. Prefer `aspect` unless you really need fixed dimensions. |
| `showGrid` | `boolean` |  | Show third-line grid. Defaults to `true`. |
| `roundCropAreaPixels` | `boolean` |  | Round crop area dimensions to integer pixels. Defaults to `false`. |
| `zoomSpeed` | `number` |  | Multiplies zoom changes. Defaults to `1`. |
| `objectFit` | `'contain' \| 'cover' \| 'horizontal-cover' \| 'vertical-cover'` |  | Controls how the media fits the cropper. Defaults to `'contain'`. |
| `restrictPosition` | `boolean` |  | Restrict media position to cropper boundaries. Useful when `zoom < 1`. |
| `initialCroppedAreaPercentages` | `{ width: number; height: number; x: number; y: number }` |  | Restore a crop from a previous `croppedArea` value. Preferred over pixels. |
| `initialCroppedAreaPixels` | `{ width: number; height: number; x: number; y: number }` |  | Restore a crop from a previous `croppedAreaPixels` value. |
| `transform` | `string` |  | Custom CSS transform for the media. See [Custom transform](./advanced#custom-transform). |
| `style` | `{ containerStyle?: object; mediaStyle?: object; cropAreaStyle?: object }` |  | Inline style overrides. |
| `classes` | `{ containerClassName?: string; mediaClassName?: string; cropAreaClassName?: string }` |  | Custom class names. |
| `mediaProps` | `object` |  | Props passed to the image or video element. |
| `cropperProps` | `object` |  | Props passed to the cropper container. |
| `disableAutomaticStylesInjection` | `boolean` |  | Disable automatic CSS injection. |
| `setCropperRef` | `(ref: React.RefObject<HTMLDivElement>) => void` |  | Receives the cropper ref. |
| `setImageRef` | `(ref: React.RefObject<HTMLImageElement>) => void` |  | Receives the image ref. |
| `setVideoRef` | `(ref: React.RefObject<HTMLVideoElement>) => void` |  | Receives the video ref. |
| `setMediaSize` | `(size: MediaSize) => void` |  | Exposes media size for advanced restore helpers. |
| `setCropSize` | `(size: Size) => void` |  | Exposes crop size for advanced restore helpers. |
| `nonce` | `string` |  | Nonce added to the injected style tag. |
| `keyboardStep` | `number` |  | Pixels moved per arrow key press. Defaults to `1`. |
