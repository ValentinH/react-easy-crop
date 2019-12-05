import styled from '@emotion/styled'

export const Container = styled('div')(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'move',
  },
  ({ containerStyle }) => ({ ...containerStyle })
)

const mediaStyles = {
  maxWidth: '100%',
  maxHeight: '100%',
  margin: 'auto',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  willChange: 'transform', // this improves performances and prevent painting issues on iOS Chrome
}

export const Img = styled('img')(mediaStyles, ({ mediaStyle }) => ({ ...mediaStyle }))

export const Video = styled('video')(mediaStyles, ({ mediaStyle }) => ({ ...mediaStyle }))

const lineBorder = '1px solid rgba(255, 255, 255, 0.5)'
const cropperLines = {
  content: '" "',
  boxSizing: 'border-box',
  position: 'absolute',
  border: lineBorder,
}
const cropperArea = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  border: lineBorder,
  boxSizing: 'border-box',
  boxShadow: '0 0 0 9999em',
  color: 'rgba(0,0,0,0.5)',
  overflow: 'hidden',
}
const gridLines = {
  '&::before': {
    ...cropperLines,
    top: 0,
    bottom: 0,
    left: '33.33%',
    right: '33.33%',
    borderTop: 0,
    borderBottom: 0,
  },
  '&::after': {
    ...cropperLines,
    top: '33.33%',
    bottom: '33.33%',
    left: 0,
    right: 0,
    borderLeft: 0,
    borderRight: 0,
  },
}
const roundShape = {
  borderRadius: '50%',
}

export const CropArea = styled('div')({}, ({ cropShape, showGrid, cropAreaStyle }) => ({
  ...(() => {
    switch (cropShape) {
      case 'round':
        return { ...cropperArea, ...roundShape }
      case 'rect':
      default:
        return cropperArea
    }
  })(),
  ...(showGrid ? gridLines : {}),
  ...cropAreaStyle,
}))
