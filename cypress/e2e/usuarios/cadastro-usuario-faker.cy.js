const { fakerPT_BR: faker } = require('@faker-js/faker');

function createRandomUser() {
  return {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(9)
  }
}
const userCreated = createRandomUser()

describe('Validação de cadastro de usuários', () => {
  let id

  it('Criar o usuário com valores válidos', () => {
    cy.request("POST", '/api/users', userCreated).then((resposta) => {
      expect(resposta).to.deep.include({
        status: 201,
        isOkStatusCode: true,
      })
      expect(resposta.body).to.deep.include({
        name: userCreated.name,
        email: userCreated.email,
        type: 0
      })
      expect(resposta.body.id).to.be.a("number")
      expect(resposta.body).to.have.property("active")

      id = resposta.body.id
    })
  })

  it("Não permitir criar uma conta com um email já existente", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: userCreated.name,
        email: userCreated.email,
        password: userCreated.password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(409)
      expect(resposta.body).to.deep.equal({
        message: "Email already in use",
        error: "Conflict",
        statusCode: 409
      })
    })
  })

  it("Não permitir criar uma conta sem passar um valor de usuario", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: null,
        email: userCreated.email,
        password: userCreated.password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "name must be longer than or equal to 1 characters",
        "name must be a string",
        "name should not be empty"
      ])
    })
  })

  it("Não permitir criar uma conta sem passar um valor de email", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: userCreated.name,
        email: null,
        password: userCreated.password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "email must be longer than or equal to 1 characters",
        "email must be an email",
        "email should not be empty"
      ])
    })
  })

  it("Não permitir criar uma conta sem passar um valor de email válido", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: userCreated.name,
        email: "emailNaoValido",
        password: userCreated.password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "email must be an email"
      ])
    })
  })

  it("Não permitir criar uma conta sem passar um valor de senha", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: userCreated.name,
        email: userCreated.email,
        password: null
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "password must be longer than or equal to 6 characters",
        "password must be a string",
        "password should not be empty"
      ])
    })
  })

  it("Não permitir criar uma conta com um senha menor do que 6 caracteres", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: userCreated.name,
        email: userCreated.email,
        password: "12345"
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "password must be longer than or equal to 6 characters"
      ])
    })
  })

  it("Não permitir criar uma conta com um senha maior do que 12 caracteres", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: userCreated.name,
        email: userCreated.email,
        password: "1234567890123"
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "password must be shorter than or equal to 12 characters"
      ])
    })
  })

  it("Não permitir criar uma conta passando números no campo de 'name'", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: 123456789,
        email: userCreated.email,
        password: userCreated.password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "name must be longer than or equal to 1 and shorter than or equal to 100 characters",
        "name must be a string"
      ])
    })
  })

  it("Não permitir criar uma conta com um 'name' de mais de 100 caracteres", () => {
    let nameInvalido = ""
    for (let i = 0; i < 110; i++) {
      nameInvalido += "a"

    }
    cy.request({
      method: 'POST',
      url: '/api/users/',
      body: {
        name: nameInvalido,
        email: userCreated.email,
        password: userCreated.password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "name must be shorter than or equal to 100 characters"
      ])
    })
  })
})