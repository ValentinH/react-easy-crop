import * as React from 'react'

import './styles.css'
import { createPortal } from 'react-dom'

interface Props {
  children: React.ReactNode
}

export default function Iframe({ children }: Props) {
  const [iframeBody, setIframeBody] = React.useState<HTMLElement>()

  const iFrameRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    function setDocumentIfReady() {
      const { contentDocument } = iFrameRef.current as HTMLIFrameElement
      const { readyState, documentElement } = contentDocument as Document

      if (readyState !== 'interactive' && readyState !== 'complete') {
        return false
      }

      setIframeBody(documentElement.getElementsByTagName('body')[0])

      return true
    }

    // Document set with srcDoc is not immediately ready.
    if (iFrameRef.current) {
      iFrameRef.current.addEventListener('load', setDocumentIfReady)
    }
  }, [iFrameRef])

  return (
    <>
      <iframe
        style={{ height: '100vh', width: '100vw' }}
        ref={iFrameRef}
        srcDoc="<!doctype html>"
        title="test iframed"
        data-cy="iframe"
      >
        <>{iframeBody && createPortal(children, iframeBody)}</>
      </iframe>
    </>
  )
}
