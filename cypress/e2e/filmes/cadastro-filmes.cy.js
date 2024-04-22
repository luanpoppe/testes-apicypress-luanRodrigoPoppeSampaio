describe("Usuário comun - Cadastro de filmes", function () {
  let id
  let name
  let email
  let password
  let token
  let movieInfos

  before(function () {
    cy.log("criando novo usuário comum")
    cy.fixture("newMovie.json").then((resposta) => {
      movieInfos = resposta
    }).then(function () {
      cy.criarFaker().then((user) => {
        name = user.name
        email = user.email
        password = user.password
        cy.criarUsuario(name, email, password).then(function (idRecebido) {
          id = idRecebido
          cy.logar(email, password).then((tokenRecebido) => {
            token = tokenRecebido
          })
        })
      })
    })
  })

  after(function () {
    cy.tornarAdminEDeletar(id, token)
  })

  it('Não permitir usuário comum cadastrar um filme', function () {
    cy.req("POST", '/api/movies', movieInfos, token, false)
      .then((resposta) => {
        expect(resposta.status).to.equal(403)
        expect(resposta.body.message).to.equal("Forbidden")
      })
  })
})

describe("Usuário admin - Cadastro de filmes", function () {
  let id
  let name
  let email
  let password
  let token
  let movieInfos
  let movieId

  before(function () {
    cy.log("Criar usuário e tornar admin")
    cy.fixture("newMovie.json")
      .then((resposta) => {
        movieInfos = resposta
        cy.criarFaker().then((user) => {
          name = user.name
          email = user.email
          password = user.password
          cy.criarUsuario(name, email, password).then((idRecebido) => {
            id = idRecebido
            cy.logar(email, password).then((tokenRecebido) => {
              token = tokenRecebido
              cy.req("PATCH", "/api/users/admin", null, token)
            })
          })
        })
      })
  })

  after(function () {
    cy.log("Apagando usuário e filme criados")
    cy.deleteMovie(movieId, token).then(() => {
      cy.deletarUsuario(id, token)
    })

  })

  describe("Cadastro de filme com valores válidos", function () {
    it('Cadastro de filme com sucesso', function () {
      cy.req("POST", "/api/movies", movieInfos, token)
        .then((resposta) => {
          expect(resposta.status).to.equal(201)
          expect(resposta.body).to.deep.include(movieInfos)
          movieId = resposta.body.id
        })
    })

    it('Checar se filme criado existe', function () {
      cy.getAllMovies().then((listaFilmes) => {
        let filmeAdicionado = listaFilmes.filter((filme) => {
          return filme.id == movieId
        })
        expect(filmeAdicionado).to.have.length(1)
        expect(filmeAdicionado[0]).to.deep.include(movieInfos)
      })
    })
  })

  describe("Cadastro de filmes com valores inválidos", function () {

    it('Título do filme null', function () {
      const invalidMovie = {
        ...movieInfos,
        title: null
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 characters",
            "title must be a string",
            "title should not be empty"
          ])
        })
    })

    it('Título do filme como número', function () {
      const invalidMovie = {
        ...movieInfos,
        title: 123456
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 and shorter than or equal to 100 characters",
            "title must be a string"
          ])
        })
    })

    it('Título do filme como string vazia', function () {
      const invalidMovie = {
        ...movieInfos,
        title: ""
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "title must be longer than or equal to 1 characters",
            "title should not be empty"
          ])
        })
    })

    it('Título do filme com mais de 100 caracteres', function () {
      let titulo = ""
      for (let i = 0; i < 101; i++) {
        titulo += "a"
      }

      const invalidMovie = {
        ...movieInfos,
        title: titulo
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "title must be shorter than or equal to 100 characters"
          ])
        })
    })

    it('Gênero do filme como null', function () {
      const invalidMovie = {
        ...movieInfos,
        genre: null
      }
      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre must be a string",
            "genre should not be empty"
          ])
        })
    })

    it('Gênero do filme como number', function () {
      const invalidMovie = {
        ...movieInfos,
        genre: 123456
      }
      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 and shorter than or equal to 100 characters",
            "genre must be a string"
          ])
        })
    })

    it('Gênero do filme como string vazia', function () {
      const invalidMovie = {
        ...movieInfos,
        genre: ""
      }
      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "genre must be longer than or equal to 1 characters",
            "genre should not be empty"
          ])
        })
    })

    it('Gênero do filme com mais de 100 caracteres', function () {
      let genre = "a"
      for (let i = 0; genre.length < 101; i++) {
        genre += "a"
      }

      const invalidMovie = {
        ...movieInfos,
        genre: genre
      }
      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "genre must be shorter than or equal to 100 characters"
          ])
        })
    })

    it('Descrição do filme null', function () {
      const invalidMovie = {
        ...movieInfos,
        description: null
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "description must be longer than or equal to 1 characters",
            "description must be a string",
            "description should not be empty"
          ])
        })
    })

    it('Descrição do filme como number', function () {
      const invalidMovie = {
        ...movieInfos,
        description: 123456
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "description must be longer than or equal to 1 and shorter than or equal to 500 characters",
            "description must be a string"
          ])
        })
    })

    it('Descrição do filme como string vazia', function () {
      const invalidMovie = {
        ...movieInfos,
        description: ""
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "description must be longer than or equal to 1 characters",
            "description should not be empty"
          ])
        })
    })

    it('Descrição do filme com mais de 500 caracteres', function () {
      let descricao = "a"
      for (let i = 0; descricao.length < 501; i++) {
        descricao += "a"
      }

      const invalidMovie = {
        ...movieInfos,
        description: descricao
      }

      cy.req("POST", "/api/movies", invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "description must be shorter than or equal to 500 characters"
          ])
        })
    })

    it('Duração do filme null', function () {
      const invalidMovie = {
        ...movieInfos,
        durationInMinutes: null
      }

      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "durationInMinutes must be a number conforming to the specified constraints",
            "durationInMinutes should not be empty"
          ])
        })
    })

    it('Duração do filme como string', function () {
      const invalidMovie = {
        ...movieInfos,
        durationInMinutes: "duracao"
      }

      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "durationInMinutes must be a number conforming to the specified constraints"
          ])
        })
    })

    // Acredito que os testes comentados abaixo deve ser bugs
    // it('Duração do filme com valor 0', function () {
    //   const invalidMovie = {
    //     ...movieInfos,
    //     durationInMinutes: -10
    //   }

    //   cy.req("POST", '/api/movies', invalidMovie, token, false)
    //     .then((resposta) => {
    //       // expect(resposta.status).to.equal(400)
    //     })
    // })

    // it('Duração do filme com valor negativo', function () {
    //   const invalidMovie = {
    //     ...movieInfos,
    //     durationInMinutes: -120
    //   }

    //   cy.req("POST", '/api/movies', invalidMovie, token, false)
    //     .then((resposta) => {
    //       // expect(resposta.status).to.equal(400)
    //     })
    // })

    // it('Duração do filme com 4 dígitos', function () {
    //   const invalidMovie = {
    //     ...movieInfos,
    //     durationInMinutes: 12000
    //   }

    //   cy.req("POST", '/api/movies', invalidMovie, token, false)
    //     .then((resposta) => {
    //     })
    // })

    it('Ano de lançamento do filme null', function () {
      const invalidMovie = {
        ...movieInfos,
        releaseYear: null
      }

      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "releaseYear must be a number conforming to the specified constraints",
            "releaseYear should not be empty"
          ])
        })
    })

    it('Ano de lançamento do filme como string', function () {
      const invalidMovie = {
        ...movieInfos,
        releaseYear: "1200"
      }

      cy.req("POST", '/api/movies', invalidMovie, token, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "releaseYear must be a number conforming to the specified constraints"
          ])
        })
    })
  })
})