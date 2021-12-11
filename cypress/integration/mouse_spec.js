describe('Mouse assertions', function () {
  beforeEach(function () {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Move the image with mouse', function () {
    cy.get('[data-testid=container]').dragAndDrop({ x: 50, y: 0 })
    cy.percySnapshot()
  })

  it('Limit the left drag if too far', function () {
    cy.get('[data-testid=container]').dragAndDrop({ x: -1000, y: 0 })
    cy.percySnapshot()
  })

  it('Limit the right drag if too far', function () {
    cy.get('[data-testid=container]').dragAndDrop({ x: 1000, y: 0 })
    cy.percySnapshot()
  })

  it('Mouse wheel should zoom in and out', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 500, clientY: 300 })
    cy.percySnapshot()
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: 50, clientX: 500, clientY: 300 })
    cy.percySnapshot()
  })

  it('Mouse wheel should zoom in and out following the pointer', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 0, clientY: 0 })
    cy.percySnapshot()
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: 50, clientX: 800, clientY: 400 })
    cy.percySnapshot()
  })

  it('Move down and right after zoom', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 500, clientY: 300 })
    cy.get('[data-testid=container]').dragAndDrop({ x: 50, y: 50 })
    cy.percySnapshot()
  })

  it('Move up and left after zoom', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 500, clientY: 300 })
    cy.get('[data-testid=container]').dragAndDrop({ x: -50, y: -50 })
    cy.percySnapshot()
  })

  it('Limit top after zoom ', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 500, clientY: 300 })
    cy.get('[data-testid=container]').dragAndDrop({ x: 0, y: -1000 })
    cy.percySnapshot()
  })

  it('Limit bottom after zoom ', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 500, clientY: 300 })
    cy.get('[data-testid=container]').dragAndDrop({ x: 0, y: 1000 })
    cy.percySnapshot()
  })

  it('Keep image under crop area after zoom out', function () {
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: -100, clientX: 500, clientY: 300 }) // zoom-in
    cy.get('[data-testid=container]').dragAndDrop({ x: 0, y: 1000 }) // move image to bottom
    cy.get('[data-testid=container]').trigger('wheel', { deltaY: 100, clientX: 500, clientY: 300 }) // zoom-out
    cy.percySnapshot()
  })
})
