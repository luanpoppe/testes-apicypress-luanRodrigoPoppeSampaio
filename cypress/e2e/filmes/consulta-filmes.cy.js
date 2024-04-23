describe("Pessoa não logada pode acessar informações sobre filmes", () => {
  let movieInfosResponse
  let movieInfosFixture

  before(function () {
    cy.fixture("newMovie.json").then(function (resposta) {
      movieInfosFixture = resposta
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
  })

  after(function () {
    cy.criarFaker().then((userTemporario) => {
      cy.criarUsuario(userTemporario.name, userTemporario.email, userTemporario.password)
        .then((idRecebido) => {
          const idTemporario = idRecebido
          cy.logar(userTemporario.email, userTemporario.password).then((tokenRecebido) => {
            const tokenTemporario = tokenRecebido
            cy.tornarAdmin(tokenTemporario).then(() => {
              cy.deleteMovie(movieInfosResponse.id, tokenTemporario).then((resposta) => {
                cy.deletarUsuario(idTemporario, tokenTemporario)
              })
            })
          })
        })
    })
  })

  describe("Casos de sucesso", function () {
    it('Pessoa não logada pode acessar lista de todos os filmes', () => {
      cy.request("/api/movies").then((resposta) => {
        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.be.a("array")
        expect(resposta.body[0]).to.have.property("title")
        expect(resposta.body[0]).to.have.property("genre")
        expect(resposta.body[0]).to.have.property("releaseYear")
        expect(resposta.body[0]).to.have.property("durationInMinutes")
        expect(resposta.body[0]).to.have.property("description")
        expect(resposta.body[0]).to.have.property("id")
      })
    })

    it('Pessoa não logada pode acessar informações de um filme em específico', () => {
      cy.request("/api/movies/" + movieInfosResponse.id).then((resposta) => {
        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.deep.include(movieInfosResponse)
      })
    })

    it('Pessoa não logada pode pesquisar por filmes', () => {
      cy.request("/api/movies/search?title=cre").then((resposta) => {
        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.be.a("array")
      })
    })

    it('Filme que não existe retorna body vazio', () => {
      let ultimoFilme
      cy.getAllMovies().then((listaFilmes) => {
        ultimoFilme = listaFilmes[listaFilmes.length - 1]
      }).then(() => {
        cy.request("/api/movies/" + (ultimoFilme.id + 100))
          .then((resposta) => {
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.equal("")
          })
      })
    })

    it('Filme criado deve aparecer na pesquisa de filmes', function () {
      cy.request("/api/movies/search?title=" + movieInfosFixture.title).then((resposta) => {
        const filmeAdicionado = resposta.body.filter((filme) => {
          return filme.id == movieInfosResponse.id
        })
        expect(resposta.body.length > 0).to.equal(true)
        expect(filmeAdicionado).to.have.length(1)
        expect(filmeAdicionado[0]).to.deep.include(movieInfosFixture)
      })
    })
  })

  describe("Casos de falha", function () {
    it('Passar id como texto', () => {
      cy.req("GET", "/api/movies/" + "texto", null, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body).to.deep.include({
            message: "Validation failed (numeric string is expected)",
            error: "Bad Request"
          })
        })
    })

    it('deve dar erro ao não passar os quryParameters', () => {
      cy.req("GET", "/api/movies/search", null, null, false).then((resposta) => {
        expect(resposta.status).to.equal(500)
      })
    })
  })
})