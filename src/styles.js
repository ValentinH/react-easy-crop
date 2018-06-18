import styled from 'react-emotion'

export const Container = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  background: '#222',
  userSelect: 'none',
  touchAction: 'none',
  cursor: 'move',
})

export const Img = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  margin: 'auto',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
})

const lineBorder = '1px solid rgba(255, 255, 255, 0.5)'
const cropperLines = {
  content: '" "',
  boxSizing: 'border-box',
  position: 'absolute',
  border: lineBorder,
}

export const CropArea = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  border: lineBorder,
  boxSizing: 'border-box',
  boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.5)',
  '&::before': {
    ...cropperLines,
    top: -1,
    bottom: -1,
    left: '33.33%',
    right: '33.33%',
  },
  '&::after': {
    ...cropperLines,
    top: '33.33%',
    bottom: '33.33%',
    left: -1,
    right: -1,
  },
})
