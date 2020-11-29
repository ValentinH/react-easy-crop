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
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Roboto\:300,400,500`],
        display: 'swap',
      },
    },
    {
      resolve: `gatsby-plugin-material-ui`,
      options: {},
    },
  ],
}
