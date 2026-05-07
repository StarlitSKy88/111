import { useEffect, useState } from 'react'

export default function PricingConfig() {
  const [nodes, setNodes] = useState([])
  const [pricing, setPricing] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/nodes')
      .then(res => res.json())
      .then(data => {
        setNodes(data.data || [])
        loadPricing(data.data || [])
      })
  }, [])

  const loadPricing = async (nodeList) => {
    // Load pricing from localStorage or use defaults
    const stored = localStorage.getItem('opc_node_pricing')
    const defaultPricing = {}

    // Initialize with default prices for common services
    nodeList.forEach(node => {
      defaultPricing[node.slug] = [
        { name: '基础咨询', price: 299, active: true },
        { name: '代办服务', price: 599, active: false },
        { name: '陪跑指导', price: 999, active: false }
      ]
    })

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPricing(parsed)
      } catch {
        setPricing(defaultPricing)
      }
    } else {
      setPricing(defaultPricing)
    }
    setLoading(false)
  }

  const handleItemChange = (nodeSlug, index, field, value) => {
    setPricing(prev => {
      const updated = { ...prev }
      if (!updated[nodeSlug]) updated[nodeSlug] = []
      updated[nodeSlug][index] = {
        ...updated[nodeSlug][index],
        [field]: field === 'price' ? Number(value) : value
      }
      return updated
    })
  }

  const handleToggleActive = (nodeSlug, index) => {
    setPricing(prev => {
      const updated = { ...prev }
      updated[nodeSlug][index].active = !updated[nodeSlug][index].active
      return updated
    })
  }

  const addItem = (nodeSlug) => {
    setPricing(prev => {
      const updated = { ...prev }
      if (!updated[nodeSlug]) updated[nodeSlug] = []
      updated[nodeSlug].push({ name: '', price: 0, active: true })
      return updated
    })
  }

  const removeItem = (nodeSlug, index) => {
    setPricing(prev => {
      const updated = { ...prev }
      updated[nodeSlug].splice(index, 1)
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('opc_node_pricing', JSON.stringify(pricing))
      // Also update in API if backend supports
      await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing)
      })
    } finally {
      setSaving(false)
    }
  }

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
        <div>
          <h1 className="text-2xl font-light mb-2">节点收费配置</h1>
          <p className="text-sm text-[#8A8A85]">配置每个节点的收费项目</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#C0392B] text-white hover:bg-[#A93226] disabled:opacity-50 transition-colors"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>

      <div className="space-y-8">
        {nodes.map(node => (
          <div key={node.id} className="border border-[#2A2A28]">
            <div className="bg-[#1A1A18] px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-[#C0392B] text-xs mr-3">
                  {String(node.id).padStart(2, '0')}
                </span>
                <span className="text-[#F0EDE6]">{node.title}</span>
              </div>
              <span className="text-[#8A8A85] text-xs">{node.slug}</span>
            </div>

            <div className="p-6 bg-[#111110]">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#8A8A85] border-b border-[#2A2A28]">
                    <th className="pb-2 w-8">启用</th>
                    <th className="pb-2 w-48">项目名称</th>
                    <th className="pb-2 w-32">价格(元)</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(pricing[node.slug] || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-[#2A2A28]">
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={() => handleToggleActive(node.slug, idx)}
                          className="w-4 h-4 accent-[#C0392B]"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleItemChange(node.slug, idx, 'name', e.target.value)}
                          placeholder="服务名称"
                          className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(node.slug, idx, 'price', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-[#1A1A18] border border-[#2A2A28] text-[#F0EDE6] text-sm focus:border-[#C0392B] outline-none"
                        />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeItem(node.slug, idx)}
                          className="text-[#8A8A85] hover:text-[#ef4444] text-sm"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => addItem(node.slug)}
                className="mt-4 px-4 py-2 text-sm text-[#8A8A85] border border-[#2A2A28] hover:border-[#C0392B] hover:text-[#F0EDE6] transition-colors"
              >
                + 添加收费项目
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}