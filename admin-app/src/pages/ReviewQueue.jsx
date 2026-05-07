import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// 内容块组件 - 审批单个块
function ContentBlock({ block, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-[#2A2A28]">
      <div
        className="flex items-center justify-between px-4 py-3 bg-[#1A1A18] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[#C0392B] text-xs font-mono">{block.id}</span>
          <span className="text-[#F0EDE6] text-sm">{block.title}</span>
          <span className={`text-xs px-2 py-0.5 ${
            block.status === 'approved' ? 'bg-green-900 text-green-300' :
            block.status === 'rejected' ? 'bg-red-900 text-red-300' :
            'bg-[#2A2A28] text-[#8A8A85]'
          }`}>
            {block.status === 'approved' ? '已通过' :
             block.status === 'rejected' ? '已拒绝' : '待审核'}
          </span>
        </div>
        <span className="text-[#8A8A85] text-xs">{expanded ? '收起' : '展开'}</span>
      </div>

      {expanded && (
        <div className="p-4">
          <div className="text-[#8A8A85] text-xs mb-2">
            字数：{block.content?.length || 0}
          </div>
          <div className="bg-[#0D0D0C] p-4 text-[#F0EDE6] text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {block.content || '无内容'}
          </div>
          {block.status === 'pending' && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onApprove(block.id)}
                className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white text-sm"
              >
                通过
              </button>
              <button
                onClick={() => onReject(block.id)}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm"
              >
                拒绝
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 节点审批卡片
function NodeReviewCard({ node, blocks, onBlockApprove, onBlockReject, onPublish }) {
  const [expanded, setExpanded] = useState(false)
  const approvedCount = blocks.filter(b => b.status === 'approved').length
  const allApproved = approvedCount === blocks.length && blocks.length > 0

  return (
    <div className="border border-[#2A2A28]">
      <div
        className="flex items-center justify-between px-6 py-4 bg-[#1A1A18] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <span className="text-[#C0392B] text-xs">
            {String(node.id).padStart(2, '0')}
          </span>
          <span className="text-[#F0EDE6]">{node.title}</span>
          <span className="text-[#8A8A85] text-xs">{node.slug}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8A8A85] text-xs">
            {approvedCount}/{blocks.length} 块已通过
          </span>
          {allApproved && (
            <span className="text-green-400 text-xs px-2 py-0.5 bg-green-900">可发布</span>
          )}
          <span className="text-[#8A8A85] text-xs">{expanded ? '收起' : '展开'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-6 bg-[#111110]">
          <div className="space-y-4">
            {blocks.map(block => (
              <ContentBlock
                key={block.id}
                block={block}
                onApprove={onBlockApprove}
                onReject={onBlockReject}
              />
            ))}
          </div>

          {allApproved && (
            <div className="mt-6 pt-6 border-t border-[#2A2A28]">
              <button
                onClick={onPublish}
                className="px-6 py-3 bg-[#C0392B] hover:bg-[#A93226] text-white text-sm font-medium"
              >
                发布到节点
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReviewQueue() {
  const [nodes, setNodes] = useState([])
  const [reviews, setReviews] = useState({}) // { slug: { node, blocks, status } }
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 获取所有节点
      const nodesRes = await fetch('/api/nodes')
      const nodesData = await nodesRes.json()
      const nodeList = nodesData.data || []

      // 获取每个节点的待审内容
      const reviewsData = {}
      for (const node of nodeList) {
        try {
          // 尝试获取 pending_reviews 下的内容
          const reviewRes = await fetch(`/pending_reviews/${node.slug}/metadata.json`)
          if (reviewRes.ok) {
            const metadata = await reviewRes.json()
            reviewsData[node.slug] = {
              node,
              blocks: metadata.blocks || [],
              status: 'pending'
            }
          }
        } catch (e) {
          // 没有待审内容
        }
      }

      setNodes(nodeList)
      setReviews(reviewsData)
    } catch (e) {
      console.error('Load review data error:', e)
    }
    setLoading(false)
  }

  const handleBlockApprove = (slug, blockId) => {
    setReviews(prev => {
      const updated = { ...prev }
      if (updated[slug]) {
        updated[slug] = {
          ...updated[slug],
          blocks: updated[slug].blocks.map(b =>
            b.id === blockId ? { ...b, status: 'approved' } : b
          )
        }
      }
      return updated
    })
  }

  const handleBlockReject = (slug, blockId) => {
    setReviews(prev => {
      const updated = { ...prev }
      if (updated[slug]) {
        updated[slug] = {
          ...updated[slug],
          blocks: updated[slug].blocks.map(b =>
            b.id === blockId ? { ...b, status: 'rejected' } : b
          )
        }
      }
      return updated
    })
  }

  const handlePublish = async (slug) => {
    setPublishing(slug)
    try {
      const review = reviews[slug]
      if (!review) return

      // 构建完整的 index.md 内容
      const fullContent = buildFullContent(review.node, review.blocks)

      // 更新节点 index.md
      const res = await fetch(`/api/nodes/${slug}/index-md`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent })
      })

      if (res.ok) {
        alert('发布成功！')
        // 从列表移除已发布的
        setReviews(prev => {
          const updated = { ...prev }
          delete updated[slug]
          return updated
        })
      } else {
        alert('发布失败')
      }
    } catch (e) {
      console.error('Publish error:', e)
      alert('发布失败: ' + e.message)
    }
    setPublishing(null)
  }

  // 构建完整的 index.md 内容
  const buildFullContent = (node, blocks) => {
    const getBlock = (id) => blocks.find(b => b.id === id)

    return `# ${node.title}

## 需求文档

### 基本信息
- **节点ID**: ${String(node.id).padStart(2, '0')}
- **slug**: ${node.slug}
- **分类**: ${node.category || '待填写'}
- **难度**: ${node.difficulty || '待填写'}
- **咨询价格**: ¥${node.price || '待填写'}

### 功能需求
1. [待填写 - 根据节点内容生成]

### 验收标准
- [ ] 标准1
- [ ] 标准2

---

## 当前内容

### 概述

${getBlock('B1')?.content || ''}

### 详细说明

#### 一、${getBlock('B2')?.content || ''}

#### 二、${getBlock('B3')?.content || ''}

#### 三、${getBlock('B4')?.content || ''}

#### 四、${getBlock('B5')?.content || ''}

#### 五、${getBlock('B6')?.content || ''}

### 常见问题

**Q1:** ${getBlock('B7')?.content?.split('\n')[0] || '待填写'}

**Q2:** ${getBlock('B7')?.content?.split('\n')[2] || '待填写'}

**Q3:** ${getBlock('B7')?.content?.split('\n')[4] || '待填写'}

**Q4:** ${getBlock('B7')?.content?.split('\n')[6] || '待填写'}

**Q5:** ${getBlock('B8')?.content?.split('\n')[0] || '待填写'}

**Q6:** ${getBlock('B8')?.content?.split('\n')[2] || '待填写'}

**Q7:** ${getBlock('B8')?.content?.split('\n')[4] || '待填写'}

**Q8:** ${getBlock('B8')?.content?.split('\n')[6] || '待填写'}

### 相关资源

${getBlock('B9')?.content || ''}

---

*本文档由 OPC节点百科 AI内容引擎 生成*
*版本: v1.0*
*最后更新: ${new Date().toISOString()}*
*AI模型: deepseek-v4-pro*
*审核状态: 已审核发布*
`
  }

  const pendingNodes = Object.values(reviews).filter(r => r.blocks.length > 0)
  const publishedCount = nodes.length - pendingNodes.length

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
          <h1 className="text-2xl font-light mb-2">内容审批队列</h1>
          <p className="text-sm text-[#8A8A85]">
            待审核：{pendingNodes.length} 个节点 | 已发布：{publishedCount} 个节点
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/"
            className="px-4 py-2 text-sm text-[#8A8A85] border border-[#2A2A28] hover:border-[#F0EDE6] hover:text-[#F0EDE6]"
          >
            返回节点列表
          </Link>
          <Link
            to="/pricing"
            className="px-4 py-2 text-sm text-[#8A8A85] border border-[#2A2A28] hover:border-[#F0EDE6] hover:text-[#F0EDE6]"
          >
            定价配置
          </Link>
        </div>
      </div>

      {pendingNodes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-[#8A8A85] text-lg mb-4">暂无待审核内容</div>
          <p className="text-[#8A8A85] text-sm">
            运行 AI 内容生成器后，待审内容会出现在这里
          </p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 text-sm text-[#8A8A85] border border-[#2A2A28] hover:border-[#F0EDE6] hover:text-[#F0EDE6]"
          >
            刷新
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {pendingNodes.map(({ node, blocks }) => (
            <NodeReviewCard
              key={node.slug}
              node={node}
              blocks={blocks}
              onBlockApprove={(blockId) => handleBlockApprove(node.slug, blockId)}
              onBlockReject={(blockId) => handleBlockReject(node.slug, blockId)}
              onPublish={() => handlePublish(node.slug)}
            />
          ))}
        </div>
      )}

      {publishing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-[#F0EDE6]">发布中...</div>
        </div>
      )}
    </div>
  )
}
