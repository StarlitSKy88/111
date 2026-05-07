# 微信小程序部署

## 需求文档

### 基本信息
- **节点ID**: 35
- **slug**: wechat-miniapp
- **分类**: 1-10
- **难度**: 进阶
- **咨询价格**: ¥499

### 功能需求
1. 理解微信小程序的特点、适用场景、与公众号/H5 的区别
2. 掌握小程序注册、认证、开发的完整流程
3. 学会使用 Taro + React / Vue 等框架开发小程序
4. 掌握小程序发布、审核、迭代的操作规范
5. 了解小程序获取用户授权、拉新促活的常用方法

### 验收标准
- [ ] 完成小程序注册和认证
- [ ] 成功发布第一个可运行的小程序版本
- [ ] 实现小程序与现有网站的数据打通
- [ ] 掌握小程序审核被拒的常见原因和应对方法
- [ ] 建立小程序的持续迭代流程

---

## 当前内容

### 概述

微信小程序是 2026 年中国企业不可忽视的超级入口。月活用户超过 12 亿，无需下载，即用即走，用户获取成本低。对于 OPC 来说，小程序是获取微信流量最直接的方式。

但小程序的开发、审核、上线有一套独特的规则。很多人第一次做小程序，光是注册和认证就折腾了两周。本节点详解：从注册到上线，从开发到运营，让你用最低成本、最快速度把小程序跑起来。

---

### 详细说明

#### 一、为什么 OPC 需要小程序

**1.1 小程序 vs H5 vs APP**

| 维度 | 微信小程序 | H5 网页 | 原生 APP |
|:---|:---|:---|:---|
| 用户获取 | 扫码、分享、搜索 | URL 分享 | 应用商店下载 |
| 用户体验 | 接近原生，流畅 | 依赖网络，较卡顿 | 最流畅 |
| 开发成本 | 中等（框架成熟） | 低 | 高 |
| 维护成本 | 低（自动更新） | 低 | 高（多版本兼容） |
| 数据获取 | 微信生态，数据完整 | 难以追踪 | 可追踪，但成本高 |
| 留存能力 | 中（可添加收藏） | 低（关闭即流失） | 高 |
| 适合场景 | 工具类、电商、内容 | 临时活动、单次使用 | 重度应用、高留存 |

**1.2 小程序适合 OPC 的场景**

| 场景 | 说明 | 适合类型 |
|:---|:---|:---|
| **工具型小程序** | 提供实用工具，如计算器、转换器 | SaaS、工具类产品 |
| **内容型小程序** | 文章/视频/音频内容 | 媒体、教育、知识付费 |
| **电商型小程序** | 商品展示、购买、订单管理 | 零售、选品 |
| **客服型小程序** | 常见问题、在线咨询、预约 | 服务类 OPC |
| **社区型小程序** | 论坛、问答、UGC | 垂直社区 |

**1.3 小程序的流量入口**

| 入口 | 说明 | 获取难度 |
|:---|:---|:---|
| 微信搜索 | 用户搜索小程序名称 | 中（需要 SEO） |
| 扫码 | 二维码扫描 | 低（线下场景） |
| 分享 | 好友/群分享 | 中（需要好内容） |
| 发现-小程序 | 微信发现-小程序 | 中（需要用户主动查找） |
| 公众号菜单 | 绑定到公众号菜单 | 低（已有公众号） |
| 广告投放 | 微信朋友圈/小程序广告 | 高（需要预算） |

---

#### 二、小程序注册与认证

**2.1 注册流程**

```bash
# 微信小程序注册入口
# https://mp.weixin.qq.com/

注册步骤：
1. 点击"注册" → 选择"小程序"
2. 填写邮箱（建议用公司邮箱）
3. 设置密码，验证邮箱
4. 登录后，完善主体信息
5. 完成认证（可选，但推荐）
```

**2.2 主体类型选择**

| 主体类型 | 特点 | 适合场景 | 认证费用 |
|:---|:---|:---|:---|
| **个人** | 权限少，部分功能受限 | 测试、学习 | 免费（有限制） |
| **企业（个体工商户）** | 权限完整 | 小微 OPC | 300 元/年 |
| **企业（有限公司）** | 权限完整 | 正规运营 | 300 元/年 |
| **政府/媒体** | 特殊权限 | 机构 | 免费 |

