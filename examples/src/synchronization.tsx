import * as React from 'react'
import { createRoot } from 'react-dom/client'
import Cropper, { type Area, type CropperProps, type MediaSize } from '../../src'

const image =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect width="100" height="50" fill="red"/></svg>'
  )

// A real controlled parent for CSS-layout and export-callback regressions.
function SynchronizationFixture() {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [objectFit, setObjectFit] = React.useState<CropperProps['objectFit']>('contain')
  const [width, setWidth] = React.useState(400)
  const [hidden, setHidden] = React.useState(false)
  const [media, setMedia] = React.useState<MediaSize | null>(null)
  const [area, setArea] = React.useState<Area | null>(null)
  const [completed, setCompleted] = React.useState<Area | null>(null)
  return (
    <>
      <button onClick={() => setObjectFit('contain')}>contain</button>
      <button onClick={() => setObjectFit('horizontal-cover')}>horizontal cover</button>
      <button onClick={() => setObjectFit('cover')}>automatic cover</button>
      <button onClick={() => setWidth(800)}>wide container</button>
      <button onClick={() => setHidden(!hidden)}>toggle visibility</button>
      <button onClick={() => setZoom(2)}>zoom in</button>
      <button onClick={() => setRotation(90)}>rotate</button>
      <div style={{ position: 'relative', width, height: 300, display: hidden ? 'none' : 'block' }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          objectFit={objectFit}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onMediaSizeChange={setMedia}
          onCropAreaChange={(_, pixels) => setArea(pixels)}
          onCropComplete={(_, pixels) => setCompleted(pixels)}
        />
      </div>
      <output id="media">{JSON.stringify(media)}</output>
      <output id="area">{JSON.stringify(area)}</output>
      <output id="completed">{JSON.stringify(completed)}</output>
    </>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing fixture root')
createRoot(root).render(
  <React.StrictMode>
    <SynchronizationFixture />
  </React.StrictMode>
)
