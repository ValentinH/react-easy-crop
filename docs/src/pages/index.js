import React from 'react'
import Typography from '@material-ui/core/Typography'
import CodeSandboxes from '../components/CodeSandboxes'
import Demo from '../components/Demo'
import Layout from '../components/Layout'
import SEO from '../components/Seo'

const IndexPage = () => (
  <Layout>
    <SEO
      title="react-easy-crop"
      keywords={[`react-easy-crop`, `image cropper`, `crop image`, `react`]}
    />
    <Typography variant="subtitle1">
      A React component to crop images with easy interactions
    </Typography>
    <Typography variant="h4">Demo</Typography>
    <Demo />

    <Typography variant="h4">Features</Typography>
    <ul>
      <li>Supports drag and zoom interactions</li>
      <li>Provides crop dimensions as pixels and percentages</li>
      <li>Supports any images format (JPEG, PNG, even GIF) as url or base 64 string</li>
      <li>Mobile friendly</li>
    </ul>
    <Typography variant="h4" gutterBottom>
      Codesandboxes
    </Typography>
    <CodeSandboxes />
  </Layout>
)

export default IndexPage
