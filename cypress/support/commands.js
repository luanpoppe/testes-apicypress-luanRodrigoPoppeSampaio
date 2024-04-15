Cypress.Commands.add("criarUsuario", (name, email, password) => {
    const userCreated = {
        name: name,
        email: email,
        password: password
    }

    return cy.request("POST", '/api/users', userCreated).its("body.id")
})

Cypress.Commands.add("logar", (email, password) => {
    const userCreated = {
        email: email,
        password: password
    }

    return cy.request("POST", '/api/auth/login', userCreated).its("body.accessToken")
})

Cypress.Commands.add("tornarAdminEDeletar", (id, token) => {

    return cy.request({
        method: 'PATCH',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin/',
        headers: {
            Authorization: "Bearer " + token
        }
    }).then(() => {
        return cy.request({
            method: 'DELETE',
            url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
            headers: {
                Authorization: "Bearer " + token
            }
        })
    })
})

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })