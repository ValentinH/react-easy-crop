describe('Basic assertions', function () {
  beforeEach(function () {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Display the image and cropper with correct dimension', function () {
    cy.get('img').should('have.css', 'width', '1000px')
    cy.get('img').should('have.css', 'height', '523.546875px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '698.65625px') // 4/3 the height of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '524px') // height of the image
  })

  it('Display tall images and set the image and cropper with correct dimension', function () {
    cy.visit('/?img=/images/cat.jpeg')
    cy.get('img').should('have.css', 'width', '338.4375px')
    cy.get('img').should('have.css', 'height', '600px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '338px') // width of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '253.5px') // 3/4 of height of the image
  })

  it('Display the image and cropper with correct dimension after window resize', function () {
    cy.viewport(600, 1000)
    cy.get('img').should('have.css', 'width', '600px')
    cy.get('img').should('have.css', 'height', '314.125px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '418.65625px') // 4/3 the height of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '314px') // height of the image
  })

  it('should be able to set the crop position/zoom on load', function () {
    cy.visit('/?setInitialCrop=true')
    cy.get('img').should(
      'have.css',
      'transform',
      'matrix(1.90909, 0, 0, 1.90909, -269.371, 80.9614)'
    )
  })

  it('should be able to center through external buttons', function () {
    cy.get('[data-testid=container]').dragAndDrop({ x: -500, y: 0 })
    cy.get('#crop-area-x').contains('30')
    cy.get('#horizontal-center-button').click()
    cy.get('#crop-area-x').contains('15')
  })
})
