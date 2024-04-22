Cypress.Commands.add("getAllMovies", () => {
    return cy.request({
        method: 'GET',
        url: '/api/movies',
    }).its("body")
})

Cypress.Commands.add("deleteMovie", (movieId, token) => {
    return cy.req("DELETE", "/api/movies/" + movieId, null, token)
})