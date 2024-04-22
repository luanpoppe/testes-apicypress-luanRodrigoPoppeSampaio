const { fakerPT_BR: faker } = require('@faker-js/faker');

Cypress.Commands.add("req", function (method, url, body = null, token = null, failOnStatusCode = true) {
  const objectRequest = {
    method: method,
    url: url,
    failOnStatusCode: failOnStatusCode
  }

  if (token) {
    objectRequest.auth = {
      bearer: token
    }
  }
  if (body) {
    objectRequest.body = body
  }

  return cy.request(objectRequest)
})

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

Cypress.Commands.add("deletarUsuario", (id, token) => {
  return cy.request({
    method: 'DELETE',
    url: '/api/users/' + id,
    auth: {
      bearer: token
    }
  })
})

Cypress.Commands.add("tornarAdminEDeletar", (id, token) => {

  return cy.request({
    method: 'PATCH',
    url: '/api/users/admin/',
    auth: {
      bearer: token
    }
  }).then(() => {
    return cy.request({
      method: 'DELETE',
      url: '/api/users/' + id,
      auth: {
        bearer: token
      }
    })
  })
})

Cypress.Commands.add("criarFaker", () => {
  return {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(9)
  }
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