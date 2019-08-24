Cypress.Commands.add('dragAndDrop', { prevSubject: 'element' }, (subject, options) => {
  cy.wrap(subject)
    .trigger('mousedown', { clientX: 0, clientY: 0 })
    .trigger('mousemove', { clientX: options.x, clientY: options.y })
    .trigger('mouseup')
})

Cypress.Commands.add('dragAndDropWithTouch', { prevSubject: 'element' }, (subject, options) => {
  cy.wrap(subject)
    .trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] })
    .trigger('touchmove', { touches: [{ clientX: options.x, clientY: options.y }] })
    .trigger('touchend')
})

Cypress.Commands.add('pinch', { prevSubject: 'element' }, (subject, options) => {
  const startTouches = [{ clientX: 0, clientY: 0 }, { clientX: 0, clientY: 10 }]
  const moveTouches = [{ clientX: 0, clientY: 0 }, { clientX: 0, clientY: 10 + options.distance }]
  cy.wrap(subject)
    .trigger('touchstart', { touches: startTouches })
    .trigger('touchmove', { touches: moveTouches })
    .trigger('touchend')
})

Cypress.Commands.add('rotate', { prevSubject: 'element' }, (subject, options) => {
  const rotationInRadians = (options.rotation * Math.PI) / 180

  const startTouches = [{ clientX: 0, clientY: 0 }, { clientX: 0, clientY: 10 }]
  const moveTouches = [
    { clientX: 0, clientY: 0 },
    { clientX: -10 * Math.sin(rotationInRadians), clientY: 10 * Math.cos(rotationInRadians) },
  ]
  cy.wrap(subject)
    .trigger('touchstart', { touches: startTouches })
    .trigger('touchmove', { touches: moveTouches })
    .trigger('touchend')
})
