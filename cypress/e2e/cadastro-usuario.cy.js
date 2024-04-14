describe('Validação de cadastro de usuários', () => {
  let id
  let token
  let email = "luanpoppe12@gmail.com"
  let name = "Luan"
  let password = "senha123"

  after(() => {
    // Processo para apagar o usuário depois de ser cadastrado
    cy.log("Processo de apagar o usuário criado: ")
    cy.request("POST", "/api/auth/login", {
      email: email,
      password: password
    }).then((resposta) => {
      token = resposta.body.accessToken

      cy.request({
        method: 'PATCH',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin/',
        headers: {
          Authorization: "Bearer " + token
        }
      }).then(() => {
        cy.request({
          method: 'DELETE',
          url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
          headers: {
            Authorization: "Bearer " + token
          }
        })
      })
    })
  })

  it('Criar o usuário com valores válidos', () => {
    cy.request("POST", '/api/users', {
      name: name,
      email: email,
      password: password
    }).then((resposta) => {
      cy.log(resposta)
      expect(resposta.status).to.equal(201)
      expect(resposta.isOkStatusCode).to.equal(true)
      expect(resposta.body.name).to.equal(name)
      expect(resposta.body.email).to.equal(email)
      expect(resposta.body.id).to.be.a("number")
      expect(resposta.body).to.have.property("active")
      expect(resposta.body.type).to.equal(0)
      id = resposta.body.id
    })
  })

  it("Não permitir criar uma conta com um email já existente", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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

  it("Não permitir criar uma conta sem passar um valor de usuario", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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

  it("Não permitir criar uma conta sem passar um valor de email", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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

  it("Não permitir criar uma conta sem passar um valor de email válido", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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

  it("Não permitir criar uma conta sem passar um valor de senha", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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

  it("Não permitir criar uma conta com um senha menor do que 6 caracteres", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/',
      headers: {
        Authorization: "Bearer " + token
      },
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