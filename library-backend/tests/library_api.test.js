const assert = require('node:assert')
const { test, before, beforeEach, after, describe } = require('node:test')
const { ApolloServer } = require('@apollo/server')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const typeDefs = require('../schema')
const resolvers = require('../resolvers')
const Book = require('../models/book')
const Author = require('../models/author')
const User = require('../models/user')

before(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  server = new ApolloServer({ typeDefs, resolvers })
})

describe('User Test Cases', () => {

  beforeEach(async () => {
    await User.deleteMany({})
  })

  const CREATE_USER = `
    mutation CreateUser($username: String!, $favoriteGenre: String!) {
      createUser(username: $username, favoriteGenre: $favoriteGenre) {
      username
      favoriteGenre
      }
    }
  `

  const LOGIN = `
    mutation login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
      value
      }
    }
  `

  const ME = `
      query Me {
        me {
          username
          favoriteGenre
          id
        }
      }
    `

  test('Create User OK Case', async () => {
    const response = await server.executeOperation(
      {
        query: CREATE_USER,
        variables: {
          username: 'testuser',
          favoriteGenre: 'sports',
        }
      })
//    console.log(JSON.stringify(response.body.singleResult.errors, null, 2))
    const { data, errors } = response.body.singleResult
    assert.strictEqual(data.createUser.username, 'testuser')
    assert.strictEqual(data.createUser.favoriteGenre, 'sports')

    const usersInDb = await User.find({})
    assert.strictEqual(usersInDb.length, 1)
  })

  test('Create User Failure Case', async () => {
    const response = await server.executeOperation(
      {
        query: CREATE_USER,
        variables: {
          username: 'testuser',
          favoriteGenre: '',
        }
      })

//    console.log(JSON.stringify(response.body.singleResult.errors, null, 2))
    const { data, errors } = response.body.singleResult
    assert.ok(response.body.singleResult.errors[0].message.includes, 'User validation failed:')

    const usersInDb = await User.find({})
    assert.strictEqual(usersInDb.length, 0)
  })

  test('Logging User OK Case', async () => {

    await server.executeOperation(
      {
        query: CREATE_USER,
        variables: {
          username: 'testuser',
          favoriteGenre: 'sports',
        }
      })


    const response = await server.executeOperation(
      {
        query: LOGIN,
        variables: {
          username: 'testuser',
          password: 'secret',
        }
      })
//    console.log(JSON.stringify(response.body.singleResult.errors, null, 2))
    const { data, errors } = response.body.singleResult

    assert.strictEqual(errors, undefined)
    assert.ok(data.login.value)
  })

  test('Logging User Failure Case', async () => {

    await server.executeOperation(
      {
        query: CREATE_USER,
        variables: {
          username: 'testuser',
          favoriteGenre: 'sports',
        }
      })


    const response = await server.executeOperation(
      {
        query: LOGIN,
        variables: {
          username: 'testuser',
          password: '12345',
        }
      })
    const { data, errors } = response.body.singleResult
    assert.ok(response.body.singleResult.errors[0].message.includes, 'wrong credentials')
  })

  test('Me Query Case OK', async () => {
    await server.executeOperation({
      query: CREATE_USER,
      variables: {
        username: 'testuser',
        favoriteGenre: 'sports',
      }
    })

    const loginResponse = await server.executeOperation({
      query: LOGIN,
      variables: {
        username: 'testuser',
        password: 'secret',
      }
    })

    const token = loginResponse.body.singleResult.data.login.value

    const decodedToken = jwt.verify(token, 'secret')
    const currentUser = await User.findById(decodedToken.id)

    const response = await server.executeOperation(
      { query: ME },
      { contextValue: { currentUser } }
    )

//    console.log(JSON.stringify(response.body.singleResult, null, 2))
    
    const { data, errors } = response.body.singleResult
    assert.strictEqual(data.me.username, 'testuser')
    assert.strictEqual(data.me.favoriteGenre, 'sports')
    assert.ok(data.me.id)
  })
}) 


describe('Book Test Cases', () =>{
  beforeEach(async () => {
    await Book.deleteMany({})
    await Author.deleteMany({})
    await User.deleteMany({})

    testAuthor = await Author.create({ name: 'Mike Dean' })
    testUser = await User.create({ username: 'testuser', favoriteGenre: 'programming' })})

  const ADD_BOOK = `
    mutation AddBook($title: String!, $published: Int!, $author: String!, $genres: [String!]) {
      addBook(title: $title, published: $published, author: $author, genres: $genres) {
        title
        published
        genres
        author {
          name
        }
      }
    }
  `

  test('a valid book can be created when user is authenticated', async () => {
    const response = await server.executeOperation(
      {
        query: ADD_BOOK,
        variables: {
          title: 'Forest Nature',
          published: 2017,
          author: testAuthor.name,
          genres: ['programming'],
        },
      },
      { contextValue: { currentUser: testUser } }
    )

    const { data, errors } = response.body.singleResult
    assert.strictEqual(data.addBook.title, 'Forest Nature')
    assert.strictEqual(data.addBook.published, 2017)
    assert.deepStrictEqual(data.addBook.genres, ['programming'])

    const booksInDb = await Book.find({})
    assert.strictEqual(booksInDb.length, 1)
  })

  test('Book lenght error case', async () => {
    const response = await server.executeOperation(
      {
        query: ADD_BOOK,
        variables: {
          title: 'abc',
          published: 2017,
          author: testAuthor.name,
          genres: ['programming'],
        },
      },
      { contextValue: { currentUser: testUser } }
    )
    const { data, errors } = response.body.singleResult
    assert.ok(response.body.singleResult.errors[0].message.includes, 'Book validation failed: title:')

    const booksInDb = await Book.find({})
    assert.strictEqual(booksInDb.length, 0)
    })
  
  console.log("View All books Case OK")

  after(async () => {
    await mongoose.connection.close()
    await mongoServer.stop()
  })
})

describe('Author Test Cases', () => {

  console.log("View All Authors Case OK")

  console.log("Edit Author Case OK")

  console.log("Edit Author Case Not OK")
}) 