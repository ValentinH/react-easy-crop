import AppBar from '@material-ui/core/AppBar'
import Dialog from '@material-ui/core/Dialog'
import IconButton from '@material-ui/core/IconButton'
import Slide from '@material-ui/core/Slide'
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import CloseIcon from '@material-ui/icons/Close'
import React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    flex: {
      flex: 1,
    },
    img: {
      display: 'block',
      margin: 'auto',
      maxWidth: '100%',
      maxHeight: '100%',
    },
  })
)

type Props = {
  img: HTMLImageElement['src'] | null
  onClose: () => void
}

function Transition(props) {
  return <Slide direction="up" {...props} />
}

const ImgDialog = ({ img, onClose, ...rest }: Props) => {
  const classes = useStyles(rest)
  const theme = useTheme()
  const isAtLeastXs = useMediaQuery(theme.breakpoints.up('xs'))
  return (
    <Dialog
      fullScreen={!isAtLeastXs}
      open={!!img}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton color="inherit" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.flex}>
            Cropped image
          </Typography>
        </Toolbar>
      </AppBar>
      <img src={img} alt="Cropped" className={classes.img} />
    </Dialog>
  )
}

export default ImgDialog
