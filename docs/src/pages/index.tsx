import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import CropperExample from '../components/CropperExample'

const examples = [
  {
    title: 'Basic cropper',
    description: 'The smallest useful setup with crop and zoom state.',
    to: '/docs/examples/basic',
  },
  {
    title: 'Cropped output',
    description: 'Use the pixel crop returned by onCropComplete.',
    to: '/docs/examples/output',
  },
  {
    title: 'Upload',
    description: 'Crop an image selected by the user.',
    to: '/docs/examples/upload',
  },
]

export default function Home() {
  return (
    <Layout
      title="react-easy-crop"
      description="A React component to crop images and videos with easy interactions"
    >
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">react-easy-crop</h1>
          <p className="hero__subtitle">
            A React cropper for images and videos with drag, zoom, rotation, touch, keyboard, and
            precise crop output.
          </p>
          <div>
            <Link className="button button--secondary button--lg" to="/docs/getting-started">
              Read the docs
            </Link>
          </div>
        </div>
      </header>
      <main className="container">
        <section className="home-demo">
          <CropperExample />
        </section>
        <section className="home-grid">
          {examples.map((example) => (
            <Link className="home-card" key={example.to} to={example.to}>
              <h2>{example.title}</h2>
              <p>{example.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </Layout>
  )
}
