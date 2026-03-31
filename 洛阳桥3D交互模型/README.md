# 洛阳桥3D交互模型

> 泉州洛阳桥三维结构交互展示

## 📖 项目简介

基于 Three.js 的泉州洛阳桥交互式3D结构模型。用程序化几何构建桥梁的完整结构——筏型基础、种蛎固基层、船形桥墩、石板梁、栏杆石狮，支持 360° 旋转查看、结构分层高亮和知识点讲解。

## 🎮 交互功能

| 操作 | 功能 |
|------|------|
| 🖱️ 拖拽 | 旋转视角 |
| 🔭 滚轮 | 缩放 |
| 🤚 右键拖拽 | 平移 |
| 🏗️ 底部按钮 | 切换结构部件高亮 |
| 📐 左侧按钮 | 快速切换视角 |
| 🖱️ 双击 | 选中3D构件查看说明 |

## 🏗️ 3D模型结构

| 层级 | 名称 | 建模方式 |
|------|------|---------|
| 🪨 筏型基础 | 水下石堤 | BoxGeometry + 随机石块 |
| 🦪 种蛎固基 | 牡蛎胶结层 | BoxGeometry + SphereGeometry |
| ⛵ 船形桥墩 | 6座桥墩 | ExtrudeGeometry (船形截面) |
| 📐 石板梁 | 5×5块石梁 | BoxGeometry 阵列 |
| 🦁 栏杆石狮 | 栏杆+柱+狮 | BoxGeometry + SphereGeometry |

## 🚀 启动方式

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 📁 项目结构

```
洛阳桥3D交互模型/
├── index.html           # 主页面
├── css/style.css        # UI样式
├── js/
│   ├── textures.js      # 程序化纹理生成
│   ├── bridge-model.js  # 桥梁3D模型构建器
│   └── main.js          # 场景/灯光/控制器
├── assets/textures/     # 纹理素材
└── docs/                # 文档
```

## 🎨 技术栈

| 技术 | 用途 |
|------|------|
| Three.js r160 | 3D渲染引擎 |
| OrbitControls | 轨道相机控制 |
| Canvas API | 程序化纹理生成 |
| CSS3 | 玻璃态UI |
