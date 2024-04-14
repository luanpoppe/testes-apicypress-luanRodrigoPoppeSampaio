describe('Validação de consultas de usuários comuns', () => {
  let id
  let token
  let email = "luanpoppe13@gmail.com"
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
    cy.log("Tornar o usuário admin")
    cy.request({
      method: 'PATCH',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin/',
      headers: {
        Authorization: "Bearer " + token
      }
    }).then((resposta) => {
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

  it('Usuário do tipo comum pode criar uma review sobre um filme', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/review',
      headers: {
        Authorization: "Bearer " + token
      },
      body: {
        movieId: 1,
        score: 5,
        reviewText: "Texto da review do filme"
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(201)
    })
  })

  it('Checar que a review criada existe', () => {
    cy.request("/api/movies/1").then((resposta) => {
      const userReviews = resposta.body.reviews.filter((filme) => {
        return filme.user.id = id
      })
      expect(userReviews).to.have.length(1)
      expect(userReviews[0].reviewText).to.equal("Texto da review do filme")
      expect(userReviews[0].score).to.equal(5)
    })
  })

  it('Checar que ao escrever nova review, irá atualiza o valor da review antiga', () => {
    cy.request({
      method: 'POST',
      url: 'https://raromdb-3c39614e42d4.herokuapp.com/api/users/review',
      headers: {
        Authorization: "Bearer " + token
      },
      body: {
        movieId: 1,
        score: 1,
        reviewText: "Texto da NOVA review do filme"
      }
    }).then(() => {
      cy.request("/api/movies/1").then((resposta) => {
        const userReviews = resposta.body.reviews.filter((filme) => {
          return filme.user.id = id
        })
        expect(userReviews).to.have.length(1)
        expect(userReviews[0].reviewText).to.equal("Texto da NOVA review do filme")
        expect(userReviews[0].score).to.equal(1)
      })
    })

  })


})