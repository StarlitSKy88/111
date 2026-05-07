import { useEffect, useState } from 'react'

export default function JsonEditor({ slug, onSave }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/nodes/${slug}`)
      .then(res => res.json())
      .then(result => {
        setData(result.data)
        setLoading(false)
      })
  }, [slug])

  const handleFieldChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/nodes/${slug}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        onSave?.('data')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-[#8A8A85] p-4">加载中...</div>
  }

  if (!data) return null

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs text-[#8A8A85] tracking-wider">DATA.JSON</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1 text-sm bg-[#C0392B] text-white hover:bg-[#A93226] disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-4">
        <div>
          <label className="block text-xs text-[#8A8A85] mb-1">ID</label>
          <input
            type="text"
            value={data.id || ''}
            disabled
            className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#8A8A85] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8A8A85] mb-1">标题</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={e => handleFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8A8A85] mb-1">Slug</label>
          <input
            type="text"
            value={data.slug || ''}
            disabled
            className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#8A8A85] text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-[#8A8A85] mb-1">摘要</label>
          <textarea
            value={data.summary || ''}
            onChange={e => handleFieldChange('summary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8A8A85] mb-1">难度</label>
            <select
              value={data.difficulty || ''}
              onChange={e => handleFieldChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
            >
              <option value="入门">入门</option>
              <option value="基础">基础</option>
              <option value="进阶">进阶</option>
              <option value="高级">高级</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#8A8A85] mb-1">分类</label>
            <input
              type="text"
              value={data.category || ''}
              onChange={e => handleFieldChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8A8A85] mb-1">标准价格</label>
            <input
              type="number"
              value={data.price_standard || ''}
              onChange={e => handleFieldChange('price_standard', Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8A8A85] mb-1">咨询价格</label>
            <input
              type="number"
              value={data.price_consult || ''}
              onChange={e => handleFieldChange('price_consult', Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}