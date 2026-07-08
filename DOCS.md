# Uptime Status 使用文档

一个基于 UptimeRobot API 的在线状态面板，用于展示网站监控状态。

## 目录

- [环境准备](#环境准备)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [环境变量配置](#环境变量配置)
- [部署方式](#部署方式)
- [GitHub Pages 部署](#github-pages-部署)
- [Cloudflare Pages 部署](#cloudflare-pages-部署)
- [自托管部署](#自托管部署)
- [自定义样式](#自定义样式)
- [常见问题](#常见问题)

---

## 环境准备

### 必需

- [Node.js](https://nodejs.org/) 20+
- [UptimeRobot](https://uptimerobot.com/) 账号和 API Key

### 获取 API Key

1. 注册并登录 [UptimeRobot](https://uptimerobot.com/)
2. 添加需要监控的站点
3. 进入 **My Settings** 页面
4. 找到 **API Keys** 部分，获取以下任一类型：
   - **Monitor-Specific API Key**：只能访问特定监控
   - **Read-Only API Key**：可以读取所有监控数据

---

## 快速开始

### 1. 安装依赖

```bash
git clone https://github.com/forkdo/uptime-status.git
cd uptime-status
npm install
```

### 2. 配置 API Key

编辑 `public/config.js` 文件：

```javascript
window.Config = {
  SiteName: '我的网站状态',        // 显示的标题
  ApiKeys: [
    'your-api-key-here'           // 填入你的 API Key
  ],
  CountDays: 90,                  // 显示 90 天的日志
  ShowLink: false,                // 不显示站点链接
  Navi: [],                       // 导航菜单
};
```

### 3. 启动开发服务器

```bash
npm start
```

访问 http://localhost:3000 预览效果。

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `build/` 目录下，可直接部署到任何静态托管服务。

---

## 配置说明

### config.js 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SiteName` | `string` | `'Site Status'` | 页面标题和顶部 Logo 显示的名称 |
| `ApiKeys` | `string[]` | `[]` | UptimeRobot API Key 数组，支持多个 |
| `CountDays` | `number` | `90` | 显示最近多少天的状态日志，建议 60-90 |
| `ShowLink` | `boolean` | `false` | 是否在监控项旁边显示站点链接 |
| `Navi` | `Array<{text, url}>` | `[]` | 导航栏菜单项 |
| `ApiBaseUrl` | `string` | `'https://api.uptimerobot.com'` | API 地址，可配置为自建代理地址 |

### 导航菜单配置示例

```javascript
window.Config = {
  // ...其他配置
  Navi: [
    { text: '首页', url: 'https://example.com' },
    { text: '文档', url: 'https://docs.example.com' },
    { text: 'GitHub', url: 'https://github.com/example' },
  ],
};
```

### 多个 API Key 配置示例

```javascript
window.Config = {
  // ...其他配置
  ApiKeys: [
    'read-only-api-key-1',
    'read-only-api-key-2',
    'monitor-specific-api-key',
  ],
};
```

---

## 环境变量配置

本项目通过 GitHub Actions 部署时支持使用**仓库变量 (Repository Variables)** 来动态配置，无需修改代码。

### 设置位置

进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** → **Variables** 标签页

### 可用变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SITE_NAME` | 站点显示名称 | `My Site Status` |
| `API_KEYS` | API Key 列表，逗号分隔 | `key1,key2,key3` |
| `COUNT_DAYS` | 显示日志天数 | `90` |
| `SHOW_LINK` | 是否显示链接 | `true` 或 `false` |
| `API_BASE_URL` | API 地址 | `https://your-proxy.example.com` |
| `NAV_ITEMS` | 导航菜单 JSON | 见下方示例 |

### 变量配置示例

#### SITE_NAME

```
我的网站运行状态
```

#### API_KEYS

多个 API Key 用逗号分隔（不含空格）：

```
m123456-abcdef1234567890,m987654-abcdef1234567890
```

#### COUNT_DAYS

```
90
```

#### SHOW_LINK

```
true
```

#### API_BASE_URL

```
https://your-proxy.example.com
```

#### NAV_ITEMS

导航菜单使用 JSON 格式，每行一个菜单项：

```json
[
  {"text": "首页", "url": "https://example.com"},
  {"text": "文档", "url": "https://docs.example.com"}
]
```

---

## 部署方式

### GitHub Pages 部署

#### 1. 启用 GitHub Pages

1. 进入仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**

#### 2. 配置仓库变量

按照 [环境变量配置](#环境变量配置) 设置所需的变量。

#### 3. 触发部署

推送代码到 `main` 分支会自动触发部署，也可以手动触发：

1. 进入 **Actions** 标签页
2. 选择 **Deploy** 工作流
3. 点击 **Run workflow**

#### 4. 访问站点

部署成功后，访问地址为：
```
https://<username>.github.io/<repository>/
```

---

### Cloudflare Pages 部署

#### 1. 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **My Profile** → **API Tokens**
3. 创建 Token，权限选择 **Cloudflare Pages: Edit**
4. 记录生成的 Token

#### 2. 设置 Secrets

进入仓库 → **Settings** → **Secrets and variables** → **Actions** → **Secrets**

添加以下 Secret：

| Secret 名称 | 说明 |
|-------------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |

#### 3. 设置仓库变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `PROJECT_NAME` | Cloudflare Pages 项目名 | `status` |
| `BRANCH` | 部署的分支 | `main` |

以及 [环境变量配置](#环境变量配置) 中的其他变量。

#### 4. 触发部署

推送代码到 `main` 或 `dev` 分支会自动触发 Cloudflare Pages 部署。

---

### 自托管部署

适用于自己的服务器或静态托管服务（Nginx、Apache、OSS 等）。

#### 方式一：直接下载 Release

1. 从 [Releases](https://github.com/forkdo/uptime-status/releases) 下载最新 `uptime-status.zip`
2. 解压后修改 `config.js` 配置
3. 上传到你的 Web 服务器

#### 方式二：本地构建后部署

```bash
# 克隆项目
git clone https://github.com/forkdo/uptime-status.git
cd uptime-status

# 安装依赖
npm install

# 修改配置
vim public/config.js

# 构建
npm run build

# 将 build/ 目录上传到你的 Web 服务器
```

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name status.example.com;
    root /var/www/uptime-status/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 自建接口代理

当遇到以下情况时，需要自建接口代理：

- 服务器在国外，访问 UptimeRobot API 速度慢
- 需要添加缓存或限流策略
- 需要统一管理 API Key

##### 1. 部署代理服务器

使用 Nginx 搭建反向代理：

```nginx
server {
    listen [::]:80;
    server_name your-proxy-domain.com;

    location / {
        proxy_ssl_server_name on;
        proxy_pass https://api.uptimerobot.com/;
        proxy_hide_header Access-Control-Allow-Origin;
        add_header Access-Control-Allow-Origin * always;
    }
}
```

部署后验证代理是否正常工作：

```bash
curl https://your-proxy-domain.com/v2/getMonitors -d "api_key=your-key&format=json"
```

##### 2. 配置使用代理

**方式一：修改 config.js**

```javascript
window.Config = {
  // ...其他配置
  ApiBaseUrl: 'https://your-proxy-domain.com',
};
```

**方式二：GitHub Actions 部署时配置变量**

设置仓库变量 `API_BASE_URL` 为你的代理地址：

```
https://your-proxy-domain.com
```

---

## 自定义样式

项目使用 SCSS 编写样式，主要变量定义在 `src/app.scss` 文件顶部：

```scss
$primary-color: #3bd672;    // 主题色（正常状态颜色）
$footer-color: #556f91;     // 页脚链接颜色
```

修改这些变量可以快速调整整体配色风格。

---

## 常见问题

### Q: API Key 在哪里获取？

登录 UptimeRobot → My Settings → API Keys，可以选择创建 Read-Only API Key 或 Monitor-Specific API Key。

### Q: 为什么页面显示空白？

1. 检查 `config.js` 中的 `ApiKeys` 是否正确填写
2. 打开浏览器开发者工具查看是否有 API 请求报错
3. 确认 API Key 是否有效且有对应的监控项

### Q: CountDays 设置多少合适？

建议设置为 60 或 90，这样可以展示约 2-3 个月的状态，视觉效果较好。

### Q: 如何添加多个监控？

在 `ApiKeys` 数组中添加多个 API Key 即可，每个 Key 对应的监控项会分别显示。

### Q: Navi 导航菜单不显示？

确保 `Navi` 数组格式正确，每个元素包含 `text` 和 `url` 属性：

```javascript
Navi: [
  { text: '首页', url: 'https://example.com' }
]
```
