import * as React from 'react'

import './styles.css'
import { createPortal } from 'react-dom'

interface Props {
  children: React.ReactNode
}

export default function Iframe({ children }: Props) {
  const [iframeBody, setIframeBody] = React.useState<HTMLElement>()
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    const element = iframeRef.current
    if (!element) return

    function setDocumentIfReady() {
      const { contentDocument } = element
      if (!contentDocument) return false

      const { readyState, documentElement } = contentDocument

      if (readyState !== 'interactive' && readyState !== 'complete') {
        return false
      }

      setIframeBody(documentElement.getElementsByTagName('body')[0])

      return true
    }

    element.addEventListener('load', setDocumentIfReady)

    return () => element.removeEventListener('load', setDocumentIfReady)
  }, [])

  return (
    <>
      <iframe
        style={{ height: '100vh', width: '100vw' }}
        ref={iframeRef}
        srcDoc="<!doctype html>"
        title="test iframed"
        data-cy="iframe"
      >
        <>{iframeBody && createPortal(children, iframeBody)}</>
      </iframe>
    </>
  )
}
