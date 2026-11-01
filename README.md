# IngredientCore 静态网站维护

发布网站时，将“上线文件”内的全部内容放在 GitHub 仓库根目录，包括隐藏的 `.github` 文件夹；不要将外层项目、本地模型或建站过程上传到发布仓库。

## 一次性发布设置（本次改造后需要）

GitHub 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**，保留自定义域名 `www.ingredientcore.com` 和 HTTPS 设置。原来的 Deploy from a branch 不再作为本流程发布来源。若不切换，会继续走旧分支发布，不能保证线上收到生成后的地图。

用 GitHub Desktop 提交、推送到 main 后，Actions → Update sitemap and deploy Pages：先扫描实际 HTML 生成 sitemap.xml，再将网站和地图打包、发布。无需机器人回写提交，避免重复触发和生成、发布竞态。IndexNow 在发布成功后运行，其失败不撤回已经成功的网站发布。可在 Actions 手动运行本流程。

网站只保留根目录 sitemap.xml（urlset），包含英文和全部已存在的语言页面。robots.txt 只声明这一地址。当前 637 条，今后按实际页面动态扫描。保留页面中的 canonical、hreflang 和 x-default；不虚构 lastmod。目录首页统一使用 `/th/` 等形式，不能写成 `/th/index.html`。

新增 HTML 必须有准确的本站 canonical；删除、重命名及 noindex 页面会在下一次推送后重新计算。生成器不会提交 404、验证页、隐藏目录、模型、内部工具及 noindex 页面；canonical 错误会中止发布，避免发布错误地图。

本地更新地图：在仓库根目录运行 `node .github/scripts/update-sitemap.mjs .`。上传后的检查地址为 https://www.ingredientcore.com/sitemap.xml 和 https://www.ingredientcore.com/robots.txt 。检查 Actions 的 build/deploy 是否成功，不要只凭 Desktop 推送成功判断发布完成。

若任务失败：确认 main 是发布分支、`.github/workflows` 在仓库根目录、Actions 已启用、Pages Source 为 GitHub Actions；若环境保护或组织权限限制发布，按 Actions 日志处理。无需添加个人访问令牌。

IndexNow 接收请求不代表已抓取或收录。保留现有密钥及搜索引擎验证文件。
