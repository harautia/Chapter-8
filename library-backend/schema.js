
const typeDefs = /* GraphQL */ `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]
    id: ID!
  }
  type Author {
    name: String!
    born: Int
    id: ID!
    authorBookCount: Int
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int
    authorCount: Int
    allBooks (author: String genre: String): [Book!]
    allAuthors: [Author!]!
    findBook (title: String!): Book
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]
      ): Book!

    editAuthor(
      name: String!
      setBornTo: Int    
      ): Author

    createUser(
      username: String!
      favoriteGenre: String!
      ): User

    login(
      username: String!
      password: String!
      ): Token
    _resetDatabase: Boolean
  }
`

module.exports = typeDefs