describe("Pessoa não logada pode acessar informações sobre filmes", () => {
  it('Pessoa não logada pode acessar lista de todos os filmes', () => {
    cy.request("/api/movies").then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body).to.be.a("array")
      expect(resposta.body[0]).to.have.property("title")
      expect(resposta.body[0]).to.have.property("genre")
      expect(resposta.body[0]).to.have.property("releaseYear")
      expect(resposta.body[0]).to.have.property("durationInMinutes")
      expect(resposta.body[0]).to.have.property("description")
      expect(resposta.body[0]).to.have.property("id")
    })
  })

  it('Pessoa não logada pode acessar informações de um filme em específico', () => {
    cy.request("/api/movies/1").then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body).to.have.property("title")
      expect(resposta.body).to.have.property("genre")
      expect(resposta.body).to.have.property("releaseYear")
      expect(resposta.body).to.have.property("durationInMinutes")
      expect(resposta.body).to.have.property("description")
      expect(resposta.body.id).to.equal(1)
      expect(resposta.body).to.have.property("reviews")
    })
  })

  it('Pessoa não logada pode pesquisar por um filmes', () => {
    cy.request("/api/movies/search?title=cre").then((resposta) => {
      expect(resposta.status).to.equal(200)
      expect(resposta.body).to.be.a("array")
    })
  })

})