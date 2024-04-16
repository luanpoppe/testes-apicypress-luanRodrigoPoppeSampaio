describe('Validação de consultas de usuários comuns', () => {
  let id
  let token
  let email
  let name
  let password
  const movieId = 4

  before(() => {
    // Processo para criar e logar com um usuário antes dos testes
    cy.fixture("newUser.json").then((user) => {
      email = user.email
      name = user.name
      password = user.password
    }).then(() => {
      cy.log("Criar um usuário")
      cy.criarUsuario(name, email, password).then((idRecebido) => {
        id = idRecebido

        cy.logar(email, password).then((tokenRecebido) => {
          token = tokenRecebido
        })
      })
    })
  })

  after(() => {
    // Processo para apagar o usuário ao fim dos testes
    cy.log("Tornar o usuário admin e deletar o usuário")
    cy.tornarAdminEDeletar(id, token)
  })

  it('Usuário do tipo comum pode criar uma review sobre um filme', () => {
    cy.log(id)
    cy.request({
      method: 'POST',
      url: '/api/users/review',
      auth: {
        bearer: token
      },
      body: {
        movieId: movieId,
        score: 5,
        reviewText: "Texto da review do filme"
      }
    }).then((resposta) => {
      expect(resposta.status).to.equal(201)
    })
  })

  it('Checar que a review criada existe', () => {
    cy.request("/api/movies/" + movieId).then((resposta) => {
      const userReviews = resposta.body.reviews.filter((filme) => {
        return filme.user.id = id
      })
      cy.log(userReviews)
      expect(userReviews).to.have.length(1)
      expect(userReviews[0].reviewText).to.equal("Texto da review do filme")
      expect(userReviews[0].score).to.equal(5)
    })
  })

  it('Checar que ao escrever nova review, irá atualiza o valor da review antiga', () => {
    cy.request({
      method: 'POST',
      url: '/api/users/review',
      auth: {
        bearer: token
      },
      body: {
        movieId: movieId,
        score: 1,
        reviewText: "Texto da NOVA review do filme"
      }
    }).then(() => {
      cy.request("/api/movies/" + movieId).then((resposta) => {
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