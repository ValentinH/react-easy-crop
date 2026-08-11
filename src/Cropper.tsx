import * as React from 'react'
import cssStyles from './styles.css?raw'
import { classNames } from './helpers'
import { useCropper, type CropperProps } from './useCropper'

export type { CropperProps }

const STYLE_RESOURCE_HREF = 'react-easy-crop/styles'

function Cropper(props: CropperProps) {
  const {
    image,
    video,
    transform,
    crop,
    zoom = 1,
    rotation = 0,
    cropShape = 'rect',
    showGrid = true,
    roundCropAreaPixels,
    style = {},
    classes = {},
    mediaProps = {},
    cropperProps = {},
    disableAutomaticStylesInjection,
    nonce,
  } = props
  const {
    cropSize,
    mediaObjectFit,
    setContainerElement,
    setImageElement,
    setVideoElement,
    setCropAreaElement,
    onMouseDown,
    onTouchStart,
    onMediaLoad,
    onKeyDown,
    onKeyUp,
  } = useCropper(props)
  const { containerStyle, cropAreaStyle, mediaStyle } = style
  const { containerClassName, cropAreaClassName, mediaClassName } = classes
  const mediaTransform =
    transform || `translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom})`

  return (
    <>
      {!disableAutomaticStylesInjection ? (
        nonce ? (
          <style key="nonce" nonce={nonce}>
            {cssStyles}
          </style>
        ) : (
          <style key="managed" href={STYLE_RESOURCE_HREF} precedence="medium">
            {cssStyles}
          </style>
        )
      ) : null}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        ref={setContainerElement}
        data-testid="container"
        style={containerStyle}
        className={classNames('reactEasyCrop_Container', containerClassName)}
      >
        {image ? (
          <img
            alt=""
            className={classNames(
              'reactEasyCrop_Image',
              mediaObjectFit === 'contain' && 'reactEasyCrop_Contain',
              mediaObjectFit === 'horizontal-cover' && 'reactEasyCrop_Cover_Horizontal',
              mediaObjectFit === 'vertical-cover' && 'reactEasyCrop_Cover_Vertical',
              mediaClassName
            )}
            {...(mediaProps as React.ImgHTMLAttributes<HTMLImageElement>)}
            src={image}
            ref={setImageElement}
            style={{ ...mediaStyle, transform: mediaTransform }}
            onLoad={onMediaLoad}
          />
        ) : video ? (
          <video
            autoPlay
            playsInline
            loop
            muted
            className={classNames(
              'reactEasyCrop_Video',
              mediaObjectFit === 'contain' && 'reactEasyCrop_Contain',
              mediaObjectFit === 'horizontal-cover' && 'reactEasyCrop_Cover_Horizontal',
              mediaObjectFit === 'vertical-cover' && 'reactEasyCrop_Cover_Vertical',
              mediaClassName
            )}
            {...(mediaProps as React.VideoHTMLAttributes<HTMLVideoElement>)}
            ref={setVideoElement}
            onLoadedMetadata={onMediaLoad}
            style={{ ...mediaStyle, transform: mediaTransform }}
            controls={false}
          >
            {(Array.isArray(video) ? video : [{ src: video }]).map((item) => (
              <source key={item.src} {...item} />
            ))}
          </video>
        ) : null}
        {cropSize ? (
          <div
            ref={setCropAreaElement}
            style={{
              ...cropAreaStyle,
              width: roundCropAreaPixels ? Math.round(cropSize.width) : cropSize.width,
              height: roundCropAreaPixels ? Math.round(cropSize.height) : cropSize.height,
            }}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            data-testid="cropper"
            className={classNames(
              'reactEasyCrop_CropArea',
              cropShape === 'round' && 'reactEasyCrop_CropAreaRound',
              showGrid && 'reactEasyCrop_CropAreaGrid',
              cropAreaClassName
            )}
            {...cropperProps}
          />
        ) : null}
      </div>
    </>
  )
}

export default Cropper
