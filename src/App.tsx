import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Charts from './pages/Charts'
import TablePage from './pages/TablePage'
import ProblemBank from './pages/ProblemBank'
import ProblemSolve from './pages/ProblemSolve'
import WeeklyTests from './pages/WeeklyTests'
import WeeklyTestSignup from './pages/WeeklyTestSignup'
import Forum from './pages/Forum'

function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/table" element={<TablePage />} />
        <Route path="/problems" element={<ProblemBank />} />
        <Route path="/problems/:id" element={<ProblemSolve />} />
        <Route path="/weekly-tests" element={<WeeklyTests />} />
        <Route path="/weekly-tests/:id/signup" element={<WeeklyTestSignup />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </div>
  )
}

export default App
