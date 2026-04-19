import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

import {
  BrowserRouter as Router,
  Routes, Route, Link
} from 'react-router-dom'

const App = () => {
  const [page, setPage] = useState('authors')

  const padding = {
    padding: 5
  }

  return (
    <Router>
      <div>
        <Link style={padding} to="/">authors</Link>
        <Link style={padding} to="/books">books</Link>
        <Link style={padding} to="/add">add book</Link>
      </div>
      <Routes>
        <Route path="/books" element={<Books/>}/>
        <Route path="/add" element={<NewBook/>}/>
        <Route path="/" element={<Authors/>}/>
      </Routes>
    </Router>
  )
}

export default App