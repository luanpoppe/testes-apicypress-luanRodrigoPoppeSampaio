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
    })
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

  before(function () {
    cy.log("Criar usuário e tornar admin")
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
          cy.req("PATCH", "/api/users/admin", null, token)
        })
      })
    })
  })

  it('Cadastro de filme com valores válidos', function () {
    cy.req("POST", "/api/movies", movieInfos, token)
      .then((resposta) => {
        expect(resposta.status).to.equal(201)
      })
  })

  describe("Cadastro de filmes com valores inválidos", function () {
    it('Título do filme inválido', function () {
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

    it('Gênero do filme inválido', function () {
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

    it('Descrição do filme inválido', function () {
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

    it('Duração do filme inválido', function () {
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

    it('Ano de lançamento do filme inválido', function () {
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
  })

})