
import './App.css'
import { BrowserRouter as Router, Routes,Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';

function App() {
 
  const routes = (
    <Router>
      <Routes>
        <Route path='/dashboard' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='*' element={<Login/>} /> 


      </Routes>
    </Router>
  );

  return (
    <div>
      {routes}
    </div>
   
    
  )
}

export default App
