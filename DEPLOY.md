# 部署说明（GitHub Pages）

作品集是**纯静态**（HTML + CSS + 原生 JS + 图片），零构建、零外部依赖，
不需要 npm、不需要 Tailwind CDN、不引 Google Fonts —— 丢到任何静态托管都能直接跑。

---

## 方式一：抽成独立仓库（推荐，最终作品集就该是独立仓库）

```bash
# 1. 把 portfolio 目录抽成独立分支（在 main_project 根目录执行）
cd C:\Users\20708\PycharmProjects\AIRAG\main_project
git subtree split --prefix=portfolio -b portfolio-only

# 2. 新开一个空目录作为作品集仓库
mkdir C:\Users\20708\PycharmProjects\portfolio
cd C:\Users\20708\PycharmProjects\portfolio
git init
git pull ..\AIRAG\main_project portfolio-only

# 3. 推到 GitHub（先建好空仓库，例如 portfolio）
git remote add origin https://github.com/<你的账号>/portfolio.git
git branch -M main
git push -u origin main
```

然后在 GitHub 仓库 → **Settings → Pages**：

- Source 选 `Deploy from a branch`
- Branch 选 `main`，目录选 `/ (root)`
- 保存后等 1 分钟，访问 `https://<你的账号>.github.io/portfolio/`

首页文件是 `index.html`，所以根路径直接可达。

## 方式二：直接复制目录

```bash
robocopy C:\Users\20708\PycharmProjects\AIRAG\main_project\portfolio ^
         C:\Users\20708\PycharmProjects\portfolio /E
```

然后按上面的第 3 步推 GitHub 即可。

---

## 更新已上线的站点（2026-09-30 已部署）

线上地址：**https://600kill.github.io/portfolio/**　仓库：https://github.com/600kill/portfolio
本地已配好 remote（名为 `portfolio`），改完作品集后在 `main_project` 根目录执行：

```powershell
git add portfolio/
git commit -m "update: 作品集更新说明"
git branch -D portfolio-only
git subtree split --prefix=portfolio -b portfolio-only
git push portfolio portfolio-only:main
```

push 后等约 1 分钟 GitHub Pages 自动重建；强刷（Ctrl+F5）或加 `?v=2` 绕过 CDN 缓存验证。

## 本地预览

因为用的是相对路径（`assets/…`、`shots/…`），直接用浏览器打开 `portfolio/index.html` 就能看；
如果想更接近线上环境（带 HTTP 服务）：

```bash
python -m http.server 8080 --directory C:\Users\20708\PycharmProjects\AIRAG\main_project\portfolio
# 打开 http://127.0.0.1:8080/
```

---

## 上线前检查清单

- [ ] `assets/dock.js` 里的 `SITE`（名字 / GitHub / 邮箱 / 简历）已替换成真实信息
- [ ] 联系区与 Hero 徽标的求职方向已改成你的目标岗位
- [ ] 两个项目详情页里的「查看 GitHub 源码」能跳到真实仓库（否则按钮会自动隐藏）
- [ ] 想公开的实测数据已确认（见 `CONTENT.md` 第 4 节）
- [ ] 手机宽度下看一眼（浏览器 DevTools 切 390px），确认 Dock 与卡片没有溢出

## 自定义域名（可选）

1. 在仓库根目录加一个 `CNAME` 文件，内容是你的域名（例如 `me.yourdomain.com`）
2. 域名解析里加 CNAME 记录指向 `<你的账号>.github.io`
3. 仓库 Settings → Pages → Custom domain 填入域名并勾选 Enforce HTTPS

---

## 关于两个项目的「可点击 demo」

作品集里的两个项目按钮目前指向**项目详情页**，详情页里再链到 GitHub 源码。
如果你之后把两个后端真的部署上线（需要服务器 + PG/Redis + LLM key），只要在
`agent-platform.html` 与 `resume-assistant.html` 的链接区各加一个按钮即可：

```html
<a class="btn" href="https://你的域名/agent/" target="_blank" rel="noopener">在线演示</a>
```

> 提醒：上线 demo 时要给 LLM 调用加限流与缓存（Agent 平台每天会被面试官点很多次），
> 否则免费额度很快会被打满。
