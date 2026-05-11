---
sidebar_position: 2
title: Styling
---

# Styling

`react-easy-crop` injects its required CSS automatically.

If you disable automatic injection, import the CSS yourself:

```tsx
import 'react-easy-crop/react-easy-crop.css'
```

```tsx
<Cropper disableAutomaticStylesInjection />
```

The cropper container uses absolute positioning. The parent element should define the cropper size:

```css
.cropper-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
}
```

Use `style` for inline overrides:

```tsx
<Cropper
  style={{
    containerStyle: { backgroundColor: '#111' },
    cropAreaStyle: { border: '2px solid white' },
    mediaStyle: { opacity: 0.95 },
  }}
/>
```

Use `classes` when you want CSS control:

```tsx
<Cropper
  classes={{
    containerClassName: 'cropper',
    cropAreaClassName: 'cropper-area',
    mediaClassName: 'cropper-media',
  }}
/>
```
