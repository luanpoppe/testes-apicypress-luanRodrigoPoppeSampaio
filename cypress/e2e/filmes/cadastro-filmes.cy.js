describe("Usuário comun - Cadastro de filmes", function () {
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

  it('Não permitir usuário comum cadastrar um filme', function () {
    cy.request({
      method: 'POST',
      url: '/api/movies',
      auth: {
        bearer: token
      },
      body: movieInfos,
      failOnStatusCode: false
    }).then((resposta) => {
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
          cy.request({
            method: 'PATCH',
            url: '/api/users/admin',
            auth: {
              bearer: token
            },
          })
        })
      })
    })
  })

  it('Cadastro de filme com valores válidos', function () {
    cy.request({
      method: 'POST',
      url: '/api/movies',
      auth: {
        bearer: token
      },
      body: movieInfos,
    }).then((resposta) => {
      expect(resposta.status).to.equal(201)
    })
  })

  describe("Cadastro de filmes com valores inválidos", function () {
    it('Título do filme inválido', function () {
      const invalidMovie = {
        ...movieInfos,
        title: null
      }

      cy.request({
        method: 'POST',
        url: '/api/movies',
        auth: {
          bearer: token
        },
        body: invalidMovie,
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "title must be longer than or equal to 1 characters",
          "title must be a string",
          "title should not be empty"
        ])
      })
    })

    it('Gênero do filme inválido', function () {
      const invalidMovie = {
        ...movieInfos,
        genre: null
      }
      cy.request({
        method: 'POST',
        url: '/api/movies',
        auth: {
          bearer: token
        },
        body: invalidMovie,
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "genre must be longer than or equal to 1 characters",
          "genre must be a string",
          "genre should not be empty"
        ])
      })
    })

    it('Descrição do filme inválido', function () {
      const invalidMovie = {
        ...movieInfos,
        title: null
      }

      cy.request({
        method: 'POST',
        url: '/api/movies',
        auth: {
          bearer: token
        },
        body: invalidMovie,
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "title must be longer than or equal to 1 characters",
          "title must be a string",
          "title should not be empty"
        ])
      })
    })

    it('Duração do filme inválido', function () {
      const invalidMovie = {
        ...movieInfos,
        durationInMinutes: null
      }

      cy.request({
        method: 'POST',
        url: '/api/movies',
        auth: {
          bearer: token
        },
        body: invalidMovie,
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "durationInMinutes must be a number conforming to the specified constraints",
          "durationInMinutes should not be empty"
        ])
      })
    })

    it('Ano de lançamento do filme inválido', function () {
      const invalidMovie = {
        ...movieInfos,
        releaseYear: null
      }

      cy.request({
        method: 'POST',
        url: '/api/movies',
        auth: {
          bearer: token
        },
        body: invalidMovie,
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "releaseYear must be a number conforming to the specified constraints",
          "releaseYear should not be empty"
        ])
      })
    })
  })

})

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

      cy.request({
        method: 'DELETE',
        url: '/api/movies/' + lastMovie.id,
        auth: {
          bearer: token
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(403)
        expect(resposta.body.message).to.equal("Forbidden")
      })
    })
  })

  it('Usuário admin - Pode realizar deleção de filme', function () {
    cy.getAllMovies().then((todosFilmes) => {
      const lastMovie = todosFilmes[todosFilmes.length - 1]
      cy.request({
        method: 'PATCH',
        url: '/api/users/admin',
        auth: {
          bearer: token
        },
      }).then(() => {
        cy.request({
          method: 'DELETE',
          url: '/api/movies/' + lastMovie.id,
          auth: {
            bearer: token
          },
        }).then((resposta) => {
          expect(resposta.status).to.equal(204)
        })
      })
    })
  })
})

describe("Atualização de filme", function () {
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

  it('Usuário comum - Não pode realizar atualização de filme', function () {
    cy.getAllMovies().then((todosFilmes) => {
      const lastMovie = todosFilmes[todosFilmes.length - 1]

      cy.request({
        method: 'PUT',
        url: '/api/movies/' + lastMovie.id,
        auth: {
          bearer: token
        },
        body: lastMovie,
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(403)
        expect(resposta.body.message).to.equal("Forbidden")
      })
    })
  })

  it('Usuário admin - Pode realizar atualização de filme', function () {
    cy.getAllMovies().then((todosFilmes) => {
      const lastMovie = todosFilmes[todosFilmes.length - 1]
      cy.request({
        method: 'PATCH',
        url: '/api/users/admin',
        auth: {
          bearer: token
        },
      }).then(() => {
        cy.request({
          method: 'PUT',
          url: '/api/movies/' + lastMovie.id,
          auth: {
            bearer: token
          },
          body: lastMovie
        }).then((resposta) => {
          expect(resposta.status).to.equal(204)
        })
      })
    })
  })
})