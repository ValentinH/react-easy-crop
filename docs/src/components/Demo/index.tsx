import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import NoSsr from '@material-ui/core/NoSsr'
import Slider from '@material-ui/core/Slider'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import FlipIcon from '@material-ui/icons/Flip'
import React, { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop/types'
import getCroppedImg from './cropImage'
import dogImg from './dog.jpeg'
import ImgDialog from './ImgDialog'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cropContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
      background: '#333',
      [theme.breakpoints.up('sm')]: {
        height: 400,
      },
    },
    cropButton: {
      flexShrink: 0,
      marginLeft: 16,
    },
    controls: {
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    },
    sliderContainer: {
      display: 'flex',
      flex: '1',
      alignItems: 'center',
    },
    sliderLabel: {
      [theme.breakpoints.down('xs')]: {
        minWidth: 65,
      },
    },
    slider: {
      padding: '22px 0px',
      marginLeft: 16,
      [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: '0 16px',
      },
    },
  })
)

const Demo: React.FC = props => {
  const classes = useStyles(props)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [flip, setFlip] = useState({ horizontal: false, vertical: false })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const showCroppedImage = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(dogImg, croppedAreaPixels, rotation, flip)
      setCroppedImage(croppedImage)
    } catch (e) {
      console.error(e)
    }
  }, [croppedAreaPixels, rotation, flip])

  const onClose = useCallback(() => {
    setCroppedImage(null)
  }, [])

  return (
    <div>
      <div className={classes.cropContainer}>
        <NoSsr>
          <Cropper
            image={dogImg}
            transform={[
              `translate(${crop.x}px, ${crop.y}px)`,
              `rotateZ(${rotation}deg)`,
              `rotateY(${flip.horizontal ? 180 : 0}deg)`,
              `rotateX(${flip.vertical ? 180 : 0}deg)`,
              `scale(${zoom})`,
            ].join(' ')}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </NoSsr>
      </div>
      <div className={classes.controls}>
        <div className={classes.sliderContainer}>
          <Typography variant="overline" classes={{ root: classes.sliderLabel }}>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            classes={{ root: classes.slider }}
            onChange={(e, zoom) => setZoom(zoom as number)}
          />
        </div>
        <div className={classes.sliderContainer}>
          <Typography variant="overline" classes={{ root: classes.sliderLabel }}>
            Rotation
          </Typography>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={1}
            aria-labelledby="Rotation"
            classes={{ root: classes.slider }}
            onChange={(e, rotation) => setRotation(rotation as number)}
          />
        </div>
        <div className={classes.sliderContainer}>
          <IconButton
            aria-label="Flip Horizontal"
            onClick={() => {
              setFlip(prev => ({ horizontal: !prev.horizontal, vertical: prev.vertical }))
              setRotation(prev => 360 - prev)
            }}
          >
            <FlipIcon />
          </IconButton>
          <IconButton
            aria-label="Flip Vertical"
            onClick={() => {
              setFlip(prev => ({ horizontal: prev.horizontal, vertical: !prev.vertical }))
              setRotation(prev => 360 - prev)
            }}
          >
            <FlipIcon style={{ transform: 'rotate(90deg)' }} />
          </IconButton>
        </div>
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

export default Demo