**建议：** 大多数 OPC 应该用"企业（个体工商户）"或"企业（有限公司）"进行认证，这样可以解锁更多功能。

**2.3 认证需要准备的材料**

| 材料 | 说明 | 注意事项 |
|:---|:---|:---|
| 营业执照 | 企业/个体工商户 | 有效期内，彩色清晰 |
| 法人身份证 | 正反面 | 清晰，无遮挡 |
| 管理员手机 | 真实在用的手机号 | 用来接收验证码 |
| 认证公函 | 微信官方模板 | 盖章，法人签字 |

**2.4 认证流程**

```
1. 登录小程序后台 → 设置 → 基本信息 → 立即认证
2. 选择主体类型（企业/个体工商户）
3. 上传营业执照
4. 填写法人信息
5. 上传认证公函（盖章）
6. 支付认证费用（300 元/年）
7. 等待审核（1-3 个工作日）
8. 认证通过，功能解锁
```

**2.5 认证后的权限**

| 功能 | 未认证 | 已认证 |
|:---|:---|:---|
| 分享到朋友圈 | ❌ | ❌（小程序不允许分享到朋友圈） |
| 附近的小程序 | ❌ | ✅ |
| 微信支付 | 需要单独申请 | 更容易开通 |
| 广告投放 | 受限 | 完整权限 |
| 用户授权获取手机号 | ❌ | ✅ |
| 调用更多 API | 部分受限 | 完整 |

---

#### 三、小程序开发框架选择

**3.1 原生开发 vs 跨平台框架**

| 维度 | 原生开发（微信自定义） | 跨平台框架（Taro/Uni-app） |
|:---|:---|:---|
| 学习成本 | 高（需学微信语法） | 低（React/Vue 基础即可） |
| 开发效率 | 慢 | 快 |
| 代码复用 | 只能小程序 | 可复用 H5/App 端代码 |
| 生态支持 | 微信官方文档 | 社区活跃，插件丰富 |
| 性能 | 最优 | 中等（但对大多数场景足够） |
| 包大小 | 小 | 稍大（但可优化） |

**3.2 Taro + React（推荐）**

Taro 是京东出品的多端开发框架，支持 React 语法，可以编译成微信小程序、H5、React Native 等。

```bash
# Taro 项目初始化
# 安装 Node.js (>= 18) 后执行

npx create-taro@latest my-miniapp
# 选择模板：React
# 选择 CSS 预处理器：Less
# 选择是否使用 TypeScript：建议选是

cd my-miniapp

# 安装依赖
pnpm install

# 启动开发
pnpm dev:weapp  # 微信小程序
pnpm dev:h5     # H5
```

**Taro 项目结构：**

```
my-miniapp/
├── src/
│   ├── pages/           # 页面
│   │   ├── index/       # 首页
│   │   │   ├── index.tsx # 页面逻辑
│   │   │   └── index.config.ts # 页面配置
│   │   └── mine/         # 我的页
│   ├── components/       # 组件
│   ├── store/            # 状态管理
│   ├── api/              # API 请求
│   └── utils/            # 工具函数
├── package.json
└── project.config.json   # 微信项目配置
```

**3.3 Uni-app + Vue（备选）**

Uni-app 是 DCloud 出品的跨平台框架，支持 Vue 语法，对 Vue 开发者友好。

```bash
# Uni-app 项目初始化
npx degit dcloudio/uni-preset-vue#vue-ts my-uniapp
cd my-uniapp
pnpm install
pnpm dev:mp-weixin  # 微信小程序
```

**3.4 框架选择建议**

| 场景 | 推荐框架 |
|:---|:---|
| 有 React 基础 | Taro |
| 有 Vue 基础 | Uni-app |
| 已有 Web 项目要迁移 | Taro 或 Uni-app（看原技术栈） |
| 完全从零开始 | Taro（社区更活跃） |
| 需要高性能 | 原生开发 |

---

#### 四、小程序开发实战

**4.1 第一个页面：首页**

