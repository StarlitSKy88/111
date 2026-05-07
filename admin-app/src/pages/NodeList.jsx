import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function NodeList() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/nodes')
      .then(res => res.json())
      .then(data => {
        setNodes(data.data || [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#F0EDE6]">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light tracking-tight">节点列表</h1>
        <div className="flex gap-4">
          <Link
            to="/review"
            className="px-4 py-2 text-sm border border-[#C0392B] text-[#C0392B] hover:bg-[#C0392B] hover:text-white transition-colors"
          >
            内容审批
          </Link>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 text-sm border border-[#2A2A28] text-[#8A8A85] hover:text-[#F0EDE6] hover:border-[#C0392B] transition-colors"
          >
            收费配置
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2A2A28] border border-[#2A2A28]">
        {nodes.map(node => (
          <div
            key={node.id}
            className="bg-[#111110] p-6 cursor-pointer hover:bg-[#1A1A18] transition-colors"
            onClick={() => navigate(`/editor/${node.slug}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[#C0392B] text-xs tracking-widest">
                {String(node.id).padStart(2, '0')}
              </span>
              <span className="text-[#8A8A85] text-xs">{node.difficulty}</span>
            </div>
            <h2 className="text-lg font-light mb-2 text-[#F0EDE6]">{node.title}</h2>
            <p className="text-sm text-[#8A8A85] line-clamp-2">{node.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}