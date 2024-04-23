describe('Validação de cadastro de usuários', () => {
  let id
  let token
  let email
  let name
  let password

  before(() => {
    cy.criarFaker().then((user) => {
      email = user.email
      name = user.name
      password = user.password
    })
  })

  after(() => {
    cy.log("Processo de apagar o usuário criado: ")
    cy.logar(email, password).then((accessToken) => {
      token = accessToken
      cy.tornarAdminEDeletar(id, token)
    })
  })

  it('Criar o usuário com valores válidos', () => {
    cy.request("POST", '/api/users', {
      name: name,
      email: email,
      password: password
    }).then((resposta) => {
      expect(resposta).to.deep.include({
        status: 201,
        isOkStatusCode: true,
      })
      expect(resposta.body).to.deep.include({
        name: name,
        email: email,
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
        name: name,
        email: email,
        password: password
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

  it("Não permitir criar uma conta sem passar um body", () => {
    cy.request({
      method: 'POST',
      url: '/api/users/',
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(400)
      expect(resposta.body.message).to.deep.equal([
        "name must be longer than or equal to 1 characters",
        "name must be a string",
        "name should not be empty",
        "email must be longer than or equal to 1 characters",
        "email must be an email",
        "email should not be empty",
        "password must be longer than or equal to 6 characters",
        "password must be a string",
        "password should not be empty"
      ])
    })
  })

  describe("Falhas do 'name':", function () {
    it("Não permitir criar uma conta sem passar um valor de usuario", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: null,
          email: email,
          password: password
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

    it("Não permitir criar uma conta passando outro tipo que não string no campo de 'name'", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: 123456789,
          email: email,
          password: password
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
      for (let i = 0; i < 101; i++) {
        nameInvalido += "a"

      }
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: nameInvalido,
          email: email,
          password: password
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "name must be shorter than or equal to 100 characters"
        ])
      })
    })

    it("Não permitir criar uma conta com um 'name' sendo uma string vazia", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: "",
          email: email,
          password: password
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "name must be longer than or equal to 1 characters",
          "name should not be empty"
        ])
      })
    })
  })

  describe("Falhas do 'email':", function () {
    it("Não permitir criar uma conta sem passar um valor de email", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: null,
          password: password
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

    it("Não permitir criar uma conta com o email sendo uma string vazia", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: "",
          password: password
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

    it("Não permitir criar uma conta sem passar um valor no formato de email", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: "emailNaoValido",
          password: password
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "email must be an email"
        ])
      })
    })

    it("Não permitir criar uma conta passando outro tipo sem ser string para o 'email'", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: 123456,
          password: password
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "email must be longer than or equal to 1 and shorter than or equal to 60 characters",
          "email must be an email"
        ])
      })
    })

    it("Não permitir criar uma conta com 'email' maior que 60 caracteres", () => {
      let emailInvalido = "a"
      for (let i = 0; i < 61; i++) {
        emailInvalido += "a"
      }
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: emailInvalido + "@gmail.com",
          password: password
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal(["email must be shorter than or equal to 60 characters"])
      })
    })
  })

  describe("Falhas do 'password':", function () {
    it("Não permitir criar uma conta sem passar um valor de senha", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: email,
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

    it("Não permitir criar uma conta com a senha sendo de um tipo que não string", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: email,
          password: 123456
        },
        failOnStatusCode: false
      }).then((resposta) => {
        expect(resposta.status).to.equal(400)
        expect(resposta.body.message).to.deep.equal([
          "password must be longer than or equal to 6 and shorter than or equal to 12 characters",
          "password must be a string"
        ])
      })
    })

    it("Não permitir criar uma conta com um senha menor do que 6 caracteres", () => {
      cy.request({
        method: 'POST',
        url: '/api/users/',
        body: {
          name: name,
          email: email,
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
          name: name,
          email: email,
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
  })
})