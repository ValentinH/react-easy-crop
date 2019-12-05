# react-easy-crop

A React component to crop images/videos with easy interactions

[![version][version-badge]][package] [![Monthly downloads][npmstats-badge]][npmstats] ![gzip size][gzip-badge] [![All Contributors](https://img.shields.io/badge/all_contributors-15-green.svg?style=flat-square)](#contributors) [![Build Status][build-badge]][build-page] [![MIT License][license-badge]][license] [![PRs Welcome][prs-badge]][prs]

![react-easy-crop Demo](https://user-images.githubusercontent.com/2678610/41561426-365e7a44-734a-11e8-8e0e-1c04251f53e4.gif)

## Demo

Check out the examples:

- [Basic example with hooks](https://codesandbox.io/s/v69ly910ql)
- [Basic example with class](https://codesandbox.io/s/q80jom5ql6)
- [Example with output of the cropped image](https://codesandbox.io/s/q8q1mnr01w)
- [Example with image selected by the user](https://codesandbox.io/s/y09komm059)
- [Example with round crop area and no grid](https://codesandbox.io/s/53w20p2o3n)
- [Example without restricted position](https://codesandbox.io/s/1rmqky233q)
- [Example with crop saved/loaded to/from local storage](https://codesandbox.io/s/pmj19vp2yx)

## Features

- Supports drag, zoom and rotate interactions
- Provides crop dimensions as pixels and percentages
- Supports any images format (JPEG, PNG, even GIF) as url or base 64 string
- Supports any videos format supported in HTML5
- Mobile friendly

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
import Cropper from 'react-easy-crop'

class App extends React.Component {
  state = {
    image: 'your-image-url or as base64',
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 4 / 3,
  }

  onCropChange = crop => {
    this.setState({ crop })
  }

  onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels)
  }

  onZoomChange = zoom => {
    this.setState({ zoom })
  }

  render() {
    return (
      <Cropper
        image={this.state.image}
        crop={this.state.crop}
        zoom={this.state.zoom}
        aspect={this.state.aspect}
        onCropChange={this.onCropChange}
        onCropComplete={this.onCropComplete}
        onZoomChange={this.onZoomChange}
      />
    )
  }
}
```

## Props

| Prop                                    | Type                                                                                | Required | Description                                                                                                                                                                                                                                                                                                                               |
| :-------------------------------------- | :---------------------------------------------------------------------------------- | :------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`                                 | string                                                                              |          | The image to be cropped. `image` or `video` is required.                                                                                                                                                                                                                                                                                  |
| `video`                                 | string                                                                              |          | The video to be cropped. `image` or `video` is required.                                                                                                                                                                                                                                                                                  |
| `crop`                                  | `{ x: number, y: number }`                                                          |    ✓     | Position of the media. `{ x: 0, y: 0 }` will center the media under the cropper.                                                                                                                                                                                                                                                          |
| `zoom`                                  | number                                                                              |          | Zoom of the media between `minZoom` and `maxZoom`. Defaults to 1.                                                                                                                                                                                                                                                                         |
| `rotation`                              | number (in degrees)                                                                 |          | Rotation of the media. Defaults to 0.                                                                                                                                                                                                                                                                                                     |
| `aspect`                                | number                                                                              |          | Aspect of the cropper. The value is the ratio between its width and its height. The default value is `4/3`                                                                                                                                                                                                                                |
| `minZoom`                               | number                                                                              |          | Minimum zoom of the media. Defaults to 1.                                                                                                                                                                                                                                                                                                 |
| `maxZoom`                               | number                                                                              |          | Maximum zoom of the media. Defaults to 3.                                                                                                                                                                                                                                                                                                 |
| `cropShape`                             | 'rect' \| 'round'                                                                   |          | Shape of the crop area. Defaults to 'rect'.                                                                                                                                                                                                                                                                                               |
| `cropSize`                              | `{ width: number, height: number }`                                                 |          | Size of the crop area (in pixels). If you don't provide it, it will be computed automatically using the `aspect` prop and the media size. _Warning_: this cannot be changed once the component is displayed. If you need to change it (based on some user inputs for instance), you can force the component to be reset by using a `key`. |
| `showGrid`                              | boolean                                                                             |          | Whether to show or not the grid (third-lines). Defaults to `true`.                                                                                                                                                                                                                                                                        |
| `zoomSpeed`                             | number                                                                              |          | Multiplies the value by which the zoom changes. Defaults to 1.                                                                                                                                                                                                                                                                            |
| `crossOrigin`                           | string                                                                              |          | Allows setting the crossOrigin attribute on the media.                                                                                                                                                                                                                                                                                    |
| `onCropChange`                          | crop => void                                                                        |    ✓     | Called everytime the crop is changed. Use it to update your `crop` state.                                                                                                                                                                                                                                                                 |
| `onZoomChange`                          | zoom => void                                                                        |          | Called everytime the zoom is changed. Use it to update your `zoom` state.                                                                                                                                                                                                                                                                 |
| `onRotationChange`                      | rotation => void                                                                    |          | Called everytime the rotation is changed (with mobile gestures). Use it to update your `rotation` state.                                                                                                                                                                                                                                  |
| [`onCropComplete`](#onCropCompleteProp) | Function                                                                            |          | Called when the user stops moving the media or stops zooming. It will be passed the corresponding cropped area on the media in percentages and pixels                                                                                                                                                                                     |
| `onMediaError`                          | Function                                                                            |          | Called when error occurs while loading an external media.                                                                                                                                                                                                                                                                                 |
| `onImgError`                            | Function                                                                            |          | Deprecated : Called when error occurs while loading an external media                                                                                                                                                                                                                                                                     |
| `style`                                 | `{ containerStyle: object, mediaStyle: object, cropAreaStyle: object }`             |          | Custom styles to be used with the Cropper. Styles passed via the style prop are merged with the defaults.                                                                                                                                                                                                                                 |
| `classes`                               | `{ containerClassName: string, mediaClassName: string, cropAreaClassName: string }` |          | Custom class names to be used with the Cropper. Classes passed via the classes prop are merged with the defaults.                                                                                                                                                                                                                         |
| `mediaProps`                            | object                                                                              |          | The properties you want to apply to the media tag (<img /> or <video /> depending on your media)                                                                                                                                                                                                                                          |
| `restrictPosition`                      | boolean                                                                             |          | Whether the position of the media should be restricted to the boundaries of the cropper. Useful setting in case of `zoom < 1` or if the cropper should preserve all media content while forcing a specific aspect ratio for media throughout the application. Example: https://codesandbox.io/s/1rmqky233q.                               |
|                                         |
| `initialCroppedAreaPixels`              | `{ width: number, height: number, x: number, y: number}`                            |          | Use this to set the initial crop position/zoom of the cropper (for example, when editing a previously cropped media). The value should be the same as the `croppedAreaPixels` passed to [`onCropComplete`](#onCropCompleteProp) Example: https://codesandbox.io/s/pmj19vp2yx.                                                             |
| `onInteractionStart`                    | `Function`                                                                          |          | Called everytime a user starts a wheel, touch or mousedown event.                                                                                                                                                                                                                                                                         |
| `onInteractionEnd`                      | `Function`                                                                          |          | Called everytime a user ends a wheel, touch or mousedown event.                                                                                                                                                                                                                                                                           |
| `onMediaLoaded`                         | `Function`                                                                          |          | Called when media gets loaded. Gets passed an `mediaSize` object like `{ width, height, naturalWidth, naturalHeight }`                                                                                                                                                                                                                    |
| `onImageLoaded`                         | `Function`                                                                          |          | Deprecated : Called when image gets loaded. Gets passed an `mediaSize` object like `{ width, height, naturalWidth, naturalHeight }`                                                                                                                                                                                                       |

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
      onMediaLoaded={mediaSize => {
        // Adapt zoom based on media size to fit max height
        setZoom(CONTAINER_HEIGHT / mediaSize.naturalHeight)
      }}
    />
  )
}
```

## Development

```shell
yarn
yarn start
```

Now, open `http://localhost:3001/index.html` and start hacking!

## License

[MIT](https://github.com/ricardo-ch/react-easy-crop/blob/master/LICENSE)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://valentin-hervieu.fr"><img src="https://avatars2.githubusercontent.com/u/2678610?v=4" width="100px;" alt="Valentin Hervieu"/><br /><sub><b>Valentin Hervieu</b></sub></a><br /><a href="#question-ValentinH" title="Answering Questions">💬</a> <a href="https://github.com/ricardo-ch/react-easy-crop/issues?q=author%3AValentinH" title="Bug reports">🐛</a> <a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=ValentinH" title="Code">💻</a> <a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=ValentinH" title="Documentation">📖</a> <a href="#example-ValentinH" title="Examples">💡</a> <a href="#infra-ValentinH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/ricardo-ch/react-easy-crop/pulls?q=is%3Apr+reviewed-by%3AValentinH" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=ValentinH" title="Tests">⚠️</a> <a href="#tool-ValentinH" title="Tools">🔧</a></td>
    <td align="center"><a href="https://github.com/bexoss"><img src="https://avatars3.githubusercontent.com/u/12633102?v=4" width="100px;" alt="Juntae Kim"/><br /><sub><b>Juntae Kim</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=bexoss" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tafelito"><img src="https://avatars0.githubusercontent.com/u/5973652?v=4" width="100px;" alt="tafelito"/><br /><sub><b>tafelito</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=tafelito" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/nicklasfrahm"><img src="https://avatars3.githubusercontent.com/u/20382326?v=4" width="100px;" alt="Nicklas"/><br /><sub><b>Nicklas</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=nicklasfrahm" title="Code">💻</a></td>
    <td align="center"><a href="http://kylepoole.me"><img src="https://avatars0.githubusercontent.com/u/4165376?v=4" width="100px;" alt="Kyle Poole"/><br /><sub><b>Kyle Poole</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=yokelpole" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/nbibler"><img src="https://avatars0.githubusercontent.com/u/3775?v=4" width="100px;" alt="Nathaniel Bibler"/><br /><sub><b>Nathaniel Bibler</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=nbibler" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/TheRealSlapshot"><img src="https://avatars0.githubusercontent.com/u/878149?v=4" width="100px;" alt="TheRealSlapshot"/><br /><sub><b>TheRealSlapshot</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=TheRealSlapshot" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://claudiuandrei.com"><img src="https://avatars3.githubusercontent.com/u/882064?v=4" width="100px;" alt="Claudiu Andrei"/><br /><sub><b>Claudiu Andrei</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=claudiuandrei" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/MattyBalaam"><img src="https://avatars1.githubusercontent.com/u/1246923?v=4" width="100px;" alt="MattyBalaam"/><br /><sub><b>MattyBalaam</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=MattyBalaam" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/christiankehr"><img src="https://avatars3.githubusercontent.com/u/24647736?v=4" width="100px;" alt="Christian Kehr"/><br /><sub><b>Christian Kehr</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=christiankehr" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Alba-C"><img src="https://avatars1.githubusercontent.com/u/24299944?v=4" width="100px;" alt="Christopher Albanese"/><br /><sub><b>Christopher Albanese</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=Alba-C" title="Code">💻</a></td>
    <td align="center"><a href="https://benjamin.piouffle.com"><img src="https://avatars1.githubusercontent.com/u/1556356?v=4" width="100px;" alt="Benjamin Piouffle"/><br /><sub><b>Benjamin Piouffle</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=Betree" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mbalaam"><img src="https://avatars3.githubusercontent.com/u/44968243?v=4" width="100px;" alt="mbalaam"/><br /><sub><b>mbalaam</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=mbalaam" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/edoudou"><img src="https://avatars0.githubusercontent.com/u/4236706?v=4" width="100px;" alt="Edouard Short"/><br /><sub><b>Edouard Short</b></sub></a><br /><a href="https://github.com/ricardo-ch/react-easy-crop/commits?author=edoudou" title="Code">💻</a> <a href="#ideas-edoudou" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://allcontributors.org"><img src="https://avatars1.githubusercontent.com/u/46410174?v=4" width="100px;" alt="All Contributors"/><br /><sub><b>All Contributors</b></sub></a><br /><a href="#tool-all-contributors" title="Tools">🔧</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[version-badge]: https://img.shields.io/npm/v/react-easy-crop.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-easy-crop
[downloads-badge]: https://img.shields.io/npm/dm/react-easy-crop.svg?style=flat-square
[npmstats]: http://npm-stat.com/charts.html?package=react-easy-crop&from=2018-06-18
[npmstats-badge]: https://img.shields.io/npm/dm/react-easy-crop.svg?style=flat-square
[gzip-badge]: http://img.badgesize.io/https://unpkg.com/react-easy-crop/dist/standalone/react-easy-crop.min.js?compression=gzip&style=flat-square
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license]: https://github.com/ricardo-ch/react-easy-crop/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[build-badge]: https://circleci.com/gh/ricardo-ch/react-easy-crop/tree/master.svg?style=svg
[build-page]: https://circleci.com/gh/ricardo-ch/react-easy-crop/tree/master
