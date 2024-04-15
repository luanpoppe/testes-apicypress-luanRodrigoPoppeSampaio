describe('Validação de cadastro de usuários', () => {
  let id
  let token
  let email
  let name
  let password

  before(() => {
    cy.fixture("newUser.json").then((user) => {
      email = user.email
      name = user.name
      password = user.password
    }).then(() => {
      // Processo para criar um usuário antes dos testes
      cy.log("Criar um usuário")

      cy.criarUsuario(name, email, password).then((resposta) => {
        id = resposta
      })
    })
  })


  after(() => {
    // Processo para apagar o usuário depois de ser cadastrado
    cy.log("Processo de apagar o usuário criado: ")

    cy.logar(email, password).then((resposta) => {
      token = resposta

      cy.tornarAdminEDeletar(id, token)
    })

    // cy.request("POST", "/api/auth/login", {
    //   email: email,
    //   password: password
    // }).then((resposta) => {
    //   token = resposta.body.accessToken
    // })
  })

  it("Não é possível logar com um email não existente", () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login',
      body: {
        email: "emailNaoExistente@email.com",
        password: password
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(401)
      expect(resposta.body.message).to.equal("Invalid username or password.")
      expect(resposta.body.accessToken).to.not.exist

    })
  })

  it('Pessoa não logada não consegue acessar endpoints', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(401)
      expect(resposta.body.message).to.equal("Access denied.")
    })
  })

  it('Não é possível acessar endpoints com um accessToken errado', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
      headers: {
        Authorization: "token falso"
      },
      failOnStatusCode: false
    }).then((resposta) => {
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
      expect(resposta.body.accessToken).to.have.length(184)
      token = resposta.body.accessToken
    })
  })

  it('Usuário criado tem permissão para funcionalidades de usuários comuns, como checar suas próprias informações', () => {
    cy.request({
      method: 'GET',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
      headers: {
        Authorization: "Bearer " + token
      },
    }).then((resposta) => {
      expect(resposta.body.type).to.equal(0)
      expect(resposta.status).to.equal(200)
    })
  })
})