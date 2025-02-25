# react-easy-crop

A React component to crop images/videos with easy interactions

[![version][version-badge]][package] ![brotli size][brotli-badge] [![All Contributors](https://img.shields.io/badge/all_contributors-35-green.svg?style=flat-square)](#contributors) [![Build Status][build-badge]][build-page] [![Test Status][test-badge]][test-action] [![MIT License][license-badge]][license] [![PRs Welcome][prs-badge]][prs] [![Auto Release](https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto)](https://github.com/intuit/auto)

<p align="center">
  <img src="https://user-images.githubusercontent.com/2678610/41561426-365e7a44-734a-11e8-8e0e-1c04251f53e4.gif" alt="Demo GIF" />
</p>

[![react-easy-crop npminsights](https://npminsights.vercel.app/api/package/readme-image/react-easy-crop?v=2023-02-22)](https://npminsights.vercel.app/package/react-easy-crop)

## Demo

Check out the examples:

- [Basic example with hooks](https://codesandbox.io/s/v69ly910ql)
- [Basic example with class](https://codesandbox.io/s/q80jom5ql6)
- [Basic example in Typescript](https://codesandbox.io/s/react-easy-crop-in-ts-lj1if)
- [Example with output of the cropped image](https://codesandbox.io/s/q8q1mnr01w)
- [Example with live output](https://codesandbox.io/s/react-easy-crop-with-live-output-kkqj0)
- [Example with server-side cropping using sharp](https://codesandbox.io/s/react-easy-crop-with-sharp-psj5h)
- [Example with image selected by the user (+ auto-rotation for phone pictures)](https://codesandbox.io/s/y09komm059)
- [Example with round crop area and no grid](https://codesandbox.io/s/53w20p2o3n)
- [Example without restricted position](https://codesandbox.io/s/1rmqky233q)
- [Example with crop saved/loaded to/from local storage](https://codesandbox.io/s/pmj19vp2yx)
- [Example with a video](https://codesandbox.io/s/react-easy-crop-for-videos-lfhme)
- [Example within scrollable content](https://codesandbox.io/s/react-easy-crop-scroll-demo-fp21qd)

## Features

- Supports drag, zoom and rotate interactions
- Provides crop dimensions as pixels and percentages
- Supports any images format (JPEG, PNG, even GIF) as url or base 64 string
- Supports any videos format supported in HTML5
- Mobile friendly

**If react-easy-crop doesn't cover your needs we recommend taking a look at [Pintura](https://pqina.nl/pintura/?ref=reacteasycrop)**

Pintura features cropping, rotating, flipping, filtering, annotating, and lots of additional functionality to cover all your image and video editing needs on both mobile and desktop devices.

**[Learn more about Pintura](https://pqina.nl/pintura/?ref=reacteasycrop)**

## Video tutorials from the community

- [Create an image gallery with live cropping](https://www.youtube.com/watch?v=E_AHkWHhUz4) By [Coding With Adam](https://youtube.com/c/codingwithadam)
- [Crop an avatar and download the result](https://www.youtube.com/watch?v=RmiP1AY5HFM) By [Manish Boro](https://www.youtube.com/channel/UCyq81Ac-Ir4WIhFUgb_kyRw)

## Installation

```shell
yarn add react-easy-crop
```

or

```shell
npm install react-easy-crop --save
```

## Basic usage

> The Cropper is styled with `position: absolute` to take the full space of its parent.
> Thus, you need to wrap it with an element that uses `position: relative` or the Cropper will fill the whole page.

```js
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

const Demo = () => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
  }

  return (
    <Cropper
      image={yourImage}
      crop={crop}
      zoom={zoom}
      aspect={4 / 3}
      onCropChange={setCrop}
      onCropComplete={onCropComplete}
      onZoomChange={setZoom}
    />
  )
}
```

## Styles

This component requires some styles to be available in the document. By default, you don't need to do anything, the component will automatically inject the required styles in the document head. If you want to disable this behaviour and manually inject the CSS, you can set the `disableAutomaticStylesInjection` prop to `true` and use the file available in the package: `react-easy-crop/react-easy-crop.css`.

## Known issues

### The cropper size isn't correct when displayed in a modal

If you are using the Cropper inside a modal, you should ensure that there is no opening animation that is changing the modal dimensions (scaling effect). Fading or sliding animations are fine.
See [#428](https://github.com/ValentinH/react-easy-crop/issues/428), [#409](https://github.com/ValentinH/react-easy-crop/issues/409),  [#267](https://github.com/ValentinH/react-easy-crop/issues/267) or [#400](https://github.com/ValentinH/react-easy-crop/issues/400) for more details.

## Props

| Prop                                                                      | Type                                                                                | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                |
| :------------------------------------------------------------------------ | :---------------------------------------------------------------------------------- | :------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`                                                                   | string                                                                              |          | The image to be cropped. `image` or `video` is required.                                                                                                                                                                                                                                                                                                                                                   |
| `video`                                                                   | string or `Array<{ src: string; type?: string }>`                                   |          | The video to be cropped. `image` or `video` is required.                                                                                                                                                                                                                                                                                                                                                   |
| `crop`                                                                    | `{ x: number, y: number }`                                                          |    ✓     | Position of the media. `{ x: 0, y: 0 }` will center the media under the cropper.                                                                                                                                                                                                                                                                                                                           |
| `zoom`                                                                    | number                                                                              |          | Zoom of the media between `minZoom` and `maxZoom`. Defaults to 1.                                                                                                                                                                                                                                                                                                                                          |
| `rotation`                                                                | number (in degrees)                                                                 |          | Rotation of the media. Defaults to 0.                                                                                                                                                                                                                                                                                                                                                                      |
| `aspect`                                                                  | number                                                                              |          | Aspect of the cropper. The value is the ratio between its width and its height. The default value is `4/3`                                                                                                                                                                                                                                                                                                 |
| `minZoom`                                                                 | number                                                                              |          | Minimum zoom of the media. Defaults to 1.                                                                                                                                                                                                                                                                                                                                                                  |
| `maxZoom`                                                                 | number                                                                              |          | Maximum zoom of the media. Defaults to 3.                                                                                                                                                                                                                                                                                                                                                                  |
| `zoomWithScroll`                                                          | boolean                                                                             |          | Enable zoom by scrolling. Defaults to `true`                                                                                                                                                                                                                                                                                                                                                               |
| `cropShape`                                                               | 'rect' \| 'round'                                                                   |          | Shape of the crop area. Defaults to 'rect'.                                                                                                                                                                                                                                                                                                                                                                |
| `cropSize`                                                                | `{ width: number, height: number }`                                                 |          | Size of the crop area (in pixels). If you don't provide it, it will be computed automatically using the `aspect` prop and the media size. **You should probably not use this option and should rely on aspect instead. See https://github.com/ValentinH/react-easy-crop/issues/186.**                                                                                                                      |
| `showGrid`                                                                | boolean                                                                             |          | Whether to show or not the grid (third-lines). Defaults to `true`.                                                                                                                                                                                                                                                                                                                                         |
| `zoomSpeed`                                                               | number                                                                              |          | Multiplies the value by which the zoom changes. Defaults to 1.                                                                                                                                                                                                                                                                                                                                             |
| `objectFit` [demo](https://codesandbox.io/s/react-easy-crop-forked-p9r34) | 'contain', 'cover', 'horizontal-cover' or 'vertical-cover'                          |          | Specifies how the image is shown in the cropper. `contain`: the image will be adjusted to be fully visible, `horizontal-cover`: the image will horizontally fill the cropper, `vertical-cover`: the image will vertically fill the cropper, `cover`: we automatically pick between `horizontal-cover` or `vertical-cover` to have a fully visible image inside the cropper area. Defaults to "contain".    |
| `onCropChange`                                                            | crop => void                                                                        |    ✓     | Called every time the crop is changed. Use it to update your `crop` state.                                                                                                                                                                                                                                                                                                                                 |
| `onZoomChange`                                                            | zoom => void                                                                        |          | Called every time the zoom is changed. Use it to update your `zoom` state.                                                                                                                                                                                                                                                                                                                                 |
| `onRotationChange`                                                        | rotation => void                                                                    |          | Called every time the rotation is changed (with mobile or multi-fingers gestures). Use it to update your `rotation` state.                                                                                                                                                                                                                                                                                 |
| `onCropSizeChange`                                                        | cropSize => void                                                                    |          | Called when a change in either the cropSize width or the cropSize height occurs.                                                                                                                                                                                                                                                                                                                           |
| [`onCropComplete`](#onCropCompleteProp)                                   | Function                                                                            |          | Called when the user stops moving the media or stops zooming. It will be passed the corresponding cropped area on the media in percentages and pixels (rounded to the nearest integer)                                                                                                                                                                                                                     |
| [`onCropAreaChange`](#onCropAreaChangeProp)                               | Function                                                                            |          | Very similar to [`onCropComplete`](#onCropCompleteProp) but is triggered for every user interaction instead of waiting for the user to stop.                                                                                                                                                                                                                                                               |
| `transform`                                                               | string                                                                              |          | CSS transform to apply to the image in the editor. Defaults to `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})` with variables being pulled from props.                                                                                                                                                                                                                         |
| `style`                                                                   | `{ containerStyle: object, mediaStyle: object, cropAreaStyle: object }`             |          | Custom styles to be used with the Cropper. Styles passed via the style prop are merged with the defaults.                                                                                                                                                                                                                                                                                                  |
| `classes`                                                                 | `{ containerClassName: string, mediaClassName: string, cropAreaClassName: string }` |          | Custom class names to be used with the Cropper. Classes passed via the classes prop are merged with the defaults. If you have CSS specificity issues, you should probably use the `disableAutomaticStylesInjection` prop.                                                                                                                                                                                  |
| `mediaProps`                                                              | object                                                                              |          | The properties you want to apply to the media tag (<img /> or <video /> depending on your media)                                                                                                                                                                                                                                                                                                           |
| `cropperProps`                                                            | object                                                                              |          | The properties you want to apply to the cropper.                                                                                                                                                                                                                                                                                                                                             |
| `restrictPosition`                                                        | boolean                                                                             |          | Whether the position of the media should be restricted to the boundaries of the cropper. Useful setting in case of `zoom < 1` or if the cropper should preserve all media content while forcing a specific aspect ratio for media throughout the application. Example: https://codesandbox.io/s/1rmqky233q.                                                                                                |
| `initialCroppedAreaPercentages`                                           | `{ width: number, height: number, x: number, y: number}`                            |          | Use this to set the initial crop position/zoom of the cropper (for example, when editing a previously cropped media). The value should be the same as the `croppedArea` passed to [`onCropComplete`](#onCropCompleteProp). This is the preferred way of restoring the previously set crop because `croppedAreaPixels` is rounded, and when used for restoration, may result in a slight drifting crop/zoom |
| `initialCroppedAreaPixels`                                                | `{ width: number, height: number, x: number, y: number}`                            |          | Use this to set the initial crop position/zoom of the cropper (for example, when editing a previously cropped media). The value should be the same as the `croppedAreaPixels` passed to [`onCropComplete`](#onCropCompleteProp) Example: https://codesandbox.io/s/pmj19vp2yx.                                                                                                                              |
| `onInteractionStart`                                                      | `Function`                                                                          |          | Called every time a user starts a wheel, touch, mousedown or keydown (for arrow keys only) event.                                                                                                                                                                                                                                                                                                          |
| `onInteractionEnd`                                                        | `Function`                                                                          |          | Called every time a user ends a wheel, touch, mousedown or keydown (for arrow keys only) event.                                                                                                                                                                                                                                                                                                            |
| `onMediaLoaded`                                                           | `Function`                                                                          |          | Called when media gets loaded. Gets passed an `mediaSize` object like `{ width, height, naturalWidth, naturalHeight }`                                                                                                                                                                                                                                                                                     |
| `onTouchRequest`                                                          | `(e: React.TouchEvent<HTMLDivElement>) => boolean`                                  |          | Can be used to cancel a touch request by returning `false`.                                                                                                                                                                                                                                                                                                                                                |
| `onWheelRequest`                                                          | `(e: WheelEvent) => boolean`                                                        |          | Can be used to cancel a zoom with wheel request by returning `false`.                                                                                                                                                                                                                                                                                                                                      |
| `disableAutomaticStylesInjection`                                         | boolean                                                                             |          | Whether to auto inject styles using a style tag in the document head on component mount. When disabled you need to import the css file into your application manually (style file is available in `react-easy-crop/react-easy-crop.css`). Example with sass/scss `@import "~react-easy-crop/react-easy-crop";`.                                                                                            |
| `setCropperRef`                                                           | `(ref: React.RefObject<HTMLDivElement>) => void`                                    |          | Called when the component mounts, if present. Used to set the value of the cropper ref object in the parent component.                                                                                                                                                                                                                                                                                     |
| `setImageRef`                                                             | `(ref: React.RefObject<HTMLImageElement>) => void`                                  |          | Called when the component mounts, if present. Used to set the value of the image ref object in the parent component.                                                                                                                                                                                                                                                                                       |
| `setVideoRef`                                                             | `(ref: React.RefObject<HTMLVideoElement>) => void`                                  |          | Called when the component mounts, if present. Used to set the value of the video ref object in the parent component.                                                                                                                                                                                                                                                                                       |
| `setMediaSize`                                                            | `(size: MediaSize) => void`                                                         |          | [Advanced Usage] Used to expose the `mediaSize` value for use with the `getInitialCropFromCroppedAreaPixels` and `getInitialCropFromCroppedAreaPercentages` functions. See [this CodeSandbox instance](https://codesandbox.io/s/react-easy-crop-forked-3v0hi3) for a simple example.                                                                                                                       |
| `setCropSize`                                                             | `(size: Size) => void`                                                              |          | [Advanced Usage] Used to expose the `cropSize` value for use with the `getInitialCropFromCroppedAreaPixels` and `getInitialCropFromCroppedAreaPercentages` functions. See [this CodeSandbox instance](https://codesandbox.io/s/react-easy-crop-forked-3v0hi3) for a simple example.                                                                                                                        |
| `nonce`                                                                   | string                                                                              |          | The nonce to add to the style tag when the styles are auto injected.                                                                                                                                                                                                                                                                                                                                       |
| `keyboardStep`                                                            | number                                                                              |          | number of pixels the crop area moves with each press of an arrow key when using keyboard navigation. Defaults to 1.                                                                                                                                                                                                                                                     |

<a name="onCropCompleteProp"></a>

#### onCropComplete(croppedArea, croppedAreaPixels)

This callback is the one you should use to save the cropped area of the media. It's passed 2 arguments:

1. `croppedArea`: coordinates and dimensions of the cropped area in percentage of the media dimension
1. `croppedAreaPixels`: coordinates and dimensions of the cropped area in pixels.

Both arguments have the following shape:

```js
const area = {
  x: number, // x/y are the coordinates of the top/left corner of the cropped area
  y: number,
  width: number, // width of the cropped area
  height: number, // height of the cropped area
}
```

<a name="onCropAreaChangeProp"></a>

#### onCropAreaChange(croppedArea, croppedAreaPixels)

This is the exact same callback as [`onCropComplete`](#onCropCompleteProp), but is triggered for all user interactions.
It can be used if you are not performing any render action on it.

1. `croppedArea`: coordinates and dimensions of the cropped area in percentage of the media dimension
1. `croppedAreaPixels`: coordinates and dimensions of the cropped area in pixels.

Both arguments have the following shape:

```js
const area = {
  x: number, // x/y are the coordinates of the top/left corner of the cropped area
  y: number,
  width: number, // width of the cropped area
  height: number, // height of the cropped area
}
```

#### onMediaLoaded(mediaSize)

Called when media gets successfully loaded. This is useful if you want to have a custom zoom/crop
strategy based on media size.

**Example:**

```jsx
const CONTAINER_HEIGHT = 300

const CroppedImage = ({ image }) => {
  const [crop, onCropChange] = React.useState({ x: 0, y: 0 })
  const [zoom, onZoomChange] = React.useState(1)
  return (
    <Cropper
      image={image}
      crop={crop}
      zoom={zoom}
      onCropChange={onCropChange}
      onZoomChange={onZoomChange}
      onMediaLoaded={(mediaSize) => {
        // Adapt zoom based on media size to fit max height
        onZoomChange(CONTAINER_HEIGHT / mediaSize.naturalHeight)
      }}
    />
  )
}
```

#### getInitialCropFromCroppedAreaPercentages(croppedAreaPercentages: Area, mediaSize: MediaSize, rotation: number, cropSize: Size, minZoom: number, maxZoom: number)

[Advanced Usage]

Used to calculate values for crop and zoom based on a desired `croppedAreaPercentages`
value. See [this CodeSandbox instance](https://codesandbox.io/s/react-easy-crop-forked-3v0hi3) for a simple example.

#### getInitialCropFromCroppedAreaPixels(croppedAreaPixels: Area, mediaSize: MediaSize, rotation: number, cropSize: Size, minZoom: number, maxZoom: number)

[Advanced Usage]

See `getInitialCropFromCroppedAreaPercentages`.

## Development

```shell
yarn
yarn start
```

Now, open `http://localhost:3001/index.html` and start hacking!

## License

[MIT](https://github.com/ValentinH/react-easy-crop/blob/master/LICENSE)

## Maintainers

This project is maintained by Valentin Hervieu.

This project was originally part of [@ricardo-ch](https://github.com/ricardo-ch/) organisation because I (Valentin) was working at Ricardo.
After leaving this company, they gracefully accepted to transfer the project to me. ❤️

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://valentin-hervieu.fr"><img src="https://avatars2.githubusercontent.com/u/2678610?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Valentin Hervieu</b></sub></a><br /><a href="#question-ValentinH" title="Answering Questions">💬</a> <a href="https://github.com/ValentinH/react-easy-crop/issues?q=author%3AValentinH" title="Bug reports">🐛</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=ValentinH" title="Code">💻</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=ValentinH" title="Documentation">📖</a> <a href="#example-ValentinH" title="Examples">💡</a> <a href="#infra-ValentinH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ValentinH/react-easy-crop/pulls?q=is%3Apr+reviewed-by%3AValentinH" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=ValentinH" title="Tests">⚠️</a> <a href="#tool-ValentinH" title="Tools">🔧</a></td>
    <td align="center"><a href="https://github.com/bexoss"><img src="https://avatars3.githubusercontent.com/u/12633102?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Juntae Kim</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=bexoss" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tafelito"><img src="https://avatars0.githubusercontent.com/u/5973652?v=4?s=100" width="100px;" alt=""/><br /><sub><b>tafelito</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=tafelito" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nicklasfrahm"><img src="https://avatars3.githubusercontent.com/u/20382326?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicklas</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=nicklasfrahm" title="Code">💻</a></td>
    <td align="center"><a href="http://kylepoole.me"><img src="https://avatars0.githubusercontent.com/u/4165376?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kyle Poole</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=yokelpole" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/nbibler"><img src="https://avatars0.githubusercontent.com/u/3775?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nathaniel Bibler</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=nbibler" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/TheRealSlapshot"><img src="https://avatars0.githubusercontent.com/u/878149?v=4?s=100" width="100px;" alt=""/><br /><sub><b>TheRealSlapshot</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=TheRealSlapshot" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://claudiuandrei.com"><img src="https://avatars3.githubusercontent.com/u/882064?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Claudiu Andrei</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=claudiuandrei" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/MattyBalaam"><img src="https://avatars1.githubusercontent.com/u/1246923?v=4?s=100" width="100px;" alt=""/><br /><sub><b>MattyBalaam</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=MattyBalaam" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/christiankehr"><img src="https://avatars3.githubusercontent.com/u/24647736?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Christian Kehr</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=christiankehr" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Alba-C"><img src="https://avatars1.githubusercontent.com/u/24299944?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Christopher Albanese</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=Alba-C" title="Code">💻</a></td>
    <td align="center"><a href="https://benjamin.piouffle.com"><img src="https://avatars1.githubusercontent.com/u/1556356?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Benjamin Piouffle</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=Betree" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mbalaam"><img src="https://avatars3.githubusercontent.com/u/44968243?v=4?s=100" width="100px;" alt=""/><br /><sub><b>mbalaam</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=mbalaam" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/edoudou"><img src="https://avatars0.githubusercontent.com/u/4236706?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Edouard Short</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=edoudou" title="Code">💻</a> <a href="#ideas-edoudou" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://allcontributors.org"><img src="https://avatars1.githubusercontent.com/u/46410174?v=4?s=100" width="100px;" alt=""/><br /><sub><b>All Contributors</b></sub></a><br /><a href="#tool-all-contributors" title="Tools">🔧</a></td>
    <td align="center"><a href="https://github.com/FillPower1"><img src="https://avatars0.githubusercontent.com/u/46319022?v=4?s=100" width="100px;" alt=""/><br /><sub><b>FillPower1</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=FillPower1" title="Code">💻</a></td>
    <td align="center"><a href="https://nihey.org"><img src="https://avatars3.githubusercontent.com/u/5278570?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nihey Takizawa</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=nihey" title="Documentation">📖</a></td>
    <td align="center"><a href="http://ajlende.com"><img src="https://avatars0.githubusercontent.com/u/5129775?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Lende</b></sub></a><br /><a href="#maintenance-ajlende" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/stefanoruth"><img src="https://avatars0.githubusercontent.com/u/6178983?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stefano Ruth</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=stefanoruth" title="Code">💻</a> <a href="#ideas-stefanoruth" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/dvail"><img src="https://avatars1.githubusercontent.com/u/1292638?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David Vail</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=dvail" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ersefuril"><img src="https://avatars0.githubusercontent.com/u/4835854?v=4?s=100" width="100px;" alt=""/><br /><sub><b>ersefuril</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=ersefuril" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Michal-Sh"><img src="https://avatars1.githubusercontent.com/u/58683426?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michal-Sh</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=Michal-Sh" title="Code">💻</a></td>
    <td align="center"><a href="http://russianbrandgardeners.com"><img src="https://avatars.githubusercontent.com/u/640657?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ivan Galiatin</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=trurl-master" title="Code">💻</a> <a href="#example-trurl-master" title="Examples">💡</a></td>
    <td align="center"><a href="https://raed.dev"><img src="https://avatars.githubusercontent.com/u/1442690?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Raed</b></sub></a><br /><a href="#infra-raed667" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=raed667" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/cvolant"><img src="https://avatars.githubusercontent.com/u/37238472?v=4?s=100" width="100px;" alt=""/><br /><sub><b>cvolant</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=cvolant" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/CodingWith-Adam"><img src="https://avatars.githubusercontent.com/u/62483230?v=4?s=100" width="100px;" alt=""/><br /><sub><b>CodingWith-Adam</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=CodingWith-Adam" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/liveboom"><img src="https://avatars.githubusercontent.com/u/79549285?v=4?s=100" width="100px;" alt=""/><br /><sub><b>LiveBoom</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=liveboom" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/MatixYo"><img src="https://avatars.githubusercontent.com/u/6618041?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mateusz Juszczyk</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=MatixYo" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://labithiotis.com/"><img src="https://avatars.githubusercontent.com/u/784306?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Darren Labithiotis</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=labithiotis" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/oleksi-l"><img src="https://avatars.githubusercontent.com/u/30208419?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Oleksii</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=oleksi-l" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/vassbence"><img src="https://avatars.githubusercontent.com/u/49574140?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vass Bence</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=vassbence" title="Documentation">📖</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=vassbence" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/AnthonyUtt"><img src="https://avatars.githubusercontent.com/u/16091316?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anthony Utt</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=AnthonyUtt" title="Documentation">📖</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=AnthonyUtt" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/seanparmelee"><img src="https://avatars.githubusercontent.com/u/1933330?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sean Parmelee</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=seanparmelee" title="Documentation">📖</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=seanparmelee" title="Code">💻</a></td>
    <td align="center"><a href="http://glendaviesnz.wordpress.com/"><img src="https://avatars.githubusercontent.com/u/3629020?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Glen Davies</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=glendaviesnz" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/carlosdi0"><img src="https://avatars.githubusercontent.com/u/53301152?v=4?s=100" width="100px;" alt=""/><br /><sub><b>carlosdi0</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=carlosdi0" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/huseyinbuyukdere"><img src="https://avatars.githubusercontent.com/u/39594189?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hüseyin Büyükdere</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=huseyinbuyukdere" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/pontusdacke"><img src="https://avatars.githubusercontent.com/u/2884998?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pontus Magnusson</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=pontusdacke" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/kruchkou"><img src="https://avatars.githubusercontent.com/u/45610004?v=4?s=100" width="100px;" alt=""/><br /><sub><b>kruchkou</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=kruchkou" title="Code">💻</a></td>
    <td align="center"><a href="https://pqina.nl/"><img src="https://avatars.githubusercontent.com/u/1132575?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rik</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=rikschennink" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/aqeelat"><img src="https://avatars.githubusercontent.com/u/5212744?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Abdullah Alaqeel</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=aqeelat" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/thomasjohansen"><img src="https://avatars.githubusercontent.com/u/4906479?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Johansen</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=thomasjohansen" title="Code">💻</a></td>
    <td align="center"><a href="https://joseguardiola.dev/"><img src="https://avatars.githubusercontent.com/u/11366193?v=4?s=100" width="100px;" alt=""/><br /><sub><b>José Guardiola</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=JGuardiola95" title="Code">💻</a> <a href="https://github.com/ValentinH/react-easy-crop/commits?author=JGuardiola95" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/IanSymplectic"><img src="https://avatars.githubusercontent.com/u/1984952?v=4?s=100" width="100px;" alt=""/><br /><sub><b>IanSymplectic</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=IanSymplectic" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/priceld"><img src="https://avatars.githubusercontent.com/u/4000919?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Logan Price</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=priceld" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/apps/allcontributors"><img src="https://avatars.githubusercontent.com/in/23186?v=4?s=100" width="100px;" alt=""/><br /><sub><b>allcontributors[bot]</b></sub></a><br /><a href="https://github.com/ValentinH/react-easy-crop/commits?author=allcontributors[bot]" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[package]: https://www.npmjs.com/package/react-easy-crop
[version-badge]: https://img.shields.io/npm/v/react-easy-crop.svg?style=flat-square
[brotli-badge]: http://img.badgesize.io/https://unpkg.com/react-easy-crop/umd/react-easy-crop.min.js?compression=brotli&style=flat-square&1
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license]: https://github.com/ValentinH/react-easy-crop/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[build-badge]: https://circleci.com/gh/ValentinH/react-easy-crop/tree/main.svg?style=svg
[build-page]: https://circleci.com/gh/ValentinH/react-easy-crop/tree/main
[test-badge]: https://github.com/ValentinH/react-easy-crop/actions/workflows/quality-gate.yml/badge.svg
[test-action]: https://github.com/ValentinH/react-easy-crop/actions/workflows/quality-gate.yml
