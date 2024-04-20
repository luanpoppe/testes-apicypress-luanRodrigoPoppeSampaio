describe("Deleção de filme", function () {
    let id
    let name
    let email
    let password
    let token
    let movieInfos

    before(function () {
        cy.fixture("newMovie.json").then((resposta) => {
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

    it('Usuário comum - Não pode realizar deleção de filme', function () {
        cy.getAllMovies().then((todosFilmes) => {
            const lastMovie = todosFilmes[todosFilmes.length - 1]

            cy.req("DELETE", '/api/movies/' + lastMovie.id, null, token, false)
                .then((resposta) => {
                    expect(resposta.status).to.equal(403)
                    expect(resposta.body.message).to.equal("Forbidden")
                })
        })
    })

    it('Usuário admin - Pode realizar deleção de filme', function () {
        cy.getAllMovies().then((todosFilmes) => {
            const lastMovie = todosFilmes[todosFilmes.length - 1]
            cy.req("PATCH", '/api/users/admin', null, token)
                .then(() => {
                    cy.req("DELETE", '/api/movies/' + lastMovie.id, null, token)
                        .then((resposta) => {
                            expect(resposta.status).to.equal(204)
                        })
                })
        })
    })
})