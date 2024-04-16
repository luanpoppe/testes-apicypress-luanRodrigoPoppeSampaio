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

      cy.criarUsuario(name, email, password).then((idRecebido) => {
        id = idRecebido
      }).then(function () {
        cy.logar(email, password).then((tokenRecebido) => {
          token = tokenRecebido
        })
      })
    })


  })

  after(() => {
    // Processo para apagar o usuário ao fim dos testes
    cy.log("Deletar o usuário criado")
    cy.request({
      method: 'DELETE',
      url: '/api/users/' + id,
      auth: {
        bearer: token
      }

    })

  })

  it("Consultar informações do usuário criado", () => {
    cy.request({
      method: "GET",
      url: "/api/users/" + id,
      auth: {
        bearer: token
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body).to.deep.include({
        email: email,
        name: name,
        active: true,
        type: 0
      })
    })
  })

  it("Não permitir que usuário do tipo comum tenha permissão de ver informações de todos os usuário", () => {
    cy.request({
      method: "GET",
      url: "/api/users/",
      auth: {
        bearer: token
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(403)
      expect(resposta.body.message).to.equal("Forbidden")
    })
  })

  it("Não permitir que usuário do tipo comum tenha permissão de ver informações de outro usuário", () => {
    cy.request({
      method: "GET",
      url: "/api/users/" + (id - 1),
      auth: {
        bearer: token
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(403)
      expect(resposta.body).to.deep.include({
        message: "Forbidden"
      })
    })
  })

  it("Não permitir que usuário do tipo comum tenha permissão de deletar um usuário", () => {
    cy.request({
      method: "DELETE",
      url: "/api/users/" + id,
      auth: {
        bearer: token
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
      url: "/api/users/" + (id),
      auth: {
        bearer: token
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
      url: "/api/users/" + (id - 1),
      auth: {
        bearer: token
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
      url: '/api/users/admin/',
      auth: {
        bearer: token
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(204)

      cy.request({
        method: 'GET',
        url: '/api/users/' + id,
        auth: {
          bearer: token
        },
      }).then((resposta) => {
        expect(resposta.body.type).to.equal(1)
      })
    })
  })

})