import { useEffect, useState } from 'react'

export default function NodeSelector({ currentSlug, onSelect }) {
  const [nodes, setNodes] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetch('/api/nodes')
      .then(res => res.json())
      .then(data => setNodes(data.data || []))
  }, [])

  const currentNode = nodes.find(n => n.slug === currentSlug)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm hover:border-[#C0392B] transition-colors"
      >
        <span className="text-[#C0392B]">{currentNode ? String(currentNode.id).padStart(2, '0') : '--'}</span>
        <span>{currentNode?.title || '选择节点'}</span>
        <span className="text-[#8A8A85]">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 max-h-96 overflow-y-auto bg-[#1A1A18] border border-[#2A2A28] z-50">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => {
                onSelect(node.slug)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2A2A28] flex gap-3 ${
                node.slug === currentSlug ? 'text-[#C0392B]' : 'text-[#F0EDE6]'
              }`}
            >
              <span className="text-[#8A8A85] w-6">{String(node.id).padStart(2, '0')}</span>
              <span className="flex-1 truncate">{node.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}