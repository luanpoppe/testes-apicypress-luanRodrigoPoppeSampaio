const { fakerPT_BR: faker } = require('@faker-js/faker');

describe('Validação de consultas de usuários admins', () => {
    let id
    let token
    let email = faker.internet.email()
    let name = faker.internet.userName()
    let password = faker.internet.password(9)

    let newEmail = faker.internet.email()
    let newName = faker.internet.userName()
    let newPassword = faker.internet.password(9)
    let newToken


    before(() => {
        // Processo para criar, logar e tornar o usuário admin antes dos testes
        cy.log("Criar um usuário, logar e torná-lo admin")
        cy.request("POST", '/api/users', {
            email: email,
            name: name,
            password: password,
        }).then((resposta) => {
            id = resposta.body.id

            console.log('id', id, "email", email)

            cy.request("POST", '/api/auth/login', {
                email: email,
                password: password,
            }).then((resposta) => {
                token = resposta.body.accessToken
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

    it("Criar novo usuário, tornar admin e checar se o usuário anterior existe como inativo", function () {
        cy.request("POST", '/api/users', {
            email: newEmail,
            name: newName,
            password: newPassword,
        }).then(() => {
            cy.request("POST", '/api/auth/login', {
                email: newEmail,
                password: newPassword,
            }).then((resposta) => {
                newToken = resposta.body.accessToken
                cy.request({
                    method: 'PATCH',
                    url: '/api/users/admin/',
                    auth: {
                        bearer: newToken
                    }
                }).then(() => {
                    cy.request({
                        method: 'GET',
                        url: '/api/users',
                        auth: {
                            bearer: newToken
                        },
                    }).then((resposta) => {
                        cy.log(resposta.body)
                        cy.log('id', id, "email", email)
                        cy.log("newEmail", newEmail, "newName", newName)
                        const usuarioInativo = resposta.body.filter((usuario) => {
                            return usuario.email == email || usuario.id == id
                        })
                        cy.log("Usuário com o email inativo: ", usuarioInativo)
                    })
                })
            })
        })
    })
})

