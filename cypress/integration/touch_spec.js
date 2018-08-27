describe('Touch assertions', function() {
  beforeEach(function() {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Move the image with touch', function() {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: 50, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 50, 0)')
  })

  it('Limit the left drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: -1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, -150.667, 0)')
  })

  it('Limit the right drag if too far', function() {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: 1000, y: 0 })
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 150.667, 0)')
  })

  it('Zoom in and out with pinch', function() {
    cy.get('[data-testid=container]').pinch({ distance: 10 })
    cy.get('img').should('have.css', 'transform', 'matrix(2, 0, 0, 2, 500, 262)')
    cy.get('[data-testid=container]').pinch({ distance: -4 })
    cy.get('img').should('have.css', 'transform', 'matrix(1.2, 0, 0, 1.2, 100, 37.2)')
  })

  it('Zoom in and out with pinch based on the center between 2 fingers', function() {
    cy.get('[data-testid=container]')
      .trigger('touchstart', {
        touches: [{ clientX: 500, clientY: 200 }, { clientX: 600, clientY: 300 }],
      })
      .trigger('touchmove', {
        touches: [{ clientX: 500, clientY: 200 }, { clientX: 600, clientY: 310 }],
      })
      .trigger('touchend')
    cy.get('img').should(
      'have.css',
      'transform',
      'matrix(1.05119, 0, 0, 1.05119, -2.55949, 2.30354)'
    )
    cy.get('[data-testid=container]')
      .trigger('touchstart', {
        touches: [{ clientX: 100, clientY: 50 }, { clientX: 200, clientY: 100 }],
      })
      .trigger('touchmove', {
        touches: [{ clientX: 100, clientY: 50 }, { clientX: 190, clientY: 80 }],
      })
      .trigger('touchend')
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, -24.4788, 0)')
  })

  it('Move image with pinch based on the center between 2 fingers', function() {
    cy.get('[data-testid=container]')
      .trigger('touchstart', {
        touches: [{ clientX: 500, clientY: 200 }, { clientX: 600, clientY: 300 }],
      })
      .trigger('touchmove', {
        touches: [{ clientX: 600, clientY: 200 }, { clientX: 700, clientY: 300 }],
      })
      .trigger('touchend')
    cy.get('img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 100, 0)')
  })
})
