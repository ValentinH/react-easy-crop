module.exports = {
  pathPrefix: 'react-easy-crop',
  siteMetadata: {
    title: `react-easy-crop`,
    description: `A React component to crop images with easy interactions`,
    author: `@ricardo-ch`,
  },
  plugins: [
    `gatsby-plugin-typescript`,
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `Roboto`,
            variants: [`300`, `400`, `500`],
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-material-ui`,
      options: {},
    },
  ],
}
