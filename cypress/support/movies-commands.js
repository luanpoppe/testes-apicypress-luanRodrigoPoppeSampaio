Cypress.Commands.add("getAllMovies", () => {
    return cy.request({
        method: 'GET',
        url: '/api/movies',
    }).its("body")
})

Cypress.Commands.add("deleteMovie", (movieId, token) => {
    return cy.req("DELETE", "/api/movies/" + movieId, null, token)
})

Cypress.Commands.add("createMovie", (body, token) => {
    return cy.req("POST", "/api/movies/", body, token)
})