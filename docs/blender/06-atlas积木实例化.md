# 06 Atlas 积木实例化（给 Blender）

对照：[LEGO McLaren P1 Atlas](https://lego-mclaren-p1-42172-atlas.vercel.app/)（Technic 42172）。源码在 `.agents/lib/lego-mclaren-p1-42172-atlas-main`。它是 **Three.js 浏览器查看器**，不是 Blender 文件；下面只把可搬到 Blender 的做法写出来。

现场演示：拖动环绕、拆开（Explode）、按族过滤、点选零件、Isolate。模型来自社区 Studio 文件，件数和官方套装不完全一致。

## 它在解什么问题

3900 件积木如果每件一份网格，浏览器和 Blender 都会炸。Atlas 的做法是：

1. **几何只存一份**：同零件同拓扑共用 `geometry.bin` 里的一段顶点。
2. **件是实例**：每件只存 4×4 矩阵 + 颜色号 + 零件名。
3. **绘制按「几何 × 颜色」合批**：`InstancedMesh`，不是 3900 个 Mesh。
4. **拆开是改矩阵，不改网格**：爆炸、抬机盖、货架排布都写在 instance matrix 上。

转换结果（仓库文档）：277 种零件定义，3905 个可选实例；展示牌去掉。几何缓冲未压缩约 34MB。轻量转换 **故意丢掉** 边线、平滑规则、透明件和部分贴纸。文件字段、19 色和高频零件见 [07 Atlas 资产目录](./07-atlas资产目录.md)。

Blender 对应物：

| Atlas | Blender |
|-------|---------|
| 一种零件一份 geometry | 一个 mesh 数据块（Object Data） |
| instance 矩阵 | 物体变换，或 GN *Instance on Points* |
| InstancedMesh 合批 | Linked Duplicate（Alt+D）/ Collection Instance / GN |
| instanceColor 选中高亮 | Object Color、Attribute、或 overlay |
| family 过滤 | Collection 可见性 / 视口隔离 |
| explode 插值 | GN 或关键帧只动位置，不动 mesh |

城市资产（[01 卡通城市](./01-卡通城市.md)）同一原则：一棵球树、一盏路灯只建一次，路口里全是实例。

## 数据流水线

```
Studio model.io
  → 解出 model.ldr / model2.ldr
  → 补全缺失 LDraw primitive（library.ldraw.org）
  → packed/model.mpd + LDConfig.ldr（色表）
  → convert：摊平三角、按零件缓存几何、写出
       geometry.bin（Float32 位置）
       model.json（geometries / instances / meta / colors）
```

LDraw 行类型：`1` 是子件引用（带 3×3 旋转 + 平移），`3`/`4` 是三角/四边形。转换时四边形拆成两个三角 `[0,1,2]` 和 `[0,2,3]`。颜色 `-1`（Studio 继承）映射成 LDraw `16`（当前色）。

**进 Blender 的实用路径**（按稳妥程度）：

1. 用 LDraw/Studio 导入插件读 `.mpd` / `.io`，导入后立刻把同名零件改成 **共享 mesh + 物体实例**。
2. 只把 Atlas 当参考：在 Blender 里按零件 catalog 建低模，自己做 Collection Instance。不要把 34MB 三角当城市资产的网格标准。
3. 不要把 `geometry.bin` 当最终资产格式；那是给 WebGL 的。Blender 侧用 `.blend` 库或 GLB，**同类件仍然要实例化**。

坐标系：LDraw 是 Y 向上、且和 Blender 前后相反。Atlas 加载时 `makeRotationX(π)` 再平移到包围盒中心，再按最长边缩到 **8 个单位**。Blender 导入积木后同样：应用旋转、原点放到整体中心、统一尺度，再开始做爆炸或渲染。

## 材质（可直接抄进 Principled）

查看器里所有砖都是一张 Standard：

- Roughness **0.48**
- Metalness 默认 **0.02**；色号 `82` / `148` / `383` 升到 **0.5**（铬/金属件）
- 双面渲染（砖壁很薄，单面会漏）
- 颜色来自 `LDConfig.ldr` 的 `!COLOUR … VALUE #hex`，不是贴图
- 选中件乘一层 `#ffcc85`，不换材质

灯光：半球光白 / 沙色（`#a5a08b`）强度 2；两盏平行光，大约 `(-4, 8, 5)` 强度 2、`(4, 3, -6)` 强度 1。背景纸色 `#efeee9`，透明清屏。色彩 **ACES Filmic**，曝光 1.05。相机透视 **36° FOV**，不是城市资产那套正交。

搬到 Blender：积木/硬表面目录件用同一套 Principled，靠 Base Color 区分；金属只给真正的销、轴、镀铬。薄件打开 Backface Cull 前先检查法线，必要时 Solidify 一点点厚度。棚拍积木可以抄这套两盏平行光 + 世界浅灰，和卡通城市白棚是同一类。

## 镜头与视图

| 视图 | 相机方向（归一化前） |
|------|----------------------|
| perspective（默认 ¾） | `(1, 0.65, 1.2)` |
| front | `(0, 0.02, 1)` |
| side | `(1, 0.15, 0)` |
| top | `(0, 1, 0.001)` 避免正顶万向节锁 |

距离随包围盒和爆炸程度拉远。爆炸接近货架（amount > 0.85）时 **禁止旋转、改成平移**，并锁到正视，避免斜着看一堆零件对不齐。

Blender：给场景做 4 个相机标记（¾ / 前 / 侧 / 顶）。做零件爆炸图时用正交正视，不要继续用 ¾。隔离单件时把相机框在该件包围盒，旁边留 UI 空位——Atlas 用 `setViewOffset` 躲开检查面板，Blender 里用相机移到侧边或合成时留白。

## 零件族（Collection 怎么拆）

族 **不是** 官方说明书步骤，是从零件英文描述正则归类：

| 族 | 关键词大致 |
|----|------------|
| Body panels | panel, fairing, mudguard |
| Wheels & tyres | tyre/tire/wheel 开头 |
| Beams & frames | beam, liftarm, frame, technic brick |
| Axles & connectors | technic + axle/pin/connector/bush/joint/link |
| Engine & transmission | gear, engine, differential, clutch… |
| Steering & suspension | steering, suspension, wishbone, shock |
| Other | 其余 |

界面还有三个预设：All、Structure（梁+轴销）、Mechanisms（动力+悬挂）。

Blender：按族建 Collection，视口里开关眼睛图标就等于 Atlas 的 checkbox。城市场景同样：`COL_ROAD` `COL_BUILDING` `COL_VEG` `COL_PROP` `COL_VEHICLE`，过滤和爆炸都按 Collection，不要按「这一栋楼」一个大物体。

机盖/引擎盖：源文件子模型名带 `cofano` 记成 group；`bagagli` / `motore` 两个按钮只是 **沿 Y 平移 2 单位**，不模拟铰链、悬挂、传动。Blender 里也用空物体带一组实例做「揭盖」，不要一上来做刚体。

## 爆炸分两段

`explosionOffset(center, family, destination, amount)`：

1. **0–40%**：按族在水平面均匀摊开。角度 = `family / 族数 * 2π`，半径约 1.1。车身族额外抬高。仍认得是一辆车，只是「松开」。
2. **40–100%**：Smoothstep 插值到 **货架格子**。格子算法：按高度排序，按目标宽度折行，每件用自己的包围盒宽高 + 0.12 间隙。相同零件相同颜色也各占一格（可点选每一块，不是合并堆）。

完全摊开后相机改成能包住整块货架的距离。

Blender 做法：

- 每个实例存 `rest_matrix`（组装位）。
- GN 或脚本：族号 → 极坐标偏移；再采样货架 UV/格子。
- 用一个 0–1 的场景属性当 Explode，方便和时间轴、MCP 驱动。
- 货架阶段切正交前视图。

不要用 Particle 随机炸开。Atlas 的可读性来自 **族有方向、件有格子**。

## 点选与隔离

- 悬停识别、单击打开零件卡：名称、色名、同色同件数量、所属族。
- Isolate：只显示该件，相机记住旧位置，关闭后还原。
- 隐藏单件、按族关、搜索库，都是改 `visible`，网格仍在。
- 检查面板打开 **不改变画布尺寸、不移动模型**（overlay）。

Blender：Outliner 选中实例即可。做演示文件时给每件 Custom Property：`part_id` `color_name` `family`。Alt+H / H 对应显示恢复。不要为了隐藏去 Delete 网格数据。

## 和本目录其他文档的关系

- [风格总览](./风格总览.md) 管「长什么样」。本文管「3900 件或 200 栋楼怎么活下来」。
- [blender制作规范](./blender制作规范.md) 的 Collection、原点、GLB 单件小于 1MB，和本文的共享几何是同一条纪律。
- 卡通城市要 game-ready：路模块、树、灯必须是实例，禁止把整条街 Apply 成一份 mesh。
- 不要把 P1 的 36° 透视、ACES、金属色号套到软陶花园上。

## 明确不要从 Atlas 学的

- 用它的三角缓冲当最终美术网格（无平滑、无透明、无贴纸）。
- 把乐高商标造型当乐园或城市的建筑风格。
- 为揭盖做物理解算。
- 每件独立材质、独立 mesh 数据块。
