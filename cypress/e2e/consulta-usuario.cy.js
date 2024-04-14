describe('Validação de cadastro de usuários', () => {
  let id
  let token
  let email = "luanpoppe12@gmail.com"
  let name = "Luan"
  let password = "senha123"

  before(() => {
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

  after(() => {
    // Processo para apagar o usuário ao fim dos testes
    cy.log("Tornar usuário criado admin")
    cy.request({
      method: 'PATCH',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin/',
      headers: {
        Authorization: "Bearer " + token
      }
    }).then(() => {
      cy.log("Deletar o usuário criado")
      cy.request({
        method: 'DELETE',
        url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/' + id,
        headers: {
          Authorization: "Bearer " + token
        }
      })
    })

  })

  it("Consultar informações do usuário criadocriado", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/" + id,
      headers: {
        Authorization: "Bearer " + token
      }
    })
  })

  it("Não permitir que usuário não admin tenha permissão de ver informações de todos os usuário", () => {
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

  it("Não permitir que usuário não admin tenha permissão de deletar um usuário", () => {
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

  it("Não permitir que usuário não admin tenha permissão de atualizar informações de outros usuários", () => {
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
  it("Permitir que usuário não admin tenha permissão de atualizar suas próprias informações", () => {
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
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body.name).to.equal("novoNome")
      expect(resposta.body.password).to.equal("novoPassword")
    })
  })
})


it('descricao_do_teste', () => {

})