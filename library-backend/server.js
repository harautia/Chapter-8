const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const User = require('./models/user')

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }
 
  const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
  return User.findById(decodedToken.id)
}

const startServer = (port) => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    })

    startStandaloneServer(server, {
        listen: { port },
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        // console.log('AUTH HEADER:', auth)
        const currentUser = await getUserFromAuthHeader(auth)
        // console.log('CURRENT USER:', currentUser)
        return { currentUser }
      }
    }).then(({ url }) => {
        console.log(`Server ready at ${url}`)
  })
}

process.on('exit', (code) => console.log('Process exiting with code:', code));

module.exports = startServer