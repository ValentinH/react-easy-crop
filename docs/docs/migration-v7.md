---
title: Migrate from v6 to v7
---

# Migrate from v6 to v7

Version 7 replaces the class implementation with hooks and requires React 19.2 or newer.

The published package is built with React Compiler. Consumers do not need to configure the compiler to use the cropper.

```shell
pnpm add react@^19.2.0 react-dom@^19.2.0 react-easy-crop@^7
```

## Replace legacy refs

The component `ref` now points to the outer container. The class instance and its imperative fields and methods are no longer public.

Use `cropAreaRef` for the visible crop area and `mediaRef` for the image or video:

```tsx
import { useRef } from 'react'

const containerRef = useRef<HTMLDivElement>(null)
const cropAreaRef = useRef<HTMLDivElement>(null)
const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null)

<Cropper
  ref={containerRef}
  cropAreaRef={cropAreaRef}
  mediaRef={mediaRef}
  // ...controlled props
/>
```

Replace the removed props as follows:

| Version 6                      | Version 7                    |
| ------------------------------ | ---------------------------- |
| Class-instance `ref`           | `ref` to the outer container |
| `setCropperRef`                | `cropAreaRef`                |
| `setImageRef` or `setVideoRef` | `mediaRef`                   |
| `setMediaSize`                 | `onMediaSizeChange`          |
| `setCropSize`                  | `onCropSizeChange`           |

Refs accept callback refs and ref objects. `onMediaLoaded` remains available for load-specific work; use `onMediaSizeChange` when every measured size change matters.

## Callback timing

Callbacks are deduplicated in version 7:

- `onCropAreaChange` runs once for each committed crop calculation during an interaction or relevant controlled update.
- `onCropComplete` runs after media initialization, at interaction completion, or 250 ms after the final wheel or resize event.
- `onMediaSizeChange` and `onCropSizeChange` run only when their measured values change.
- Unrelated renders and equivalent values do not emit callbacks.
- Controlled crop corrections emit crop data only after the corrected value commits.

Do not depend on callbacks firing again because a callback prop or unrelated prop changed.

## Styles

Automatic CSS now uses a React-managed stylesheet resource. React hoists and deduplicates the style in the correct document, including iframe portals, and includes it during server rendering. When `nonce` is set, the cropper uses a nonce-bearing inline stylesheet so the prop also works with non-streaming server rendering. `disableAutomaticStylesInjection` remains available.

When automatic styles are disabled, import the package CSS:

```tsx
import 'react-easy-crop/react-easy-crop.css'
```

## TypeScript defaults

Props with runtime defaults are now optional in `CropperProps`. Existing controlled `crop` and `onCropChange` usage is unchanged.
