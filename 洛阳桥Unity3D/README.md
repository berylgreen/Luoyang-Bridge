# 洛阳桥 Unity 3D 素材包

> 泉州洛阳桥 Unity 项目素材 — FBX 模型 + 贴图纹理

## 📦 素材清单

### 3D 模型 (FBX)

| 文件 | 描述 | 尺寸 | 面数 |
|------|------|------|------|
| `BoatPier.fbx` | **船形桥墩** — 带尖端的船形桥墩+石帽 | 28K | ~2K面 |
| `StoneBeam.fbx` | **石板梁** — 11m×1m×0.5m 单块石梁 | 17K | ~200面 |
| `RailingPostWithLion.fbx` | **栏杆柱+石狮** — 柱+底座+狮头+狮身 | 35K | ~3K面 |
| `RailingPanel.fbx` | **栏杆面板** — 3m宽面板+顶部横杆 | 20K | ~300面 |
| `RaftFoundation.fbx` | **筏型基础** — 水下石堤+散落石块 | 68K | ~2K面 |
| `OysterLayer.fbx` | **种蛎固基层** — 牡蛎附着层+25个牡蛎簇 | 154K | ~3K面 |
| `BridgeDeck.fbx` | **桥面板** — 14m×7m 桥面铺装 | 16K | ~200面 |
| `WaterPlane.fbx` | **水面** — 200m×200m 细分水面平面 | 37K | ~1.8K面 |
| `FullBridge_5Span.fbx` | **完整桥梁** — 6墩5跨完整组装体 | 419K | ~15K面 |

### 贴图纹理 (PNG)

| 文件 | 用途 | 分辨率 |
|------|------|--------|
| `Stone_Diffuse.png` | 石材漫反射贴图 | 1024×1024 |
| `Oyster_Diffuse.png` | 牡蛎层漫反射贴图 | 1024×1024 |
| `Water_Diffuse.png` | 水面漫反射贴图 | 1024×1024 |

## 🎮 Unity 使用指南

### 导入步骤
1. 将 `Assets/` 文件夹拖入 Unity 项目的 `Assets/` 目录
2. Unity 会自动识别 FBX 并生成模型预览
3. 在 Inspector 面板中设置 Scale Factor = 1
4. 将贴图拖拽到对应材质的 Albedo 通道

### 推荐场景组装
```
场景层级:
├── Main Camera (远景相机)
├── Directional Light (太阳光)
├── Bridge/
│   ├── FullBridge_5Span  (或逐个组件组装)
│   ├── 或分别放置:
│   │   ├── RaftFoundation × 1
│   │   ├── OysterLayer × 1
│   │   ├── BoatPier × 6 (间距14m)
│   │   ├── StoneBeam × 25 (5块/跨)
│   │   ├── BridgeDeck × 5
│   │   └── RailingPostWithLion × N
│   └── ...
├── Environment/
│   └── WaterPlane
└── UI Canvas
```

### 材质建议

| 部件 | Shader | Albedo | Smoothness | Metallic |
|------|--------|--------|------------|----------|
| 桥墩/石梁 | Standard | Stone_Diffuse | 0.15 | 0.05 |
| 牡蛎层 | Standard | Oyster_Diffuse | 0.05 | 0 |
| 水面 | Standard (Transparent) | Water_Diffuse | 0.85 | 0.3 |

## 🔧 重新生成模型

如需修改参数（桥墩数量、尺寸等），编辑 `generate_models.py` 后运行：
```bash
blender --background --python generate_models.py
```

## 📁 项目结构

```
洛阳桥Unity3D/
├── Assets/
│   ├── Models/
│   │   ├── Bridge/         # 9个FBX模型
│   │   └── Environment/    # 水面
│   ├── Textures/           # 3张贴图
│   └── Materials/          # (Unity中创建)
├── Scripts/                # (C#脚本目录)
├── docs/                   # 文档
├── generate_models.py      # Blender自动建模脚本
└── README.md
```
