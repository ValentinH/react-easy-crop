describe('Touch assertions', function () {
  beforeEach(function () {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Move the image with touch', function () {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: 50, y: 0 })
    cy.percySnapshot()
  })

  it('Limit the left drag if too far', function () {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: -1000, y: 0 })
    cy.percySnapshot()
  })

  it('Limit the right drag if too far', function () {
    cy.get('[data-testid=container]').dragAndDropWithTouch({ x: 1000, y: 0 })
    cy.percySnapshot()
  })

  it('Zoom in and out with pinch', function () {
    cy.get('[data-testid=container]').pinch({ distance: 10 })
    cy.percySnapshot('Zoom in with pinch')
    cy.get('[data-testid=container]').pinch({ distance: -4 })
    cy.percySnapshot('Zoom out with pinch')
  })

  it('Zoom in and out with pinch based on the center between 2 fingers', function () {
    cy.get('[data-testid=container]')
      .trigger('touchstart', {
        touches: [
          { clientX: 500, clientY: 200 },
          { clientX: 500, clientY: 300 },
        ],
      })
      .trigger('touchmove', {
        touches: [
          { clientX: 500, clientY: 200 },
          { clientX: 500, clientY: 310 },
        ],
      })
      .trigger('touchend')
    cy.percySnapshot('Zoom in with pinch based on the center between 2 fingers')
    cy.get('[data-testid=container]')
      .trigger('touchstart', {
        touches: [
          { clientX: 100, clientY: 50 },
          { clientX: 200, clientY: 50 },
        ],
      })
      .trigger('touchmove', {
        touches: [
          { clientX: 100, clientY: 50 },
          { clientX: 190, clientY: 50 },
        ],
      })
      .trigger('touchend')
    cy.percySnapshot('Zoom out with pinch based on the center between 2 fingers')
  })

  it('Move image with pinch based on the center between 2 fingers', function () {
    cy.get('[data-testid=container]')
      .trigger('touchstart', {
        touches: [
          { clientX: 500, clientY: 200 },
          { clientX: 600, clientY: 300 },
        ],
      })
      .trigger('touchmove', {
        touches: [
          { clientX: 600, clientY: 200 },
          { clientX: 700, clientY: 300 },
        ],
      })
      .trigger('touchend')
    cy.percySnapshot()
  })

  it('Rotate with pinch', function () {
    cy.get('[data-testid=container]').rotate({ rotation: 30 })
    cy.percySnapshot('Rotate with pinch clockwise')
    cy.get('[data-testid=container]').rotate({ rotation: -45 })
    cy.percySnapshot('Rotate with pinch anti-clockwise')
  })
})
