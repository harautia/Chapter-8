
const { GraphQLError } = require('graphql')
const Book = require('./models/book')
const Author = require('./models/author')


/*
let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      if (!args.author && !args.genre) return books
      if (args.author && !args.genre)
        return books.filter(book => book.author === args.author)
      if (args.genre && !args.author)
        return books.filter(book => book.genres.includes(args.genre))
      else
        return books.filter(book => book.author === args.author && book.genres.includes(args.genre))
    }, 
    allAuthors: () => authors,
    findBook: (root, args) => books.find(book => book.title === args.title )
  },
  // This is needed to define authorBookCount data in type Author! Since it is not default there
  Author: {
    authorBookCount: (root) => {
      return books.filter(b => b.author === root.name).length
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      const author = {name: args.author, id:uuid()}
      console.log(author)
      books = books.concat(book)
      authors = authors.concat(author) 
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.find(p => p.name === args.name)
      if (!author) return null
      console.log(args)
      const updatedAuthor = { ...author, born: args.setBornTo }
      console.log(updatedAuthor)
      authors = authors.map(p => p.name === args.name ? updatedAuthor : p)
      return updatedAuthor
    }
  }
}
*/

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      return Book.find()
    }, 
    allAuthors: async (root, args) => {
      return Author.find()
    }
  },
  Mutation: {

    /* AI Info
    Excercise 13. This wasn't any more working after refactoring:

    addBook: (root, args) => {
      const book = new Book({ ...args })
      console.log(args)
      return book.save()
    }

    The error seen on backend:

      add book to MongoDB: {
        "errors": [
      {
      "message": "Book validation failed: author: Cast to ObjectId failed for value \"Reijo Mäki\" (type string) at path \"author\"",
      "locations": [
      {
      "line": 2,
      "column": 3
      }
      ],
      "path": [
      "addBook"
      ],
      "extensions": {
      "code": "INTERNAL_SERVER_ERROR",
      "stacktrace": [
      "ValidationError: Book validation failed: author: Cast to ObjectId failed for value \"Reijo Mäki\" (type string) at path \"author\"",

    The fix: look up (or create) the author by name first, then pass their _id to the Book instead of the raw name string.

    Before the change, the schema said author is a String — so returning "Reijo Mäki" directly satisfied the type. After the change, GraphQL expects a full Author object with name, born, id fields.
    When you introduced Mongoose, your Book schema defined author as an ObjectId reference:
    Unlike a plain JS array, Mongoose validates that the value is actually an ObjectId — so passing a plain string like "Reijo Mäki" throws the cast error you saw.
    In short: the in-memory version was loosely typed all the way through. MongoDB + the updated GraphQL schema both enforce that author is a real referenced object, not just a name string.
    */

    addBook: async (root, args) => {
      console.log(args)
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id,
      });

      return book.save();
    }
  }
}

module.exports = resolvers


