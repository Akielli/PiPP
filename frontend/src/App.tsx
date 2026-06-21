import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Colonia from '@/pages/Colonia'
import Contrato from '@/pages/Contrato'
import Mapa from '@/pages/Mapa'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/colonia/:id" element={<Colonia />} />
        <Route path="/contrato/:id" element={<Contrato />} />
        <Route path="/mapa" element={<Mapa />} />
      </Routes>
    </BrowserRouter>
  )
}
