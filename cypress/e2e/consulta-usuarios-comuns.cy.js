describe('Validação de consultas de usuários comuns', () => {
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
      // Processo para criar e logar com um usuário antes dos testes
      cy.log("Criar um usuário")
      cy.request("POST", '/api/users', {
        name: name,
        email: email,
        password: password
      }).then((resposta) => {
        id = resposta.body.id
        email = resposta.body.email
        name = resposta.body.name
        cy.log("Logar com usuário criado")
        cy.request("POST", "/api/auth/login", {
          email: email,
          password: "senha123"
        }).then((resposta) => {
          token = resposta.body.accessToken
        })
      })
    })

  })

  after(() => {
    // Processo para apagar o usuário ao fim dos testes

    cy.log("Deletar o usuário criado")
    cy.request({
      method: 'DELETE',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
      headers: {
        Authorization: "Bearer " + token
      }

    })

  })

  it("Consultar informações do usuário criado", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + id,
      headers: {
        Authorization: "Bearer " + token
      }
    })
  })

  it("Não permitir que usuário do tipo comum tenha permissão de ver informações de todos os usuário", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/",
      headers: {
        Authorization: "Bearer " + token
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(403)
      expect(resposta.body.message).to.equal("Forbidden")
    })
  })

  it("Não permitir que usuário do tipo comum tenha permissão de deletar um usuário", () => {
    cy.request({
      method: "DELETE",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + id,
      headers: {
        Authorization: "Bearer " + token
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(403)
      expect(resposta.body.message).to.equal("Forbidden")
    })
  })

  it("Permitir que usuário do tipo comum atualize suas próprias informações", () => {
    cy.request({
      method: "PUT",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + (id),
      headers: {
        Authorization: "Bearer " + token
      },
      body: {
        name: "novoNome",
        password: "novoPassword"
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body.name).to.equal("novoNome")
    })
  })

  it("Não permitir que usuário do tipo comum atualize informações de outros usuários", () => {
    cy.request({
      method: "PUT",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + (id - 1),
      headers: {
        Authorization: "Bearer " + token
      },
      body: {
        name: "novoNome",
        password: "novoPassword"
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(403)
      expect(resposta.body.message).to.equal("Forbidden")
    })
  })

  // it("Permitir que um usuário possa inativar sua própria conta", () => {
  //   cy.request("PATCH", "api/users/inactivate").then((resposta) => {

  //   })
  // })

  it("Permitir que usuário comum se torne admin sem passar por critérios especiais", () => {
    cy.request({
      method: 'PATCH',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin/',
      headers: {
        Authorization: "Bearer " + token
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(204)
    })
  })

})