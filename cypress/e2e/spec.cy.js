describe('template spec', () => {
    beforeEach(() => cy.visit('index.html'))

    it('passes', () => {
        // a single `type` command works fine
        cy.get('input').type('hello')
    })

    it('fails', () => {
        // more than one `type` command fails
        cy.get('input').type('hello')
        cy.get('input').clear()
    })

    it('fails', () => {
        // an odd number of `click`/`focus` commands before a `type` command fails
        cy.get('input').click().type('hello')

        // same result
        // cy.get('input').focus().type('hello')
        // cy.get('input').click().click().click().type('hello')
        // cy.get('input').focus().focus().focus().type('hello')
    })

    it('passes', () => {
        // however, an even number of `click`/`focus` commands before a `type` command passes
        cy.get('input').click().click().type('hello')

        // same result
        // cy.get('input').focus().focus().type('hello')
        // cy.get('input').click().focus().type('hello')
    })

    it('passes', () => {
        // based on previous tests, the first `type` works fine (even (0) clicks before), but it also has an click-like effect
        // hence, following `type` commands will work with an extra `click` command.
        cy.get('input').type('hello')
        cy.get('input').click().type(' world')
        cy.get('input').click().type('!')
    })

    it('focus/blur toggle weird', () => {
        /*
         * I started debugging cypress_runner.js code and found out what was causing the `type` command to fail.
         *
         * The function `getActiveElByDocument` at https://github.com/cypress-io/cypress/blob/develop/packages/driver/src/dom/elements/complexElements.ts#L222
         * returns the `activeElement` of the input's shadow root.
         *
         * And the `type` command requires `activeElement` to be defined at https://github.com/cypress-io/cypress/blob/develop/packages/driver/src/cy/commands/actions/type.ts#L545
         * (I think it probably checks that because of the internal `click` command just before it).
         *
         * The test bellow trigger `click`s multiple times and prints for the same prop as the `getActiveElByDocument` function returns.
         * Every command to `click` on the input toggles the `activeElement` property, between `null` and the input itself.
         */
        const logActives =
            message =>
            ([el]) =>
                console.log(message, {
                    doc: document,
                    root: el.getRootNode(),
                    docActive: document.activeElement,
                    rootActive: el.getRootNode().activeElement,
                })

        cy.get('input')
            .then(logActives('input before all'))
            .click()
            .then(logActives('input after click 1'))
            .click()
            .then(logActives('input after click 2'))
            .click()
            .then(logActives('input after click 3'))
            .click()
            .then(logActives('input after click 4'))

        /**
         * The behavior with an element outside the shadow root is different.
         * The `activeElement` prop is not set to null when multiple click commands are issued.
         *
         * (I tested with an input as well, textarea is just to simplify the demo)
         */
        cy.get('textarea')
            .then(logActives('textarea before all'))
            .click()
            .then(logActives('textarea after click 1'))
            .click()
            .then(logActives('textarea after click 2'))
            .click()
            .then(logActives('textarea after click 3'))
            .click()
            .then(logActives('textarea after click 4'))
    })
})
