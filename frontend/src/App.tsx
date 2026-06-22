import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Colonia from '@/pages/Colonia'
import Contrato from '@/pages/Contrato'
import Mapa from '@/pages/Mapa'
import AdminLogin from '@/pages/AdminLogin'
import Admin from '@/pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tablero ciudadano — público, sin login */}
        <Route path="/" element={<Home />} />
        <Route path="/colonia/:id" element={<Colonia />} />
        <Route path="/contrato/:id" element={<Contrato />} />
        <Route path="/mapa" element={<Mapa />} />

        {/* Portal de carga — requiere sesión */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
