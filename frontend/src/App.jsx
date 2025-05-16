import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './views/Login.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Puedes añadir más rutas aquí si quieres */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