```tsx
// src/pages/index/index.tsx
import { useState, useEffect } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import './index.config.ts'

export default function Index() {
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    // 页面加载时检查登录状态
    const app = getApp()
    if (app.globalData.userInfo) {
      setUserInfo(app.globalData.userInfo)
    }
  }, [])

  const handleLogin = () => {
    // 获取用户信息
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        setUserInfo(res.userInfo)
        const app = getApp()
        app.globalData.userInfo = res.userInfo
        wx.showToast({ title: '登录成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '请允许授权', icon: 'none' })
      }
    })
  }

  return (
    <View className='index'>
      {/* 顶部 Banner */}
      <View className='banner'>
        <Image 
          src='https://example.com/banner.jpg' 
          mode='aspectFill'
          className='banner-img'
        />
      </View>

      {/* 用户信息 */}
      <View className='user-section'>
        {userInfo ? (
          <View className='user-info'>
            <Image src={userInfo.avatarUrl} className='avatar' />
            <Text className='nickname'>{userInfo.nickName}</Text>
          </View>
        ) : (
          <Button onClick={handleLogin} type='primary'>
            登录/注册
          </Button>
        )}
      </View>

      {/* 功能入口 */}
      <View className='menu-grid'>
        <View className='menu-item'>
          <Text className='menu-icon'>📦</Text>
          <Text className='menu-text'>我的订单</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-icon'>💼</Text>
          <Text className='menu-text'>咨询服务</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-icon'>📚</Text>
          <Text className='menu-text'>学习中心</Text>
        </View>
        <View className='menu-item'>
          <Text className='menu-icon'>⚙️</Text>
          <Text className='menu-text'>设置</Text>
        </View>
      </View>
    </View>
  )
}
```

**4.2 页面配置**

```ts
// src/pages/index/index.config.ts
export default definePageConfig({
  navigationBarTitleText: '首页',
  enablePullDownRefresh: true,  // 开启下拉刷新
  backgroundTextStyle: 'dark',
})
```

**4.3 全局样式**

```less
// src/app.less
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 通用样式类
.container {
  padding: 24rpx;
}

.btn-primary {
  background-color: #07c160;
  color: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
  text-align: center;
  
  &:active {
    background-color: #059b46;
  }
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
```

**4.4 API 请求封装**

```ts
// src/api/request.ts
import Taro from '@tarojs/taro'

const BASE_URL = 'https://api.your-site.com'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  const token = Taro.getStorageSync('token')
  
  return Taro.request({
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.header,
    },
  }).then((res) => {
    if (res.statusCode === 200) {
      return res.data
    } else if (res.statusCode === 401) {
      // token 过期，跳转登录
      Taro.removeStorageSync('token')
      Taro.navigateTo({ url: '/pages/login/index' })
      return Promise.reject(new Error('未登录'))
    } else {
      Taro.showToast({ title: res.data?.message || '请求失败', icon: 'none' })
      return Promise.reject(res.data)
    }
  })
}

// API 方法封装
export const api = {
  getUserInfo: () => request({ url: '/api/user/info' }),
  login: (code: string) => request({ url: '/api/auth/login', method: 'POST', data: { code } }),
  getProducts: () => request({ url: '/api/products' }),
}
```

**4.5 全局状态管理（Pinia）**

```ts
// src/store/user.ts
import { defineStore } from 'pinia'
import { api } from '../api/request'

interface UserState {
  info: any | null
  token: string | null
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    info: null,
    token: null,
    isLoggedIn: false,
  }),
  
  actions: {
    async login(code: string) {
      try {
        const res = await api.login(code)
        this.token = res.token
        this.info = res.userInfo
        this.isLoggedIn = true
        Taro.setStorageSync('token', res.token)
        return res
      } catch (err) {
        console.error('登录失败', err)
        throw err
      }
    },
    
    async fetchUserInfo() {
      if (!this.token) return
      try {
        const res = await api.getUserInfo()
        this.info = res
      } catch (err) {
        console.error('获取用户信息失败', err)
      }
    },
    
    logout() {
      this.token = null
      this.info = null
      this.isLoggedIn = false
      Taro.removeStorageSync('token')
    },
  },
})
```

---

#### 五、小程序发布与审核

**5.1 开发环境配置**

```bash
# 安装微信开发者工具
# 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

# 在微信开发者工具中：
1. 登录（微信扫码）
2. 导入项目（选择 my-miniapp 目录）
3. AppID 填写小程序 AppID（在 mp.weixin.qq.com 后台可以看到）
4. 确定，编译
```

**5.2 体验版与真机测试**

```
微信开发者工具操作：
1. 点击"编译" → 在模拟器中预览
2. 点击"预览" → 扫码在手机预览（需要登录的小程序管理员权限）
3. 点击"上传" → 上传代码到微信后台（体验版）

手机端测试：
1. 小程序管理员/开发者微信扫码
2. 可以看到体验版小程序
3. 体验版可以分享给测试人员
```

