
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
  type Query {
    bookCount: Int
    authorCount: Int
    allBooks (author: String genre: String): [Book!]
    allAuthors: [Author!]!
    findBook (title: String!): Book
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
  }
`

module.exports = typeDefs