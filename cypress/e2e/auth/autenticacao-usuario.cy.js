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
    }).then(() => {
      cy.log("Criar um usuário")
      cy.criarUsuario(name, email, password).then((resposta) => {
        id = resposta
      })
    })
  })

  after(() => {
    cy.log("Processo de apagar o usuário criado: ")
    cy.logar(email, password).then((resposta) => {
      token = resposta
      cy.tornarAdminEDeletar(id, token)
    })
  })

  describe("Falhas ao tentar logar", function () {
    it("Falha ao não passar o body com atributos esperados pela API", () => {
      cy.req("POST", "/api/auth/login", null, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "email should not be empty",
            "email must be an email",
            "password must be a string",
            "password should not be empty"
          ])
          expect(resposta.body.accessToken).to.not.exist
        })
    })

    it("Não é possível logar sem passar um email", () => {
      const body = {
        password: password
      }
      cy.req("POST", "/api/auth/login", body, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal(["email should not be empty", "email must be an email"])
          expect(resposta.body.accessToken).to.not.exist
        })
    })

    it("Não é possível logar com um email não existente", () => {
      const body = {
        email: "emailNaoExistente@email.com",
        password: password
      }
      cy.req("POST", "/api/auth/login", body, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(401)
          expect(resposta.body.message).to.equal("Invalid username or password.")
          expect(resposta.body.accessToken).to.not.exist
        })
    })

    it("Não é possível logar com um email não sendo uma string", () => {
      const body = {
        email: 123456,
        password: password
      }
      cy.req("POST", "/api/auth/login", body, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal(["email must be an email"])
          expect(resposta.body.accessToken).to.not.exist
        })
    })

    it("Não é possível sem passar uma senha", () => {
      const body = {
        email: email,
      }
      cy.req("POST", "/api/auth/login", body, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal(["password must be a string", "password should not be empty"])
          expect(resposta.body.accessToken).to.not.exist
        })
    })

    it("Não é possível logar com um password sendo string vazia", () => {
      const body = {
        email: email,
        password: ""
      }
      cy.req("POST", "/api/auth/login", body, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal(["password should not be empty"])
          expect(resposta.body.accessToken).to.not.exist
        })
    })

    it("Não é possível logar com um password não sendo uma string", () => {
      const body = {
        email: email,
        password: 123456
      }
      cy.req("POST", "/api/auth/login", body, null, false)
        .then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal(["password must be a string"])
          expect(resposta.body.accessToken).to.not.exist
        })
    })
  })

  it('Pessoa não logada não consegue acessar endpoints que necessitem de autorização', () => {
    cy.req('GET', '/api/users/' + id, null, null, false)
      .then((resposta) => {
        expect(resposta.status).to.equal(401)
        expect(resposta.body.message).to.equal("Access denied.")
      })
  })

  it('Não é possível acessar endpoints que necessitem de autorização com um accessToken errado', () => {
    cy.req('GET', '/api/users/' + id, null, "token falso", false)
      .then((resposta) => {
        expect(resposta.status).to.equal(401)
        expect(resposta.body.message).to.equal("Access denied.")
      })
  })

  it('É possível logar com novo usuário criado', () => {
    cy.request("POST", "/api/auth/login", {
      email: email,
      password: password
    }).then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body.accessToken).to.be.a("string")
      token = resposta.body.accessToken
    })
  })

  it('Usuário criado tem permissão para funcionalidades de usuários comuns, como checar suas próprias informações', () => {
    cy.req("GET", '/api/users/' + id, null, token, null)
      .then((resposta) => {
        expect(resposta.body.type).to.equal(0)
        expect(resposta.status).to.equal(200)
      })
  })
})