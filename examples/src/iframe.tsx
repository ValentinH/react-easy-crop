// @ts-nocheck
import * as React from 'react'

import './styles.css'
import { createPortal } from 'react-dom'

export default function Iframe({ children, ...props }) {
  const [iframeBody, setIframeBody] = React.useState<HTMLElement>()

  const iFrameRef = React.useRef<HTMLIFrameElement>()

  React.useEffect(() => {
    function setDocumentIfReady() {
      const { contentDocument } = iFrameRef.current
      const { readyState, documentElement } = contentDocument

      if (readyState !== 'interactive' && readyState !== 'complete') {
        return false
      }

      setIframeBody(documentElement.getElementsByTagName('body')[0])

      return true
    }

    // Document set with srcDoc is not immediately ready.
    iFrameRef.current.addEventListener('load', setDocumentIfReady)
  }, [iFrameRef])

  return (
    <>
      <iframe
        style={{ height: '100vh', width: '100vw' }}
        {...props}
        ref={iFrameRef}
        srcDoc="<!doctype html>"
        title="test iframed"
      >
        {iframeBody && createPortal(children, iframeBody)}
      </iframe>
    </>
  )
}
