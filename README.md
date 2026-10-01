# IngredientCore 静态网站

本仓库与 Bespring 一样，从 main 分支根目录直接发布静态 HTML。GitHub Pages 设置：Settings → Pages → Build and deployment → **Deploy from a branch** → **main** → **/(root)** → Save。Custom domain 保持 `www.ingredientcore.com`。

根目录的 `index.html`、各页面目录、`assets/`、`404.html`、`sitemap.xml`、`robots.txt`、`CNAME` 和 `.nojekyll` 是发布文件。更新这些文件并用 GitHub Desktop 推送后，GitHub Pages 自动发布。

`.github/workflows/sitemap.yml` 参照 Bespring 的方法，在网页变动后扫描根目录 HTML，自动更新 `sitemap.xml`。只有网站地图内容变化时才提交，并请求 Pages 重建。工作流不构建网站，不使用旧的自定义发布程序，完成后调用 IndexNow：普通 push 只提交原始 before/after 范围内新增、修改、删除及重命名页面；手动运行可提交完整 sitemap。它不把每次运行日期写作页面更新时间。

本地 `建站过程/` 存放构建与测试源码及历史记录，已通过 `.gitignore` 排除。网站批量调整可使用其中源码重新生成文件，再将经过检查的静态输出复制到根目录；直接编辑现有 HTML、CSS、JS 或图片则提交相应文件即可。新增页面请添加准确标题、描述和 canonical；网站地图会自动纳入可索引的 HTML。删除页面后，网站地图会自动去掉相应 URL。

上线检查：`https://www.ingredientcore.com/`、`https://www.ingredientcore.com/sitemap.xml`、`https://www.ingredientcore.com/robots.txt`；Pages 中启用 Enforce HTTPS 并检查裸域名到 `www` 的跳转。首次 DNS 与证书生效需要在 GitHub Pages 设置中确认。
