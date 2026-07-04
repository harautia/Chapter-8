const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongoServer

before(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

after(async () => {
  await mongoose.connection.close()
  await mongoServer.stop()
})

/*
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../server')

const api = supertest(app)

test('Authors are returned as json', async () => {
  const query = `
    query {
      allAuthors {
        name
        born
        bookCount
      }
    }
  `
    const response = await api
        .post('/graphql')
        .send({ query })
        .expect(200)
        .expect('Content-Type', /application\/json/)

    console.log(response.body)
    assert(response.body.data.allAuthors)

})

after(async () => {
  await mongoose.connection.close()
})
*/