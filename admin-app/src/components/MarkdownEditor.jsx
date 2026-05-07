import { useEffect, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'

export default function MarkdownEditor({ slug, onSave }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/nodes/${slug}/index-md`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '')
        setLoading(false)
      })
  }, [slug])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/nodes/${slug}/index-md`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (res.ok) {
        onSave?.('index-md')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-[#8A8A85] p-4">加载中...</div>
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-[#8A8A85] tracking-wider">INDEX.MD</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1 text-sm bg-[#C0392B] text-white hover:bg-[#A93226] disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
      <div className="flex-1 overflow-auto" data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={setContent}
          height="100%"
          preview="edit"
          style={{
            backgroundColor: '#1A1A18',
            border: '1px solid #2A2A28'
          }}
        />
      </div>
    </div>
  )
}