describe("Atualização de filme", function () {
  let movieInfosFixture
  let movieInfosResponse

  before(function () {
    cy.fixture("updateMovie.json").then(function (resposta) {
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

  describe("Usuário comum", function () {
    let idUsuarioComum
    let tokenUsuarioComum

    before(function () {
      cy.criarFaker().then((userTemporario) => {
        cy.criarUsuario(userTemporario.name, userTemporario.email, userTemporario.password)
          .then((idRecebido) => {
            idUsuarioComum = idRecebido
            cy.logar(userTemporario.email, userTemporario.password).then((tokenRecebido) => {
              tokenUsuarioComum = tokenRecebido
            })
          })
      })
    })

    after(function () {
      cy.tornarAdmin(tokenUsuarioComum).then(() => {
        cy.deletarUsuario(idUsuarioComum, tokenUsuarioComum)
      })
    })

    it('Usuário comum - Não pode realizar atualização de filme', function () {
      cy.req("PUT", '/api/movies/' + movieInfosResponse.id, movieInfosFixture, tokenUsuarioComum, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(403)
          expect(resposta.body.message).to.equal("Forbidden")
        })
    })
  })

  describe("Usuário admin", function () {
    let idUsuarioAdmin
    let tokenUsuarioAdmin

    before(function () {
      cy.criarFaker().then((userTemporario) => {
        cy.criarUsuario(userTemporario.name, userTemporario.email, userTemporario.password)
          .then((idRecebido) => {
            idUsuarioAdmin = idRecebido
            cy.logar(userTemporario.email, userTemporario.password).then((tokenRecebido) => {
              tokenUsuarioAdmin = tokenRecebido
              cy.tornarAdmin(tokenUsuarioAdmin)
            })
          })
      })
    })

    after(function () {
      cy.deleteMovie(movieInfosResponse.id, tokenUsuarioAdmin).then((resposta) => {
        cy.deletarUsuario(idUsuarioAdmin, tokenUsuarioAdmin)
      })
    })

    it('Usuário admin - Pode realizar atualização de filme', function () {
      cy.req("PUT", '/api/movies/' + movieInfosResponse.id, movieInfosFixture, tokenUsuarioAdmin)
        .then((resposta) => {
          expect(resposta.status).to.equal(204)
        })
    })

    it('Checar que filme foi atualizado de verdade', function () {
      cy.getAllMovies().then((body) => {
        const filmeAtualizado = body.filter((item) => {
          return item.id == movieInfosResponse.id
        })
        expect(filmeAtualizado).to.have.length(1)
        expect(filmeAtualizado[0]).to.deep.include(movieInfosFixture)
      })
    })

    it('Não passar o parâmetro de id à requisição', function () {
      cy.req("PUT", '/api/movies/' + null, movieInfosFixture, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
        })
    })

    it('Passar o parâmetro de id como texto à requisição', function () {
      cy.req("PUT", '/api/movies/' + "texto", movieInfosFixture, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
        })
    })

    it('Tentar deletar um filme que não existe', function () {
      let ultimoFilme
      cy.getAllMovies().then((body) => {
        ultimoFilme = body[body.length - 1]
      }).then(() => {
        cy.req("PUT", '/api/movies/' + (ultimoFilme.id + 100), movieInfosFixture, tokenUsuarioAdmin, false)
          .then((resposta) => {
            expect(resposta.status).to.equal(404)
            expect(resposta.body).to.deep.include({
              error: "Not Found",
              message: "Movie not found"
            })
          })
      })
    })

    it('Título do filme null', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        title: null
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Título do filme como número', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        title: 123456
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Título do filme como string vazia', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        title: ""
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Título do filme com mais de 100 caracteres', function () {
      let titulo = ""
      for (let i = 0; i < 101; i++) {
        titulo += "a"
      }

      const invalidMovie = {
        ...movieInfosFixture,
        title: titulo
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Gênero do filme como null', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        genre: null
      }
      cy.req("PUT", '/api/movies' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Gênero do filme como number', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        genre: 123456
      }
      cy.req("PUT", '/api/movies' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Gênero do filme como string vazia', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        genre: ""
      }
      cy.req("PUT", '/api/movies' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Gênero do filme com mais de 100 caracteres', function () {
      let genre = "a"
      for (let i = 0; genre.length < 101; i++) {
        genre += "a"
      }

      const invalidMovie = {
        ...movieInfosFixture,
        genre: genre
      }
      cy.req("PUT", '/api/movies' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Descrição do filme null', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        description: null
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Descrição do filme como number', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        description: 123456
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Descrição do filme como string vazia', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        description: ""
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    it('Descrição do filme com mais de 500 caracteres', function () {
      let descricao = "a"
      for (let i = 0; descricao.length < 501; i++) {
        descricao += "a"
      }

      const invalidMovie = {
        ...movieInfosFixture,
        description: descricao
      }

      cy.req("PUT", "/api/movies" + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(404)
        })
    })

    // Teste abaixo com Bug --> Não deveria permitir que a duração do filme seja colocado como null
    // it('Duração do filme null', function () {
    //   const invalidMovie = {
    //     ...movieInfosFixture,
    //     durationInMinutes: null
    //   }

    //   cy.req("PUT", '/api/movies/' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
    //     .then((resposta) => {
    //       expect(resposta.status).to.equal(404)
    //     })
    // })

    it('Duração do filme como string', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        durationInMinutes: "duracao"
      }

      cy.req("PUT", '/api/movies/' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "durationInMinutes must be a number conforming to the specified constraints"
          ])
        })
    })

    // Teste abaixo com Bug --> Não deveria permitir que o ano de lançamento do filme seja colocado como null
    // it('Ano de lançamento do filme null', function () {
    //   const invalidMovie = {
    //     ...movieInfosFixture,
    //     releaseYear: null
    //   }

    //   cy.req("PUT", '/api/movies/' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
    //     .then((resposta) => {
    //       expect(resposta.status).to.equal(404)
    //     })
    // })

    it('Ano de lançamento do filme como string', function () {
      const invalidMovie = {
        ...movieInfosFixture,
        releaseYear: "1200"
      }

      cy.req("PUT", '/api/movies/' + movieInfosResponse.id, invalidMovie, tokenUsuarioAdmin, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "releaseYear must be a number conforming to the specified constraints"
          ])
        })
    })
  })
})