**5.3 提交审核流程**

```bash
# 在微信开发者工具中上传代码后：

1. 登录 mp.weixin.qq.com
2. 进入"版本管理"
3. 找到刚上传的版本
4. 点击"提交审核"

审核前准备：
- 确保所有功能可用
- 准备审核账号（需要至少 1 个可登录的测试账号）
- 填写版本说明（简单描述新版本内容）

审核信息填写：
- 功能列表：描述小程序的核心功能
- 测试账号：提供测试账号和密码
- 备注：如有特殊说明，填写在此
```

**5.4 审核被拒的常见原因**

| 原因 | 说明 | 解决方法 |
|:---|:---|:---|
| **功能不完整** | 页面打不开、按钮点击无反应 | 上线前完整测试 |
| **虚拟支付** | 涉及游戏充值、虚拟货币 | 改为实物或真实服务 |
| **诱导分享** | 强制用户分享才能使用 | 删除诱导文案 |
| **侵犯隐私** | 未说明收集用户信息用途 | 添加隐私政策页面 |
| **赌博/彩票** | 任何赌博相关功能 | 删除相关内容 |
| **医疗/金融无资质** | 涉及医疗建议、金融交易 | 需要对应资质或删除功能 |
| **内容违规** | 政治、色情、暴力内容 | 删除违规内容 |
| **ICO/区块链** | 涉及代币发行 | 删除相关内容 |

**5.5 审核加速技巧**

| 技巧 | 说明 |
|:---|:---|
| **完整描述功能** | 在审核信息中详细描述功能 |
| **提供测试账号** | 账号要有完整的功能访问权限 |
| **截图/视频辅助** | 提前录制功能演示视频（微信后台可上传） |
| **避开高峰期** | 周一、周五审核较慢，周中提交较快 |
| **紧急审核** | 有重要版本可申请紧急审核（需充分理由） |

**5.6 发布后的版本管理**

```
发布后管理：
- 监控用户反馈（后台有用户反馈入口）
- 定期检查后台数据（访问量、留存、转化）
- 及时处理用户问题
- 持续迭代优化

版本回退：
- 如果新版有问题，可以在后台选择"回退"
- 但回退后需要重新审核才能再次发布
```

---

#### 六、小程序运营与增长

**6.1 获取用户授权的正确姿势**

```tsx
// 获取用户手机号（企业小程序）
Button type='primary' open-type='getPhoneNumber' onGetPhoneNumber={handleGetPhoneNumber}

// 处理回调
const handleGetPhoneNumber = (e: any) => {
  if (e.detail.code) {
    // 把 code 发到服务器，换取手机号
    request({ url: '/api/bindPhone', data: { code: e.detail.code } })
  }
}

// 获取用户信息（头像、昵称）
Button type='default' open-type='getUserProfile' onGetUserProfile={handleGetProfile}

const handleGetProfile = (e: any) => {
  if (e.detail.userInfo) {
    // 更新用户信息
    setUserInfo(e.detail.userInfo)
  }
}
```

**6.2 用户增长策略**

| 策略 | 操作 | 效果 |
|:---|:---|:---|
| **线下二维码** | 在门店、物料上放置小程序码 | 精准用户 |
| **公众号绑定** | 在公众号菜单/文章中插入小程序 | 已有粉丝转化 |
| **分享裂变** | 设计分享有礼活动 | 病毒式传播 |
| **搜索优化** | 优化小程序名称和描述 | 被动获取 |
| **广告投放** | 朋友圈广告、小程序广告 | 付费获客 |
| **内容营销** | 在小红书/抖音推广 | 品牌曝光 |

**6.3 留存提升方法**

| 方法 | 说明 |
|:---|:---|
| **收藏功能** | 引导用户收藏小程序（下次访问更方便） |
| **消息订阅** | 用户授权后，可推送消息（但要注意频率） |
| **积分体系** | 用户行为换积分，积分换权益 |
| **定期更新** | 持续更新内容，保持用户新鲜感 |
| **客服入口** | 明显的客服入口，快速响应 |

---

#### 七、小程序与现有系统集成

**7.1 与网站共用 API**

