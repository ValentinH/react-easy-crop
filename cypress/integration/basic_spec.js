describe('Basic assertions', function () {
  const assertCssNumberCloseTo = (selector, property, expected) => {
    cy.get(selector).should(($el) => {
      expect(parseFloat($el.css(property))).to.be.closeTo(expected, 0.01)
    })
  }

  beforeEach(function () {
    cy.viewport(1000, 600)
    cy.visit('/')
  })

  it('Display the image and cropper with correct dimension', function () {
    cy.get('img').should('have.css', 'width', '1000px')
    assertCssNumberCloseTo('img', 'height', 523.546875)
    cy.percySnapshot()
  })

  it('keeps wide images correctly sized with global CSS reset rules', function () {
    cy.document().then((doc) => {
      const style = doc.createElement('style')
      style.textContent = 'img, video { max-width: 100%; }'
      doc.head.appendChild(style)
    })

    cy.get('img').should('have.css', 'width', '1000px')
    assertCssNumberCloseTo('img', 'height', 523.546875)
  })

  it('Display tall images and set the image and cropper with correct dimension', function () {
    cy.visit('/?img=/images/cat.jpeg')
    cy.get('img').should('have.css', 'width', '338.4375px')
    cy.get('img').should('have.css', 'height', '600px')
    cy.percySnapshot()
  })

  it('Display the image and cropper with correct dimension after window resize', function () {
    cy.viewport(600, 1000)
    cy.get('img').should('have.css', 'width', '600px')
    assertCssNumberCloseTo('img', 'height', 314.125)
    cy.percySnapshot()
  })

  it('should be able to set the crop position/zoom on load', function () {
    cy.visit('/?setInitialCrop=true')
    cy.percySnapshot()
  })

  it('should be able to center through external buttons', function () {
    cy.get('[data-testid=container]').dragAndDrop({ x: -500, y: 0 })
    cy.get('#crop-area-x').contains('30')
    cy.get('#horizontal-center-button').click()
    cy.get('#crop-area-x').contains('15')
  })

  it('should preserve crop position after window resize', function () {
    cy.get('[data-testid=container]').dragAndDrop({ x: 1000, y: 0 })
    cy.get('#crop-area-x').then(($el) => {
      const initialX = $el.text()
      cy.setViewportStable(500, 500)
      cy.setViewportStable(1000, 1000)
      cy.get('#crop-area-x').should('contain', initialX)
    })
    cy.percySnapshot()
  })

  it('should keep crop area centered when switching orientation', function () {
    cy.get('#crop-area-x').should('contain', '15')
    cy.get('#picture-select').select('Portrait')
    cy.get('#crop-area-y').should('contain', '25')
    cy.percySnapshot()
  })

  it('reports keyboard interaction source', function () {
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog')
    })
    cy.get('[data-testid=cropper]')
      .focus()
      .trigger('keydown', { key: 'ArrowRight' })
      .trigger('keyup', { key: 'ArrowRight' })

    cy.get('@consoleLog').should((spy) => {
      expect(spy).to.be.calledWith('user interaction started', { source: 'keyboard' })
      expect(spy).to.be.calledWith('user interaction ended', { source: 'keyboard' })
    })
  })

  it('should debounce onCropComplete during a burst of window resizes', function () {
    const countOnCropComplete = (spy) =>
      spy.getCalls().filter((call) => call.args[0] === 'onCropComplete!').length

    cy.get('#crop-area-x').should('contain', '15')

    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog')
    })
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout'])

    let callCountBeforeResize = 0
    cy.get('@consoleLog').then((spy) => {
      callCountBeforeResize = countOnCropComplete(spy)
    })

    cy.setViewportStable(700, 600)
    cy.setViewportStable(800, 650)
    cy.setViewportStable(900, 700)

    cy.get('@consoleLog').should((spy) => {
      expect(countOnCropComplete(spy)).to.eq(callCountBeforeResize)
    })

    cy.tick(260)
    cy.get('@consoleLog').should((spy) => {
      expect(countOnCropComplete(spy)).to.eq(callCountBeforeResize + 1)
    })
  })
})
