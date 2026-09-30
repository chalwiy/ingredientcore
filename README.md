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

直接修改 `docs/` 中已有 HTML、CSS、JS 或图片后，用 GitHub Desktop Commit、Push 即可发布对应更改。新增、删除网页或改变正式域名时，应重新生成 `docs/sitemap.xml`、canonical 等 SEO 文件；GitHub 的分支直发不会自动计算网站地图。

如果修改的是 `content/` 数据和模板，先在本地运行生成器再更新 `docs/`：

    node build.mjs
    node check.mjs
    node publish.mjs https://ingredientcore.com/
    node check.mjs .publish

随后用 `.publish/` 的内容更新 `docs/`，再提交、推送。不要提交 `.publish/` 或 `建站过程/`。当前 60 个公开文件和 49 个 sitemap URL 已通过检查。
