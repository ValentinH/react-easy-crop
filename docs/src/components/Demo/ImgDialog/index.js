import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import Slide from '@material-ui/core/Slide'
import withMobileDialog from '@material-ui/core/withMobileDialog'

const styles = theme => ({
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

function Transition(props) {
  return <Slide direction="up" {...props} />
}

const ImgDialog = ({ img, onClose, fullScreen, classes }) => (
  <Dialog fullScreen={fullScreen} open={!!img} onClose={onClose} TransitionComponent={Transition}>
    <AppBar className={classes.appBar}>
      <Toolbar>
        <IconButton color="inherit" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
        <Typography variant="title" color="inherit" className={classes.flex}>
          Cropped image
        </Typography>
      </Toolbar>
    </AppBar>
    <img src={img} alt="Cropped" className={classes.img} />
  </Dialog>
)

export default withMobileDialog({ breakpoint: 'xs' })(withStyles(styles)(ImgDialog))
