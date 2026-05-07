import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NodeList from './pages/NodeList'
import NodeEditor from './pages/NodeEditor'
import PricingConfig from './pages/PricingConfig'
import ReviewQueue from './pages/ReviewQueue'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111110] text-[#F0EDE6]">
        <Routes>
          <Route path="/" element={<NodeList />} />
          <Route path="/editor/:slug" element={<NodeEditor />} />
          <Route path="/pricing" element={<PricingConfig />} />
          <Route path="/review" element={<ReviewQueue />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}