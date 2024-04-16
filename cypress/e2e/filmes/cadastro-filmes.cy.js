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

  it('Não permitir usuário comum cadastrar um filme', function () {
    cy.request({
      method: 'POST',
      url: '/api/movies',
      auth: {
        bearer: token
      },
      body: movieInfos,
    }).then((resposta) => {
      expect(resposta.status).to.equal(201)
      // expect(resposta.body.message).to.equal("Forbidden")

    })
  })
})