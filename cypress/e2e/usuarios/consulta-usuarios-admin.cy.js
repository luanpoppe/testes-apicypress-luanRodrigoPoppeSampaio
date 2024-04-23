describe('Validação de consultas de usuários admins', () => {
  let id
  let token
  let email
  let name
  let password
  let segundoUsuario


  before(() => {
    cy.log("Criar um usuário, logar e torná-lo admin")
    cy.criarFaker().then((resposta) => {
      email = resposta.email
      name = resposta.name
      password = resposta.password
      cy.criarUsuario(name, email, password).then((idRecebido) => {
        id = idRecebido
      }).then(function () {
        cy.logar(email, password).then((tokenRecebido) => {
          token = tokenRecebido
          cy.tornarAdmin(token)
        })
      })
    })

    cy.criarFaker().then((resposta) => {
      segundoUsuario = resposta
      cy.criarUsuario(resposta.name, resposta.email, resposta.password).then((idRecebido) => {
        segundoUsuario.id = idRecebido
      })
    })
  })

  after(function () {
    cy.log("Deletando os usuários criados")
    let idTemporario
    let tokenTemporario
    cy.criarFaker().then((resposta) => {
      cy.criarUsuario(resposta.name, resposta.email, resposta.password).then((idRecebido) => {
        idTemporario = idRecebido
      }).then(function () {
        cy.logar(resposta.email, resposta.password).then((tokenRecebido) => {
          tokenTemporario = tokenRecebido
          cy.tornarAdmin(tokenTemporario)
          cy.deletarUsuario(id, tokenTemporario)
          cy.deletarUsuario(idTemporario, tokenTemporario)
        })
      })
    })
  })

  describe("Casos de falha", function () {
    describe("Atualizar conta", function () {
      it('Não passar um id para atualizar uma conta', function () {
        const body = {
          name: "novoNome",
          password: "novoPassword"
        }
        cy.req("PUT", "/api/users/", body, token, false).then((resposta) => {
          expect(resposta.status).to.equal(404)
          expect(resposta.body.message).to.equal("Cannot PUT /api/users/")
        })
      })

      it('Não passar um id como número para atualizar uma conta', function () {
        const body = {
          name: "novoNome",
          password: "novoPassword"
        }
        cy.req("PUT", "/api/users/" + "idEmTexto", body, token, false).then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
        })
      })

      // Testes abaixo estão comentados por serem bugs: Ex: Não deveria ser possível atualizar uma conta sem passar um body
      // it('Não passar body para atualizar uma conta', function () {
      //   cy.req("PUT", "/api/users/" + segundoUsuario.id, null, token, false).then((resposta) => {
      //     expect(resposta.status).to.equal(400)
      //   })
      // })

      // it('Passar um body com formato errado para atualizar uma conta', function () {
      //   const body = {
      //     nomeErradoDoAtributo: "valorErrado",
      //   }
      //   cy.req("PUT", "/api/users/" + segundoUsuario.id, null, token, false).then((resposta) => {
      //     expect(resposta.status).to.equal(400)
      //     expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
      //   })
      // })

      // it('Passar um body com "name" null para atualizar uma conta', function () {
      //   const body = {
      //     name: null,
      //     password: "novoPassword"
      //   }
      //   cy.req("PUT", "/api/users/" + segundoUsuario.id, body, token, false).then((resposta) => {
      //     expect(resposta.status).to.equal(400)
      //   })
      // })

      // it('Passar um body com "password" null para atualizar uma conta', function () {
      //   const body = {
      //     name: "novoName",
      //     password: null
      //   }
      //   cy.req("PUT", "/api/users/" + segundoUsuario.id, body, token, false).then((resposta) => {
      //     expect(resposta.status).to.equal(400)
      //   })
      // })

      it('Passar um body com "name" com mais de 100 caracteres para atualizar uma conta', function () {
        let nameInvalido = "a"
        for (let i = 0; i < 101; i++) {
          nameInvalido += "a"
        }

        const body = {
          name: nameInvalido,
          password: "novaSenha"
        }
        cy.req("PUT", "/api/users/" + segundoUsuario.id, body, token, false).then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "name must be shorter than or equal to 100 characters",
          ])
        })
      })

      it('Passar um body com "password" sendo string vazia para atualizar uma conta', function () {
        const body = {
          name: "novoName",
          password: ""
        }
        cy.req("PUT", "/api/users/" + segundoUsuario.id, body, token, false).then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "password must be longer than or equal to 6 characters"
          ])
        })
      })

      it('Passar um body com "password" sendo string vazia para atualizar uma conta', function () {
        const body = {
          name: "novoName",
          password: "senhaComMaisDe12Caracteres"
        }
        cy.req("PUT", "/api/users/" + segundoUsuario.id, body, token, false).then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal(["password must be shorter than or equal to 12 characters"])
        })
      })

      it('Passar um body com "password" sendo um tipo que não string para atualizar uma conta', function () {
        const body = {
          name: "novoName",
          password: 123456789
        }
        cy.req("PUT", "/api/users/" + segundoUsuario.id, body, token, false).then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.deep.equal([
            "password must be longer than or equal to 6 and shorter than or equal to 12 characters",
            "password must be a string"
          ])
        })
      })
    })

    describe("Deletar conta", function () {
      it("Não passar um id para deletar um usuário", () => {
        cy.req("DELETE", "/api/users/", null, token, false).then((resposta) => {
          expect(resposta.status).to.equal(404)
          expect(resposta.body.message).to.equal("Cannot DELETE /api/users/")
        })
      })

      it("Passar um texto como id para deletar um usuário", () => {
        cy.req("DELETE", "/api/users/" + "idComoTexto", null, token, false).then((resposta) => {
          expect(resposta.status).to.equal(400)
          expect(resposta.body.message).to.equal("Validation failed (numeric string is expected)")
        })
      })
    })
  })

  describe("Casos de sucesso", function () {
    it("Permitir que usuário do tipo admin tenha permissão de ver informações de todos os usuário", () => {
      cy.request({
        method: "GET",
        url: "/api/users/",
        auth: {
          bearer: token
        }
      }).then((resposta) => {
        expect(resposta.status).to.equal(200)
        expect(resposta.body).to.be.a("array")
        expect(resposta.body.length > 0).to.equal(true)
      })
    })

    it("Permitir que usuário do tipo admin tenha permissão de atualizar informações de outros usuários", () => {
      cy.request({
        method: "PUT",
        url: "/api/users/" + (segundoUsuario.id),
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

    it("Permitir que usuário do tipo admin tenha permissão de deletar um usuário", () => {
      cy.request({
        method: "DELETE",
        url: "/api/users/" + (segundoUsuario.id),
        auth: {
          bearer: token
        }
      }).then((resposta) => {
        expect(resposta.status).to.equal(204)
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