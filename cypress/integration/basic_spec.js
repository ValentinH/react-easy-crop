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

  it('should debounce onCropComplete during a burst of window resizes', function () {
    // let a real frame elapse so the ResizeObserver notification for this
    // resize has actually been delivered (mirrors cy.setViewportStable above)
    const settle = () =>
      cy.window().then(
        (win) =>
          new Cypress.Promise((resolve) => {
            win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve()))
          })
      )
    const countOnCropComplete = (spy) =>
      spy.getCalls().filter((call) => call.args[0] === 'onCropComplete!').length

    // let the initial mount settle first so its own onCropComplete call
    // doesn't get counted as part of the resize burst below
    settle()
    cy.window().then((win) => {
      cy.spy(win.console, 'log').as('consoleLog')
    })
    // freeze only the debounce timer itself (not rAF/Date), so ResizeObserver
    // notifications are still delivered for real via the settle() waits below,
    // but the resulting debounce timeout only fires when we call cy.tick
    cy.clock(Date.now(), ['setTimeout', 'clearTimeout'])

    // several resizes in a row, simulating dragging the window edge
    cy.viewport(700, 600)
    settle()
    cy.viewport(800, 650)
    settle()
    cy.viewport(900, 700)
    settle()

    // right after the burst, onCropComplete should still be debounced (not fired yet)
    cy.get('@consoleLog').should((spy) => {
      expect(countOnCropComplete(spy)).to.eq(0)
    })

    // once the debounce window elapses, it should have fired exactly once for the whole burst
    cy.tick(260)
    cy.get('@consoleLog').should((spy) => {
      expect(countOnCropComplete(spy)).to.eq(1)
    })
  })
})
