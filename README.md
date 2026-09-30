# IngredientCore 静态网站

网站发布文件在 `docs/`。GitHub Pages 设置为 **Deploy from a branch → main → /docs** 后，推送 `docs/` 内的修改即可触发 GitHub 内置发布。无需运行本仓库原先的自定义 Actions 工作流。

- `docs/index.html`、其他页面、`docs/assets/`：直接发布的网站文件。
- `docs/sitemap.xml`、`docs/robots.txt`：当前正式域名 `https://ingredientcore.com/` 的已生成文件。
- 根目录 `content/`、`build.mjs`、`publish.mjs`、`test-*.mjs`：保留作日后批量维护与检查；不会作为 Pages 站点发布。
- `建站过程/`：本地归档，已忽略，不上传。

## GitHub Pages 设置

进入仓库 Settings → Pages → Build and deployment：

1. Source 选 **Deploy from a branch**。
2. Branch 选 **main**，文件夹选 **/docs**，点击 Save。
3. 保留 Custom domain 为 **ingredientcore.com**。
4. 等待 Pages 显示已发布，并在证书准备完成后启用 Enforce HTTPS。

当前 `docs/` 已含完整静态站，GitHub 不需要运行 Node 才能发布。GitHub 内部仍会显示一次 Pages 部署记录，这是平台把文件复制到网站的正常步骤。

## 后续更新

直接修改 `docs/` 中已有 HTML、CSS、JS 或图片后，用 GitHub Desktop Commit、Push 即可发布对应更改。新增或删除 docs 内网页并推送后，独立的 SEO 工作流会自动扫描公开 HTML、更新 docs/sitemap.xml 并请求 Pages 发布更新。它不会重新构建网页，也不会伪造 lastmod 日期。正式域名变化或新页面需要 canonical 时，仍须更新相应页面元信息。

如果修改的是 `content/` 数据和模板，先在本地运行生成器再更新 `docs/`：

    node build.mjs
    node check.mjs
    node publish.mjs https://ingredientcore.com/
    node check.mjs .publish

随后用 `.publish/` 的内容更新 `docs/`，再提交、推送。不要提交 `.publish/` 或 `建站过程/`。当前 60 个公开文件和 49 个 sitemap URL 已通过检查。

## 网站地图自动更新

此做法参考 Bespring：.github/workflows/sitemap.yml 在 docs 页面变化时执行 .github/scripts/update-sitemap.mjs，只改动确实变化的网站地图。Pages 仍从 main /docs 直接发布，不使用旧的构建/部署工作流。GitHub 会出现一个短暂的“Update sitemap”检查任务；无需手动运行。