```tsx
// 小程序调用和网站同一套后端 API
const BASE_URL = 'https://api.your-site.com'  // 与网站共用

// 小程序登录态用 wx.login() 获取 code
wx.login({
  success: async (res) => {
    // 把 code 发给后端，换取 token
    const result = await request({
      url: '/api/auth/mini-login',
      method: 'POST',
      data: { code: res.code }
    })
    // 保存 token，后续请求带上
    Taro.setStorageSync('token', result.token)
  }
})
```

**7.2 数据同步注意事项**

| 问题 | 解决方案 |
|:---|:---|
| Session 不共享 | 使用各自的登录体系，但可绑定同一用户 |
| Cookie 不支持 | 使用 Token 方式验证 |
| 跨域限制 | 后端配置 CORS 白名单 |
| 用户标识 | 小程序有 openid，网站有 unionid，可绑定 |

**7.3 微信支付接入**

```tsx
// 小程序调起微信支付
async function createPayment(orderId: string) {
  // 1. 向后端请求支付参数
  const res = await request({
    url: '/api/payment/create',
    method: 'POST',
    data: { orderId }
  })
  
  // 2. 调起微信支付
  wx.requestPayment({
    timeStamp: res.timeStamp,
    nonceStr: res.nonceStr,
    package: res.package,
    signType: 'MD5',
    paySign: res.paySign,
    success: () => {
      wx.showToast({ title: '支付成功', icon: 'success' })
      // 更新订单状态
    },
    fail: (err) => {
      wx.showToast({ title: '支付取消', icon: 'none' })
    }
  })
}
```

---

### 常见问题

**Q1: 小程序需要多少钱才能做出来？**

A: 看情况：
- 模板小程序：几百到几千（功能固定，无法定制）
- 标准化 SaaS：每月 99-999 元（按功能收费）
- 定制开发：1 万到 10 万+（完整定制，按需开发）
- 自己开发（Taro + React）：主要是时间成本，技术栈OK的话 0 元

**Q2: 小程序审核需要多长时间？**

A: 一般 1-3 个工作日。如果被拒，需要修改后重新提交。紧急情况可申请加速，但需要充分理由。

**Q3: 小程序和公众号有什么区别？**

A: 主要区别：
- 公众号：内容发布为主，用户关注后推送消息
- 小程序：功能服务为主，不需要关注，即用即走
- 可以绑定：让公众号菜单跳转到小程序，互相导流

**Q4: 个人小程序有哪些限制？**

A: 个人主体小程序限制：
- 营销功能受限（无法抽奖、优惠券等）
- 支付功能受限（需要商户号，个人很难申请）
- 部分类目无法选择（如教育、医疗、金融）
- 建议：做功能型、工具型小程序可以个人主体；做交易型需要企业主体

**Q5: 小程序能否跳转到 H5 或外部链接？**

A: 可以，但有条件：
- 微信内长按识别二维码可以跳转（但体验一般）
- 客服消息可以发外部链接
- 不能在页面内直接打开外部 URL（这是微信的政策）

**Q6: 小程序的数据在哪看？**

A: 在 mp.weixin.qq.com 后台：
- 访问量、页面访问量
- 用户画像（性别、地区、机型）
- 留存分析
- 转化漏斗
也可以接入 GrowingIO、神策等第三方数据分析工具。

**Q7: 小程序需要 SSL 证书吗？**

A: 必须的。小程序要求所有网络请求必须通过 HTTPS。需要在服务器上配置 SSL 证书（可以用 Let's Encrypt 免费证书，或购买商业证书）。

**Q8: 一个小程序可以绑定多个主体吗？**

A: 可以。一个小程序可以关联多个公众号和企业微信，但主体只能是一个（注册时的主体）。

---

### 相关资源

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/) — 开发文档、API 文档
- [微信开发者工具下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) — 开发工具
- [Taro 官方文档](https://taro-docs.jd.com/) — 多端开发框架
- [Uni-app 官方文档](https://uniapp.dcloud.net.cn/) — 跨平台开发框架
- [OPC节点百科·完整地图](index.html)
- [GStack需求梳理方法论](https://gstack.cn)
- [一人公司创业模型白皮书2026](docs/opc-whitepaper-2026.pdf)

---

*本文档由 OPC节点百科 AI内容引擎 生成*
*版本: v1.0*
*最后更新: 2026-05-07*
*AI模型: deepseek-v4-pro*
*审核状态: 待人工审核*