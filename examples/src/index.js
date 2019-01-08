import React from 'react'
import ReactDOM from 'react-dom'
import queryString from 'query-string'
import Cropper from '../../src'
import './styles.css'

const urlArgs = queryString.parse(window.location.search)
const imageSrc = urlArgs.img || '/images/dog.jpeg' // so we can change the image from our tests

class App extends React.Component {
  state = {
    imageSrc,
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 4 / 3,
    cropShape: 'rect',
    showGrid: true,
    zoomSpeed: 1,
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
      <div className="App">
        <div className="crop-container">
          <Cropper
            image={this.state.imageSrc}
            crop={this.state.crop}
            zoom={this.state.zoom}
            aspect={this.state.aspect}
            cropShape={this.state.cropShape}
            showGrid={this.state.showGrid}
            zoomSpeed={this.state.zoomSpeed}
            onCropChange={this.onCropChange}
            onCropComplete={this.onCropComplete}
            onZoomChange={this.onZoomChange}
          />
        </div>
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
