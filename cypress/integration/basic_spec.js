describe('Basic assertions', function() {
  beforeEach(function() {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Display the image and cropper with correct dimension', function() {
    cy.get('img').should('have.css', 'width', '1000px')
    cy.get('img').should('have.css', 'height', '524px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '699px') // 4/3 the height of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '524px') // height of the image
  })

  it('Display tall images and set the image and cropper with correct dimension', function() {
    cy.visit('/?img=/images/cat.jpg')
    cy.get('img').should('have.css', 'width', '338px')
    cy.get('img').should('have.css', 'height', '600px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '338px') // width of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '254px') // 3/4 of height of the image
  })

  it('Display the image and cropper with correct dimension after window resize', function() {
    cy.viewport(600, 1000)
    cy.get('img').should('have.css', 'width', '600px')
    cy.get('img').should('have.css', 'height', '314px')
    cy.get('[data-testid=cropper]').should('have.css', 'width', '419px') // 4/3 the height of the image
    cy.get('[data-testid=cropper]').should('have.css', 'height', '314px') // height of the image
  })
})
