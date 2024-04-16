describe('Validação de consultas de usuários admins', () => {
  let id
  let token
  let email
  let name
  let password
  let newToken


  before(() => {
    cy.criarFaker()
      // cy.fixture("newUser.json").then((user) => {
      //   email = user.email
      //   name = user.name
      //   password = user.password
      // })
      .then((resposta) => {
        email = resposta.email
        name = resposta.name
        password = resposta.password

        // Processo para criar, logar e tornar o usuário admin antes dos testes
        cy.log("Criar um usuário, logar e torná-lo admin")
        cy.criarUsuario(name, email, password).then((idRecebido) => {
          id = idRecebido
        }).then(function () {
          cy.logar(email, password).then((tokenRecebido) => {
            token = tokenRecebido
            cy.request({
              method: 'PATCH',
              url: '/api/users/admin/',
              auth: {
                bearer: token
              }
            })
          })
        })

      })

  })

  it("Permitir que usuário do tipo admin tenha permissão de ver informações de todos os usuário", () => {
    cy.log(token)
    cy.request({
      method: "GET",
      url: "/api/users/",
      auth: {
        bearer: token
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body).to.be.a("array")
    })
  })

  it("Permitir que usuário do tipo admin tenha permissão de deletar um usuário", () => {
    cy.request({
      method: "DELETE",
      url: "/api/users/" + (id - 1),
      auth: {
        bearer: token
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(204)
    })
  })

  it("Permitir que usuário do tipo admin tenha permissão de atualizar informações de outros usuários", () => {
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
    }).then((resposta) => {
      expect(resposta.status).to.equal(200)
    })
  })

  it("Permitir que usuário do tipo admin possa inativar sua conta", () => {
    cy.request({
      method: "PATCH",
      url: "/api/users/inactivate",
      auth: {
        bearer: token
      },
    }).then((resposta) => {
      expect(resposta.status).to.equal(204)
    })
  })

  it('Não deve ser permitido deletar a própria conta se o usuário estiver como inativo', () => {
    cy.request({
      method: 'DELETE',
      url: '/api/users/' + id,
      auth: {
        bearer: token
      },
      failOnStatusCode: false
    }).then((resposta) => {
      expect(resposta.status).to.equal(401)
    })
  })

  // it('Ao tentar cadastrar novamente com o mesmo usuário, tendo em vista que o usuário não foi deletado, deveria dar erro, mas não está dando', function () {
  //   // Inativar um usuário na verdade está deletando o usuário
  //   cy.request("POST", '/api/users', {
  //     email: email,
  //     name: name,
  //     password: password,
  //   }).then((resposta) => {
  //     const typeOfStatus = resposta.status.toString().split("")[0]
  //     expect(typeOfStatus).to.equal("4")
  //   })
  // })
})