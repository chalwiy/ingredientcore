# IngredientCore 上传与自动更新说明

## 上传什么

把本文件所在 IngredientCore 文件夹中的内容放到独立 GitHub 仓库的根目录，不要再套一层 IngredientCore。保留 .github/workflows/pages.yml、content、assets、所有页面目录，以及根目录的 .mjs 脚本和 .nojekyll。

**不要上传“建站过程”文件夹。** 其中包含内部商业审计、私有资料检查记录与历史说明。它已加入 .gitignore，但 GitHub 网页手动上传不会以此自动过滤。若以前已经提交过内部资料，移动或忽略文件不能消除历史记录。

- about、applications、contact、knowledge、privacy、products、quality、assets、index.html、404.html：静态网站。
- content、build.mjs：可维护内容与生成器；直接修改生成HTML会在构建时被覆盖。404主体可直接编辑。
- check.mjs、test-*.mjs：自动发布前的检查；不是多余文件。
- publish.mjs、release-files.mjs、release-gate.mjs：生成网址、网站地图与严格筛选发布文件。
- 建站过程：不上传、不发布的历史审计与维护记录。其中旧路径和旧发布说明仅为历史记录，本说明优先；internal-tools 属于归档工具，不参与构建。

## 首次设置（用户操作）

1. 建立独立仓库并上传上述内容，包括隐藏的 .github 文件夹；不要修改 Bespring 仓库。
2. 仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
3. 在 Actions 中选择 Build and publish IngredientCore，必要时 Run workflow。之后每次更新仓库默认分支都会自动运行；其他分支不发布。
4. 等待 build、deploy 成功，使用 Pages 显示的实际网址访问网站。

工作流从 configure-pages 获取实际 base_url，无需手动写入域名或 SITE_URL；没有配置 FoodAdditiveSource.com，也没有创建 CNAME。

## 网站地图自动更新

默认分支更新 → build.mjs 生成页面 → 全部检查 → publish.mjs 生成 sitemap.xml、robots.txt、绝对canonical及分享网址 → 门禁检查 → 仅发布 .publish。

sitemap只包含实际生成的可索引页面，不含404、内部记录或测试文件；不会生成虚假的lastmod。生成文件存在于发布产物，不自动提交回源码仓库。新增产品时仍需维护产品数据和独立身份测试清单；无需手工修改sitemap。

发布只包含白名单静态文件，源码、脚本、本文和建站过程都不进入网站。但公开仓库的源码仍可被读取，因此内部资料必须排除在上传之外。

项目站的 robots.txt 位于项目子路径，不能代替主机根 robots.txt。上线后可自行在站长工具提交实际 sitemap.xml 地址；本次未进行提交。

## 本地维护与验收

需要Node 22或更新版本；网站访客不需要Node。

    node build.mjs
    node check.mjs

本地模拟（不会部署）：

    node publish.mjs https://example.github.io/IngredientCore/
    node check.mjs .publish
    node release-gate.mjs https://example.github.io/IngredientCore/ --simulation

模拟后删除 .publish，避免手动上传测试地址产物。正式自动工作流使用真实Pages地址且不使用simulation。

工作流仅已在本地编写；GitHub Actions运行、实际HTTP响应与线上索引仍需上传后验证。真实商业资料及浏览器验收限制见本地“建站过程/RELEASE-READINESS.md”。
