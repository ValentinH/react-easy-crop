describe('Controlled geometry synchronization', () => {
  beforeEach(() => {
    cy.visit('/synchronization.html')
    cy.get('[data-testid=cropper]').should('exist')
  })

  const expectMeasuredWidth = (width) => {
    cy.get('img').should(($image) => expect($image[0].offsetWidth).to.eq(width))
    cy.get('#media').should(($output) => expect(JSON.parse($output.text()).width).to.eq(width))
  }

  it('measures small images after switching object-fit classes in both directions', () => {
    expectMeasuredWidth(100)
    cy.contains('button', 'horizontal cover').click()
    expectMeasuredWidth(400)
    cy.contains('button', 'contain').click()
    expectMeasuredWidth(100)
  })

  it('remeasures when automatic cover changes direction during resize', () => {
    cy.contains('button', 'automatic cover').click()
    cy.get('img').should('have.class', 'reactEasyCrop_Cover_Vertical')
    expectMeasuredWidth(600)
    cy.contains('button', 'wide container').click()
    cy.get('img').should('have.class', 'reactEasyCrop_Cover_Horizontal')
    expectMeasuredWidth(800)
  })

  it('updates export coordinates when external zoom and rotation change', () => {
    cy.get('#completed')
      .invoke('text')
      .then((initial) => {
        cy.contains('button', 'zoom in').click()
        cy.get('#completed').should('not.have.text', initial)
      })
    cy.get('#area')
      .invoke('text')
      .then((area) => cy.get('#completed').should('have.text', area))
    cy.get('#completed')
      .invoke('text')
      .then((beforeRotation) => {
        cy.contains('button', 'rotate').click()
        cy.get('#completed').should('not.have.text', beforeRotation)
      })
    cy.get('#area')
      .invoke('text')
      .then((area) => cy.get('#completed').should('have.text', area))
  })

  it('recovers geometry after changing object-fit in a hidden container', () => {
    cy.contains('button', 'toggle visibility').click()
    cy.contains('button', 'horizontal cover').click()
    cy.contains('button', 'toggle visibility').click()
    expectMeasuredWidth(400)
    cy.get('[data-testid=cropper]').should('be.visible')
  })
})
