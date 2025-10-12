import { BrowserRouter as Router } from 'react-router-dom';
import Landing from './pages/Landing';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';


export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </div>
    </Router>
  );
}