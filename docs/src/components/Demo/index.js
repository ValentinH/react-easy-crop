import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import Slider from '@material-ui/lab/Slider'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import ImgDialog from './ImgDialog'
import getCroppedImg from './cropImage'
import dogImg from './dog.jpeg'

const styles = theme => ({
  cropContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    [theme.breakpoints.up('sm')]: {
      height: 400,
    },
  },
  cropButton: {
    flexShrink: 0,
    marginLeft: 16,
  },
  controls: {
    padding: '0 16px',
    height: 80,
    display: 'flex',
    alignItems: 'center',
  },
  slider: {
    padding: '22px 0px',
  },
})

const Demo = ({ classes }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    const croppedImage = await getCroppedImg(dogImg, croppedAreaPixels)
    setCroppedImage(croppedImage)
  }, [croppedAreaPixels])

  const onClose = useCallback(() => {
    setCroppedImage(null)
  }, [])

  return (
    <div>
      <div className={classes.cropContainer}>
        <Cropper
          image={dogImg}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className={classes.controls}>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          classes={{ container: classes.slider }}
          onChange={(e, zoom) => setZoom(zoom)}
        />
        <Button
          onClick={showCroppedImage}
          variant="contained"
          color="primary"
          classes={{ root: classes.cropButton }}
        >
          Show Result
        </Button>
      </div>
      <ImgDialog img={croppedImage} onClose={onClose} />
    </div>
  )
}

export default withStyles(styles)(Demo)
