---
sidebar_position: 2
title: Styling
---

# Styling

`react-easy-crop` renders its CSS automatically as a React-managed stylesheet resource. React hoists it into the document head and deduplicates it. A cropper rendered through a portal into an iframe uses that iframe's document.

Pass `nonce` when your Content Security Policy requires a nonce for inline styles. This switches to a nonce-bearing inline stylesheet so it also works with non-streaming server rendering:

```tsx
<Cropper nonce={cspNonce} />
```

If you disable the managed stylesheet, import the CSS yourself:

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
