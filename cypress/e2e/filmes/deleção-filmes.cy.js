describe("Deleção de filme", function () {
  let id
  let name
  let email
  let password
  let token
  let movieInfosFixture
  let movieInfosResponse

  before(function () {
    cy.log("Criar novo filme")
    cy.fixture("newMovie.json").then((resposta) => {
      movieInfosFixture = resposta
    })
      .then(() => {
        cy.criarFaker().then((userTemporario) => {
          cy.criarUsuario(userTemporario.name, userTemporario.email, userTemporario.password)
            .then((idRecebido) => {
              const idTemporario = idRecebido
              cy.logar(userTemporario.email, userTemporario.password).then((tokenRecebido) => {
                const tokenTemporario = tokenRecebido
                cy.tornarAdmin(tokenTemporario).then(() => {
                  cy.createMovie(movieInfosFixture, tokenTemporario).then((resposta) => {
                    movieInfosResponse = resposta.body
                    cy.deletarUsuario(idTemporario, tokenTemporario)
                  })
                })
              })
            })
        })
      })

    cy.log("Criar usuário para os testes")
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

  after(function () {
    cy.deletarUsuario(id, token)
  })

  it('Usuário não logado - Não pode realizar deleção de filme', function () {
    cy.req("DELETE", '/api/movies/' + movieInfosResponse.id, null, null, false)
      .then((resposta) => {
        expect(resposta.status).to.equal(401)
        expect(resposta.body.message).to.equal("Access denied.")
        expect(resposta.body.error).to.equal("Unauthorized")
      })
  })

  it('Usuário comum - Não pode realizar deleção de filme', function () {
    cy.req("DELETE", '/api/movies/' + movieInfosResponse.id, null, token, false)
      .then((resposta) => {
        expect(resposta.status).to.equal(403)
        expect(resposta.body.message).to.equal("Forbidden")
      })
  })

  it('Usuário crítico - Não pode realizar deleção de filme', function () {
    cy.req("PATCH", "/api/users/apply", null, token).then((resposta) => {
      cy.req("DELETE", '/api/movies/' + movieInfosResponse.id, null, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(403)
          expect(resposta.body.message).to.equal("Forbidden")
        })
    })
  })

  describe("Cenários com usuário do tipo admin", function () {
    before(function () {
      cy.tornarAdmin(token)
    })

    it('Falha ao passar um id como número decimal', function () {
      cy.req("DELETE", '/api/movies/' + -10.5, null, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
        })
    })

    it('Falha ao passar uma id do filme como string', function () {
      cy.req("DELETE", '/api/movies/' + "texto", null, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
        })
    })

    it('Falha ao não passar id do filme', function () {
      cy.req("DELETE", '/api/movies/', null, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
          expect(resposta.body.message).to.equal("Cannot DELETE /api/movies/")
        })
    })

    it('Pode realizar deleção de filme', function () {
      cy.req("DELETE", '/api/movies/' + movieInfosResponse.id, null, token)
        .then((resposta) => {
          expect(resposta.status).to.equal(204)
        })
    })


    it('Checar informações do filme deletado não aparecen mais:', function () {
      cy.req("GET", "/api/movies/" + movieInfosResponse.id, null, null).then((resposta) => {
        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.equal("")

        cy.getAllMovies().then((listaFilmes) => {
          const nenhumFilme = listaFilmes.filter((filme) => {
            return filme.id == movieInfosResponse.id
          })
          expect(nenhumFilme.length).to.equal(0)
        })
      })
    })
  })

})