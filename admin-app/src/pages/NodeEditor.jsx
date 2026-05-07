import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NodeSelector from '../components/NodeSelector'
import JsonEditor from '../components/JsonEditor'
import MarkdownEditor from '../components/MarkdownEditor'

export default function NodeEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('md')

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A28]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#8A8A85] hover:text-[#F0EDE6] transition-colors"
          >
            ← 返回
          </button>
          <NodeSelector currentSlug={slug} onSelect={(s) => navigate(`/editor/${s}`)} />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[#2A2A28]">
        <button
          onClick={() => setActiveTab('md')}
          className={`px-6 py-3 text-sm transition-colors ${
            activeTab === 'md'
              ? 'text-[#C0392B] border-b-2 border-[#C0392B]'
              : 'text-[#8A8A85] hover:text-[#F0EDE6]'
          }`}
        >
          节点内容
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-6 py-3 text-sm transition-colors ${
            activeTab === 'data'
              ? 'text-[#C0392B] border-b-2 border-[#C0392B]'
              : 'text-[#8A8A85] hover:text-[#F0EDE6]'
          }`}
        >
          节点数据
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'md' ? (
          <MarkdownEditor slug={slug} onSave={() => {}} />
        ) : (
          <JsonEditor slug={slug} onSave={() => {}} />
        )}
      </div>
    </div>
  )
}