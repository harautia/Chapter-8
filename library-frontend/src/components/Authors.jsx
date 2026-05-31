import { useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMutation } from '@apollo/client/react'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      id
      name
      born
      authorBookCount
    }
  }`

const ADD_AUTHOR_AGE = gql`
  mutation addAuthorAge(
  $name: String!
  $setBornTo: Int!
){
  editAuthor(name: $name, setBornTo: $setBornTo){
    name
    born
  }
}
`

const AgeForm = ({authors}) => {

  console.log("Ageformin sisällä oleva data:", authors)
  const [born, setBorn] = useState('')
  const [name, setAuthor] = useState('')

  const [addAuthorAge] = useMutation(ADD_AUTHOR_AGE, {
    refetchQueries: [{ query: ALL_AUTHORS}]
  })

  const submit = async (event) => {
    event.preventDefault()
    console.log('Define Author Age')
    console.log(name)
    console.log(born)
    addAuthorAge({ variables: {name, setBornTo: parseInt(born)}})
    setBorn('')
    setAuthor('')
  }

  return(
    <div>
      <h2>Set Birthyear</h2>
        <form onSubmit={submit}>
        <div>
          <label>
          Author
          <select          
            value={name}
            onChange={({target}) => setAuthor(target.value)}
          >
            <option value="">-- No author --</option>
            {authors.allAuthors.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>))}
          </select>
          </label>
        </div>
        <div>
          Born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">Set Author Born Year</button>
      </form>
    </div>
  )
} 


const Authors = () => {

  const { data, loading, error } = useQuery(ALL_AUTHORS)
  console.log("Authorin sisällä oleva data: ", data)
  if (!data) return null
  if (loading) return <div>loading...</div>
  //if (error) return <div>error: {error.message}</div>

  
  return (
    <div>
      <h2>Authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.authorBookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <AgeForm authors={data}/>
    </div>
  )
}

export default Authors