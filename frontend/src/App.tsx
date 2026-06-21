import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Colonia from '@/pages/Colonia'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/colonia/:id" element={<Colonia />} />
      </Routes>
    </BrowserRouter>
  )
}
