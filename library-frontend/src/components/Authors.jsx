import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      authorBookCount
    }
  }`

const Authors = () => {

  const { data, loading, error } = useQuery(ALL_AUTHORS)
  console.log(data)
  if (!data) return null
  if (loading) return <div>loading...</div>
  //if (error) return <div>error: {error.message}</div>

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.authorBookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
