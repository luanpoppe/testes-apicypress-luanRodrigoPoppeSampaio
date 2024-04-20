describe("Atualização de filme", function () {
    let id
    let name
    let email
    let password
    let token
    let movieInfos
    before(function () {
        cy.fixture("newMovie.json").then(function (resposta) {
            movieInfos = resposta
        })
        cy.criarFaker().then((user) => {
            name = user.name
            email = user.email
            password = user.password
            cy.criarUsuario(name, email, password).then((idRecebido) => {
                id = idRecebido
                cy.logar(email, password).then((tokenRecebido) => {
                    token = tokenRecebido
                })
            })
        })
    })

    it('Usuário comum - Não pode realizar atualização de filme', function () {
        cy.getAllMovies().then((todosFilmes) => {
            const lastMovie = todosFilmes[todosFilmes.length - 1]

            cy.req("PUT", '/api/movies/' + lastMovie.id, lastMovie, token, false)
                .then((resposta) => {
                    expect(resposta.status).to.equal(403)
                    expect(resposta.body.message).to.equal("Forbidden")
                })
        })
    })

    it('Usuário admin - Pode realizar atualização de filme', function () {
        cy.getAllMovies().then((todosFilmes) => {
            const lastMovie = todosFilmes[todosFilmes.length - 1]
            cy.req("PATCH", '/api/users/admin', null, token)
                .then(() => {
                    cy.req("PUT", '/api/movies/' + lastMovie.id, lastMovie, token)
                        .then((resposta) => {
                            expect(resposta.status).to.equal(204)
                        })
                })
        })
    })
})