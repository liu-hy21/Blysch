# Blender 制作规范

对着 `docs/blender` 里某一族开工。族的选择先看 [风格总览](./风格总览.md)。下面是五族共用的工程约定，避免每做一次就改一套镜头。

本机 Blender：**5.2.1 LTS**，路径 `C:\Users\liuha\AppData\Local\Programs\Blender 5.2\blender.exe`。Cursor 通过 MCP 连时，要在 GUI 里 Start MCP Server。

## 1. 场景文件

- 一文件一族，或一文件一场景。不要把花园和雨夜店放在同一个 blend 里共用材质名。
- Collection 按功能拆：`GEO_BUILDING` `GEO_ROAD` `GEO_PROP` `GEO_VEG` `GEO_LIGHT` `CAM` `ENV`。剖屋再加 `ROOM_BATH` `ROOM_BED` `ROOM_LIVE` `ROOM_KITCHEN` 这类 Empty 父级。
- 世界单位：米。卡通城市一块路建议 **10m × 10m**（或 8m，全文件统一）。建筑层高约 **3.2–3.6m** 视觉层，玩具比例可以再矮一点。
- 原点：路模块在板块中心；建筑在底层平面中心；道具在接地中心。

## 2. 镜头

| 族 | 相机 | 焦距/类型 | 俯角 |
|----|------|-----------|------|
| A 卡通城市 | Orthographic | — | ~35° |
| B 软陶花园 | Orthographic | — | ~40° |
| C 和风 | Orthographic | — | ~32° |
| D 便利店 / 咖啡 | Orthographic 或很长焦透视 | 85–135mm 等效 | ~30–35° |
| E 粉彩剖屋 | Orthographic | — | ~35–40° |

等距旋转：相机绕 Z 45°，再绕 X 35.264°（真等距）或 30–40°（看起来更屋顶）。五族都不要广角近大远小。E 必须看见地板和墙顶厚度，近处两面墙拿掉。

## 3. 网格

- 先用立方/圆柱/布尔出大形，再 Bevel。
- A：Bevel 宽度约为物体短边的 4–8%。  
- B：Bevel 再加大一倍，Shade Smooth。  
- C：Bevel 接近 0，树保持 Low Poly，Flat 或 Auto Smooth 30°。  
- D：建筑小 Bevel，玻璃大面保持平。
- E：Bevel 介于 A 与 B 之间；墙转角、柜、沙发必须圆。先灰模（见 `refs/08-pastel-dollhouse-clay.jpg`）再赋色。
- 窗、栏杆、招牌做成独立物体，方便换变体。
- 禁止为了「真实」加 Loop 切砖缝。砖缝用顶点色或极简盒子凹槽。

## 4. 材质

默认 Principled BSDF，贴图能不加就不加（A 的设定就是 texture-free）。

| 参数 | A | B | C | D | E |
|------|---|---|---|---|---|
| Roughness | 0.35–0.5 | 0.45–0.7 | 0.3–0.5，瓦略高 | 墙 0.45，积水 0.05–0.15，灯箱 Emission | 0.4–0.55 |
| Metallic | 杆、车灯才用 | 几乎 0 | 几乎 0 | 空调外壳一点点 | 0 |
| Transmission | 不用真玻璃 | 不用 | 窗纸是 Emission | 便利店玻璃 0.7–0.9 | 不用 |
| Emission | 信号灯 | 灯头弱 | 窗、灯笼必须 | 灯箱、室内、贩卖机 | 台灯/蘑菇灯弱，主靠棚光 |

色走各族文档的表。同一材质在 Blender 里建成资产：`M_Road` `M_Curb` `M_WallWarm` … 不要每个物体独一份 Principled。

## 5. 灯光（起步）

**A / B / E（棚拍）**

- World：浅灰 0.3–1.0。
- Sun 或 Area 主光，强度低，Angle 大。
- 大 Area 补光对面翻 0.5 档。
- 地面阴影：Contact 软。Cycles 开 Portal 可选。

**C / D 夜景**

- World：深色，不要 HDRI 城市照片。
- 室内/灯箱用网格 Emission。
- 一盏很弱的冷 Area 当月光或天光。
- 雨：积水单独一块平面 + 玻璃材质；雨丝用粒子或 Grease Pencil，不要上实时电影级流体。

## 6. 渲染

- 预览 Eevee 即可对风格；定稿 Cycles，采样够用就停（棚拍 128–256，夜景 256–512 + 降噪）。
- 背景：A/B/E 用世界色或大平面；C/D 用纯色世界，台座边缘可暗下去。
- 色彩管理：AgX 或 Filmic，Look 用 None 或 Very Low Contrast。不要把粉彩打成灰。
- 输出：风格静帧 PNG；资产 GLB（A 特别要求）。GLB 先应用缩放，合并同材质，三角面，单件目标小于 1MB。

## 7. 用 MCP 时的纪律

- 先建空场景、锁相机、建色板材质，再堆物体。
- 一次只做清单里的一类（先六块路，再灯，再一栋楼）。
- 改风格参数（Bevel、Roughness、World 色）时全文件统一，不要只改眼前这棵树。
- 渲染前打开各族文档的「明确不画」对照一遍。

## 7.1 大场景实例化（从 P1 Atlas 来）

件数一多，只保留「一种零件一份 mesh」。路口的树、灯、车位、建筑层都用 Alt+D 或 Geometry Nodes 实例，禁止 Apply 成独一份网格。颜色用物体色或 GN 属性，不要为每盏灯复制 Principled。爆炸、隐藏、按族过滤只改变换和可见性。细则见 [06 Atlas 积木实例化](./06-atlas积木实例化.md)。

## 8. 验收（通用）

缩成手机宽仍须立刻读出该族的那句话（见各篇开头）。失败通常是：

1. 倒角用错族；  
2. 灯光用错（夜景打成白棚，或花园打成电影反差）；  
3. 加了写实贴图；  
4. 一栋楼上混了条纹棚 + 和风瓦 + 积水。
