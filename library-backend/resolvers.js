const { GraphQLError } = require('graphql')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const jwt = require('jsonwebtoken')


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

      const bookExists = await Book.exists({ title: args.title })

      if (bookExists) {
        throw new GraphQLError(`Name must be unique: ${args.title}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
          },
        })
      }

      return book.save();
    },
  createUser: async (root, args) => {
    const user = new User({ username: args.username })

    return user.save()
      .catch(error => {
        throw new GraphQLError(`Creating the user failed: ${error.message}`, {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      })
  },
  login: async (root, args) => {
    const user = await User.findOne({ username: args.username })

    if ( !user || args.password !== 'secret' ) {
      throw new GraphQLError('wrong credentials', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      })        
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    }

    return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
  },
  }
}

module.exports = resolvers






/*
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
