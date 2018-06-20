Cypress.Commands.add('dragAndDrop', { prevSubject: 'element' }, (subject, options) => {
  cy.wrap(subject)
    .trigger('mousedown', { clientX: 0, clientY: 0 })
    .trigger('mousemove', { clientX: options.x, clientY: options.y })
    .trigger('mouseup')
})
