describe('Validação de consultas de usuários comuns', () => {
  let id
  let token
  let email
  let name
  let password
  let movieInfosResponse
  let movieInfosFixture

  before(() => {
    cy.log("Criar o filme:")
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

    cy.log("Criar usuário comum:")
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

  after(() => {
    cy.log("Tornar o usuário admin e deletar o usuário")
    cy.tornarAdmin(token).then(() => {
      cy.deleteMovie(movieInfosResponse.id, token).then(() => {
        cy.deletarUsuario(id, token)
      })
    })
  })

  describe("Usuário comum - Criando review válida", function () {
    it('Usuário do tipo comum pode criar uma review sobre um filme', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: 5,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token)
        .then((resposta) => {
          expect(resposta.status).to.equal(201)
        })
    })

    it('Checar que a review criada existe', () => {
      cy.getMovieById(movieInfosResponse.id).then((filme) => {
        const userReviews = filme.reviews

        expect(userReviews).to.have.length(1)
        expect(userReviews[0].reviewText).to.equal("Texto da review do filme")
        expect(userReviews[0].score).to.equal(5)
      })
    })

    it('Checar que ao escrever nova review, irá atualiza o valor da review antiga', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: 1,
        reviewText: "Texto da NOVA review do filme"
      }

      cy.req("POST", '/api/users/review', body, token).then(() => {
        cy.getMovieById(movieInfosResponse.id).then((filme) => {
          const userReviews = filme.reviews

          expect(userReviews).to.have.length(1)
          expect(userReviews[0].reviewText).to.equal("Texto da NOVA review do filme")
          expect(userReviews[0].score).to.equal(1)
        })
      })
    })

    it('Criar a review com o score sendo um número decimal', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: 3.5,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(201)
        })
    })

  })

  describe("Usuário comum - Criando review inválida", function () {
    it('Passar um body null', () => {
      const body = null
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "movieId must be an integer number",
            "movieId should not be empty",
            "score must be a number conforming to the specified constraints",
            "score should not be empty",
            "reviewText must be a string"
          ])
        })
    })

    it('Passar o id do filme como null', () => {
      const body = {
        movieId: null,
        score: 5,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "movieId must be an integer number",
            "movieId should not be empty"
          ])
        })
    })

    it('Passar o id do filme como string', () => {
      const body = {
        movieId: "texto",
        score: 5,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "movieId must be an integer number"
          ])
        })
    })

    it('Passar o id do filme como número decimal', () => {
      const body = {
        movieId: (movieInfosResponse.id + 0.5),
        score: 5,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "movieId must be an integer number"
          ])
        })
    })

    it('Passar o score como null', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: null,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "score must be a number conforming to the specified constraints",
            "score should not be empty"
          ])
        })
    })

    it('Passar o score como string', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: "texto",
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "score must be a number conforming to the specified constraints"
          ])
        })
    })

    it('Passar o score como número maior que 5', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: 6,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal("Score should be between 1 and 5")
        })
    })

    it('Passar o score como número negativo', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: -1,
        reviewText: "Texto da review do filme"
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal("Score should be between 1 and 5")
        })
    })

    it('Passar o texto da review como null', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: 5,
        reviewText: null
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "reviewText must be a string"
          ])
        })
    })

    it('Passar o texto da review como number', () => {
      const body = {
        movieId: movieInfosResponse.id,
        score: 5,
        reviewText: 123456
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.error).to.equal("Bad Request")
          expect(resposta.body.message).to.deep.equal([
            "reviewText must be a string"
          ])
        })
    })

    it('Passar o texto da review muito grande', () => {
      let textoGrande = "a"
      for (let i = 0; i < 1000001; i++) {
        textoGrande += "a"
      }
      const body = {
        movieId: movieInfosResponse.id,
        score: 5,
        reviewText: textoGrande
      }
      cy.req("POST", '/api/users/review', body, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(413)
          expect(resposta.body.message).to.deep.equal("request entity too large")
        })
    })
  })

  describe.only("Checar as reviews de um usuário", function () {
    const segundoFilme = { fixture: "", response: "" }
    before(function () {
      cy.log("Criando um segundo filme")
      cy.fixture("updateMovie.json").then(function (resposta) {
        segundoFilme.fixture = resposta
        cy.criarFaker().then((userTemporario) => {
          cy.criarUsuario(userTemporario.name, userTemporario.email, userTemporario.password)
            .then((idRecebido) => {
              const idTemporario = idRecebido
              cy.logar(userTemporario.email, userTemporario.password).then((tokenRecebido) => {
                const tokenTemporario = tokenRecebido
                cy.tornarAdmin(tokenTemporario).then(() => {
                  cy.createMovie(movieInfosFixture, tokenTemporario).then((resposta) => {
                    segundoFilme.response = resposta.body
                    cy.deletarUsuario(idTemporario, tokenTemporario)
                  })
                })
              })
            })
        })
      })

    })

    after(function () {
      cy.tornarAdmin(token).then(() => {
        cy.deleteMovie(segundoFilme.response.id, token)
      })
    })

    it('Mostrar as reviews do usuário de todos os filmes', function () {
      cy.createReview(movieInfosResponse.id, token, "Review 1").then(() => {
        cy.createReview((segundoFilme.response.id), token, "Review 2").then(() => {
          cy.req("GET", "/api/users/review/all", null, token).then((resposta) => {
            expect(resposta.status).to.equal(200)
            expect(resposta.body).to.have.length(2)
            resposta.body.forEach((review) => {
              if (review.reviewText == "Review 1") {
                expect(review.movieId).to.equal(movieInfosResponse.id)
              } else if (review.reviewText == "Review 2") {
                expect(review.movieId).to.equal(segundoFilme.response.id)
              }
              expect(review.id).to.be.a("number")
              expect(review.reviewType).to.be.a("number")
              expect(review.movieTitle).to.equal("Filme Teste Luan")
              expect(review.score).to.equal(5)
            })
          })
        })
      })
    })
  })
})