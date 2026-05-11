import BrowserOnly from '@docusaurus/BrowserOnly'
import CodeBlock from '@theme/CodeBlock'
import clsx from 'clsx'
import type { ReactNode } from 'react'

type ExampleFrameProps = {
  children: ReactNode
  code: string
  description: string
}

export default function ExampleFrame({ children, code, description }: ExampleFrameProps) {
  return (
    <section className="example-content">
      <div className="example-heading">
        <p>{description}</p>
      </div>
      <BrowserOnly fallback={<div className="example-loading">Loading example...</div>}>
        {() => children}
      </BrowserOnly>
      <section className="example-code">
        <h2>Code</h2>
        <CodeBlock language="tsx">{code}</CodeBlock>
      </section>
    </section>
  )
}

type ControlGroupProps = {
  children: ReactNode
  compact?: boolean
}

export function ControlGroup({ children, compact = false }: ControlGroupProps) {
  return <div className={clsx('control-group', compact && 'control-group--compact')}>{children}</div>
}
