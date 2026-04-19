import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const ALL_BOOKS = gql`
  query {
    allBooks {
      id
      author
      title
      published
    }
  }`

const Books = () => {

  const { data, loading, error } = useQuery(ALL_BOOKS)
  console.log(data)
  if (!data) return null
  if (loading) return <div>loading...</div>
  //if (error) return <div>error: {error.message}</div>

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
