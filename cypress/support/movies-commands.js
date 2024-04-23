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

Cypress.Commands.add("getMovieById", function (movieId) {
    return cy.req("GET", "/api/movies/" + movieId, null, null).its("body")
})

Cypress.Commands.add("createReview", function (movieId, token, textoReview) {
    const body = {
        movieId: movieId,
        score: 5,
        reviewText: textoReview
    }

    return cy.req("POST", '/api/users/review', body, token)
})