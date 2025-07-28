# ai-editor
WeChat AI Editor 是一款集成AI智能排版、多样式模板、实时预览的全栈公众号文章排版工具，支持自动化排版、样式优化、SEO增强等功能。

# 公众号AI自动化排版工具 - 快速开始指南

## 🚀 项目概述

这是一个基于AI的全栈公众号文章自动化排版工具，具备以下核心功能：

- **🤖 AI智能排版**: 自动优化文章结构和样式
- **📝 智能标题生成**: 根据内容生成吸引人的标题
- **🎨 丰富模板库**: 50+专业排版模板
- **📊 文章质量分析**: AI分析文章并提供改进建议
- **🔍 SEO优化**: 自动生成SEO友好的标题和描述
- **📱 实时预览**: 所见即所得的编辑体验

## 📦 快速部署

### 方式一：Docker 一键部署（推荐）

1. **克隆项目**
```bash
git clone https://github.com/your-username/wechat-ai-editor.git
cd wechat-ai-editor
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

3. **一键部署**
```bash
# 赋予脚本执行权限
chmod +x scripts/deploy.sh

# 执行部署
./scripts/deploy.sh
```

4. **访问应用**
- 应用地址: http://localhost
- 监控面板: http://localhost:3000 (账号: admin, 密码: admin123)

### 方式二：本地开发部署

1. **安装依赖**
```bash
# 安装根依赖
npm install

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install
```

2. **启动数据库服务**
```bash
# 启动 PostgreSQL 和 Redis
docker-compose up -d postgres redis
```

3. **运行数据库迁移**
```bash
cd backend
npm run migrate
npm run seed  # 初始化示例数据
```

4. **启动开发服务**
```bash
# 启动后端 (终端1)
cd backend && npm run dev

# 启动前端 (终端2)  
cd frontend && npm run dev
```

5. **访问应用**
- 前端: http://localhost:5173
- 后端API: http://localhost:3001

## 💡 使用指南

### 1. 用户注册和登录

访问应用后，首先注册账号：
- 免费版：每日10次AI功能使用
- 专业版：每日100次AI功能使用
- 企业版：无限制使用

### 2. 创建第一篇文章

1. **进入编辑器**
   - 点击"新建文章"进入编辑器页面
   
2. **输入文章内容**
   - 在编辑器中输入或粘贴你的文章内容
   - 支持Markdown格式和富文本编辑

3. **AI智能优化**
   - 点击右侧"AI助手"按钮
   - 选择需要的AI功能：
     - 📝 **标题生成**: 根据内容自动生成多个标题选项
     - ✨ **内容优化**: AI优化文章可读性和吸引力
     - 🎨 **样式推荐**: 根据内容特点推荐合适的排版模板
     - 📊 **文章分析**: 分析文章质量并提供改进建议
     - 🔍 **SEO优化**: 生成SEO友好的标题和关键词

### 3. 应用排版模板

1. **选择模板**
   - 点击工具栏"模板"按钮
   - 浏览50+专业模板
   - 预览模板效果

2. **自定义样式**
   - 调整字体、颜色、间距
   - 设置段落样式
   - 配置标题格式

### 4. 实时预览和发布

1. **预览文章**
   - 点击"预览"按钮查看最终效果
   - 支持手机和电脑预览模式

2. **保存和导出**
   - 保存文章到个人库
   - 导出为HTML或复制到公众号后台

## 🔧 高级功能

### AI批量处理

对于专业版和企业版用户，支持批量AI操作：

```javascript
// 一键执行多个AI任务
POST /api/ai/batch-process
{
  "content": "文章内容",
  "tasks": ["title", "optimize", "analyze", "seo", "style"]
}
```

### 自定义模板

创建和管理个人专属模板：

1. 在编辑器中设计样式
2. 保存为个人模板
3. 设置模板分类和标签
4. 分享给团队成员使用

### API集成

支持API接入，方便集成到现有工作流：

```javascript
// 获取用户文章列表
GET /api/articles

// AI生成标题
POST /api/ai/generate-title
{
  "content": "文章内容",
  "style": "professional",
  "count": 5
}

// 应用模板
POST /api/templates/123/apply
{
  "articleId": "article-uuid"
}
```

## 📊 监控和分析

### 使用统计

在AI助手中查看：
- 每日AI功能使用次数
- Token消耗统计
- 费用预估
- 功能使用分布

### 性能监控

访问监控面板 (http://localhost:3000) 查看：
- 系统性能指标
- API响应时间
- 错误率统计
- 用户活跃度

## 🛠️ 管理和维护

### 数据备份

```bash
# 手动备份
./scripts/backup.sh

# 自动备份 (每日凌晨2点)
# 已在 docker-compose.prod.yml 中配置
```

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新部署
./scripts/deploy.sh
```

## 🔒 安全配置

### SSL证书配置

1. **获取证书**
```bash
# 使用 Let's Encrypt
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d yourdomain.com
```

2. **配置 Nginx**
```bash
# 将证书文件复制到 docker/nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/
```

### 安全建议

- 🔐 定期更换JWT密钥
- 🛡️ 启用防火墙规则
- 📝 定期查看访问日志
- 🔄 保持依赖项更新

## 💰 成本估算

### AI功能成本 (基于OpenAI定价)

| 功能 | 每次Token消耗 | 成本估算 |
|------|---------------|----------|
| 标题生成 | ~500 tokens | $0.001 |
| 内容优化 | ~2000 tokens | $0.004 |
| 文章分析 | ~1000 tokens | $0.002 |
| SEO优化 | ~800 tokens | $0.0016 |

### 服务器成本

- **轻量级部署**: 2核4G云服务器，约 ¥300/月
- **生产环境**: 4核8G云服务器，约 ¥600/月
- **企业级**: 8核16G云服务器，约 ¥1200/月

## 🆘 问题排查

### 常见问题

1. **AI功能无法使用**
   - 检查 OPENAI_API_KEY 是否正确配置
   - 确认网络可以访问 OpenAI API
   - 查看后端日志是否有错误信息

2. **图片上传失败**
   - 检查 AWS S3 配置
   - 确认文件大小不超过限制
   - 查看上传权限设置

3. **数据库连接失败**
   - 检查数据库服务是否启动
   - 确认连接字符串配置正确
   - 查看防火墙规则

### 获取帮助

- 📖 查看完整文档: `/docs`
- 🐛 提交Bug: GitHub Issues
- 💬 技术交流: local690
- 📧 商务合作: 2406662589@qq.com

## 🚀 未来规划

### 即将推出的功能

- [ ] 微信小程序版本
- [ ] 多语言支持
- [ ] 语音转文字
- [ ] 视频号内容生成
- [ ] 数据可视化图表
- [ ] 团队协作功能

### 开源贡献

欢迎参与项目贡献：
1. Fork 项目
2. 创建功能分支
3. 提交Pull Request
4. 参与代码审查

---

**开始你的AI排版之旅吧！** 🎉

如有任何问题，请随时联系我们的技术支持团队。
