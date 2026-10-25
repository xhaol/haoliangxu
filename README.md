# 许浩良个人主页

中英双语静态主页，包含研究介绍、教育经历、论文、项目视频与求职简历。

预期访问地址：https://xhaol.github.io/haoliang/

## 本地预览

```bash
python3 -m http.server 8765
```

访问 http://localhost:8765 。不需要安装依赖或执行构建。

## 内容维护

- `index.html`：正文。`data-zh` 和 `data-en` 分别保存中英文，修改中文时同步标签内的默认文字。
- `style.css`：页面样式。
- `main.js`：语言切换与视频播放。
- `assets/Haoliang-Xu-CV.pdf`：求职简历。
- `assets/videos/`：项目视频与封面，所有 MP4 都已移除音轨。

## GitHub Pages

仓库 Settings → Pages → Deploy from a branch，选择 `main` 分支和 `/ (root)`。
后续提交到 main 后，GitHub Pages 会自动更新。

## 模板来源

布局参考 [Minimal Light](https://github.com/yaoyao-liu/minimal-light)（CC0）。许可证保存在 `assets/minimal-light-LICENSE.txt`。
个人照片、论文图示与项目视频不随模板许可证授权。
