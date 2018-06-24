# react-easy-crop 

A React component to crop images with easy interactions


[![version][version-badge]][package] ![gzip size][gzip-badge] [![Build Status][build-badge]][build-page] [![MIT License][license-badge]][license] [![PRs Welcome][prs-badge]][prs]



![react-easy-crop Demo](https://user-images.githubusercontent.com/2678610/41561426-365e7a44-734a-11e8-8e0e-1c04251f53e4.gif)

## Demo

Check out the examples:
- [Basic example](https://codesandbox.io/s/q80jom5ql6)
- [Example with output of the cropped image](https://codesandbox.io/s/q8q1mnr01w)

## Features

* Supports drag and zoom interactions
* Provides crop dimensions as pixels and percentages
* Supports any images format (JPEG, PNG, even GIF) as url or base 64 string
* Mobile friendly

## Installation

```shell
yarn add react-easy-crop
```

or

```shell
npm install react-easy-crop --save
```

## Basic usage

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

| Prop | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `image` | string | ✓ | The image to be cropped. |
| `crop` | `{ x: number, y: number }` | ✓ | Position of the image. `{ x: 0, y: 0 }` will center the image under the cropper. |
| `zoom` | number | | Zoom of the image between 1 and 3. Defaults to 1. |
| `aspect` | number |  | Aspect of the cropper. The value is the ratio between its width and its height. The default value is `4/3`|
| `onCropChange` | Function | ✓ | Called everytime the crop is changed. Use it to update your `crop` state.|
| `onZoomChange` | Function |  | Called everytime the zoom is changed. Use it to update your `zoom` state. |
| [`onCropComplete`](#onCropCompleteProp) | Function |  | Called when the user stops moving the image or stops zooming. It will be passed the corresponding cropped area on the image in percentages and pixels |

<a name="onCropCompleteProp"></a>
#### onCropComplete(croppedArea, cropperAreaPixels)

This callback is the one you should use to save the cropped area of the image. It's passed 2 arguments:
1. `croppedArea`: coordinates and dimensions of the cropped area in percentage of the image dimension
1. `cropperAreaPixels`: coordinates and dimensions of the cropped area in pixels.

Both arguments have the following shape:
```js
const area = {
  x: number, // x/y are the coordinates of the top/left corner of the cropped area
  y: number,
  width: number, // width of the cropped area
  height: number, // height of the cropped area
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

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[version-badge]: https://img.shields.io/npm/v/react-easy-crop.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-easy-crop
[downloads-badge]: https://img.shields.io/npm/dm/react-easy-crop.svg?style=flat-square
[npmcharts]: http://npmcharts.com/compare/react-easy-crop
[gzip-badge]: http://img.badgesize.io/https://unpkg.com/react-easy-crop/dist/index.js?compression=gzip&style=flat-square
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license]: https://github.com/ricardo-ch/react-easy-crop/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[build-badge]: https://travis-ci.org/ricardo-ch/react-easy-crop.svg?branch=master
[build-page]: https://travis-ci.org/ricardo-ch/react-easy-crop
