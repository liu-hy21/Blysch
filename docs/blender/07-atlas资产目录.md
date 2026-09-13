# 07 Atlas 资产目录

P1 查看器的**资产本体**在 `.agents/lib/lego-mclaren-p1-42172-atlas-main`，线上是 [lego-mclaren-p1-42172-atlas.vercel.app](https://lego-mclaren-p1-42172-atlas.vercel.app/)。本文记文件、字段、色表、件数和许可证。运行时怎么实例化、爆炸，见 [06 Atlas 积木实例化](./06-atlas积木实例化.md)。

不要把 `geometry.bin` 拷进 `docs/blender`。文档只描述结构，运行文件留在 Atlas 仓库。

## 1. 磁盘上有什么

| 路径 | 角色 | 大约体积 |
|------|------|----------|
| `assets/source/mclaren-p1-42172/model.io` | BrickLink Studio 原包（zip，头两字节 `PK`） | 源文件，勿改 |
| `assets/source/mclaren-p1-42172/README.md` | 出处说明 | — |
| `public/models/mclaren-p1-42172/model.json` | 零件、色、实例矩阵 | 657 KB |
| `public/models/mclaren-p1-42172/geometry.bin` | 共享 `Float32` 顶点 | 33.7 MB |
| `.cache/mclaren-p1-42172/` | 解包、primitive、中间 MPD | gitignore |
| `public/THIRD_PARTY.txt` | Human Atlas MIT 声明 | — |

浏览器用的只有后两个 runtime 文件。开发、构建都直接读仓库里已提交的这对文件。

## 2. 件数（实测）

从当前 `model.json` 扫出来的数，和测试锁死的一致：

| 项 | 值 |
|----|----|
| 可选实例 | **3905** |
| 独特零件（`meta` 键 / `.dat` 名） | **277** |
| 几何块 `geometries[]` | **280**（多数零件 1 块；带印刷的 3 种零件各 2 块） |
| 三角面 | **936 732**（`count` 以 float 计，每三角 9 个 float） |
| 色表条目 `colors` | 322（整份 LDConfig） |
| 实例真正用到的色 | **19** |
| 官方套装标称 | 3893；社区模型不同，展示牌 `targhetta` 被丢掉 |

测试还锁了：色号 `191` 必须是 `#FCAC00`；第一件平移 `matrix[12] === -229.0018`；轮族正好 8 件，零件名只有 `5428.dat` 和 `80279.dat`（四轮圈 + 四轮胎）。

## 3. `model.json` 字段

顶层四个键：`geometries` `instances` `meta` `colors`。

### geometries[]

一段共享缓冲上的切片，**按零件定义缓存**，不按实例复制。

```json
{ "offset": 0, "count": 3168, "color": "16" }
```

- `offset` / `count`：在 `geometry.bin` 里的 float 下标和长度。`count` 必须是 9 的倍数。
- `color`：LDraw 色号。`"16"` 表示「用实例自己的色」；印刷件会多一块固定色几何。

加载时：`floats.subarray(offset, offset + count)`，stride 3，再 `computeVertexNormals()`。没有 UV、没有 index buffer、没有边线。

### instances[]

每一块可点选的砖：

```json
{
  "name": "99008.dat",
  "color": "19",
  "group": "",
  "matrix": [ /* 16 个有限数字，列主序 4×4 */ ],
  "geometry": [0]
}
```

- `name`：LDraw 文件名，对应 `meta[name]`。
- `color`：实例色号。几何色为 `16` 时用这个。
- `group`：空字符串 = 车身主体。非空来自 Studio 子模型名。
- `matrix`：LDraw 空间。查看器再左乘 `Rx(π)`，再按整车包围盒居中并缩到最长边 = 8。
- `geometry`：本零件用到的 `geometries` 下标数组。

当前三组：

| group | 件数 | 界面 |
|-------|------|------|
| `""`（root） | 3350 | 整车 |
| `cofano bagagli` | 124 | Lift front cover，沿 Y +2 |
| `cofano motore` | 431 | Lift engine cover，沿 Y +2 |

`IsSubModel` 且文件名含 `targhetta` 的子模型整支跳过。`cofano` 出现在路径里时，group 被设成该子模型名，供揭盖过滤。

### meta

`277` 条：`零件文件名 → 英文零件描述`（源文件 `0 ` 注释行，可能带 `\r`）。界面上的 Part name、族分类都吃这个字符串，不是官方装配步骤。

### colors

`CODE → { name, hex }`，来自官方 `LDConfig.ldr` 的 `0 !COLOUR`。透明色有 ALPHA，但转换进查看器后 **仍当不透明实色画**（Trans Clear / Trans Red 也是 MeshStandard，没有 transmission）。

## 4. `geometry.bin`

- 裸 `Float32Array`，小端，仅位置 xyz。
- 长度必须覆盖最大的 `offset + count`。
- 转换时四边形拆成两个三角；非法坐标会直接失败。
- 故意省略：条件边、BFC 平滑、纹理、印刷贴图（印刷只剩第二块纯色几何）。

## 5. 重建

在 Atlas 仓库根目录：

```sh
npm ci
npm run model:prepare   # prepare-model.py + convert-model.mjs
npm run check
```

需要 Python 3、curl、访问 `library.ldraw.org`。改了 `model.io` 之后必须 **成对提交** `model.json` 和 `geometry.bin`。

`prepare-model.py`：从 zip 取 `model.ldr` + `model2.ldr`，把 Studio `-1` 色改成 `16`，拉缺失 primitive，打成 `packed/model.mpd`，再拉 `LDConfig.ldr`。色对照用两份 ldr 里同序的 `1 ` 行对齐。

## 6. 族分布（运行时分类，不是资产分包）

`familyFor(描述)` 正则，结果写进内存，不写进 json。

| 族 | 件数 | UI 色 |
|----|------|--------|
| Axles & connectors | 2447 | `#7994aa` |
| Beams & frames | 860 | `#8f9983` |
| Body panels | 234 | `#d97922` |
| Other elements | 178 | `#b2aea2` |
| Engine & transmission | 131 | `#b49e61` |
| Steering & suspension | 47 | `#927c97` |
| Wheels & tyres | 8 | `#414640` |

预设：All；Structure = 梁+轴销；Mechanisms = 动力+悬挂。易错：带 Wheel 字样的齿轮仍归传动；减震活塞不归引擎。

## 7. 实际用到的 19 色

按实例数。金属三色在查看器里 metalness 0.5，其余 0.02。

| 色号 | 名称 | Hex | 件数 |
|------|------|-----|------|
| 0 | Black | `#1B2A34` | 1667 |
| 1 | Blue | `#1E5AA8` | 516 |
| 71 | Light Bluish Grey | `#969696` | 498 |
| 4 | Red | `#B40000` | 379 |
| 191 | Bright Light Orange | `#FCAC00` | 291 |
| 72 | Dark Bluish Grey | `#646464` | 212 |
| 14 | Yellow | `#FAC80A` | 105 |
| 19 | Tan | `#D7BA8C` | 67 |
| 15 | White | `#F4F4F4` | 36 |
| 70 | Reddish Brown | `#5F3109` | 33 |
| 27 | Lime | `#A5CA18` | 27 |
| 82 | Metallic Gold | `#DBAC34` | 16 |
| 148 | Pearl Dark Grey | `#484D48` | 14 |
| 321 | Dark Azure | `#469BC3` | 13 |
| 47 | Trans Clear | `#FCFCFC` | 12 |
| 25 | Orange | `#D67923` | 8 |
| 36 | Trans Red | `#C91A09` | 5 |
| 2 | Green | `#00852B` | 4 |
| 383 | Chrome Silver | `#CECECE` | 2 |

P1 外观阅读：黑骨架 + 蓝销 + 浅灰轴 + 红短轴 + 亮橙装饰/车身点缀。Blender 里做积木着色，优先这 19 个，不要一次倒进 322 条色表。

## 8. 出现最多的零件（同件同色）

说明连接件才是实例化的主力：一种 pin 出现几百次，必须共享 mesh。

| 文件 | 色 | 次数 | 描述 |
|------|----|------|------|
| 2780.dat | Black | 620 | Pin with Short Friction Ridges |
| 6558.dat | Blue | 312 | Pin 3L with Friction Ridges |
| 43093.dat | Blue | 191 | Axle 1L with Pin |
| 32062.dat | Red | 124 | Axle 2L Notched |
| 11214.dat | Red | 101 | Axle 1L with Pin 2L |
| 4519.dat | Light Bluish Grey | 60 | Axle 3L |
| 18651.dat | Black | 55 | Axle 2L with Pin |
| 89678.dat | Red | 48 | Pin 1/2 |
| 32054.dat | Black | 47 | Pin 3L + Stop Bush |
| 60483.dat | Black | 42 | Liftarm Thick 1×2 |

带印刷、因此有 **两块几何** 的零件：

- `71682pb009.dat` Curved panel + Silver P1
- `60483pb010.dat` Liftarm 1×2 + Silver P1
- `93273pb220.dat` Slope curved + Black McLaren logo

## 9. 许可证（资产不能当本仓库 MIT）

- 查看器自己的代码：MIT。
- 交互/货架算法参考 [Human Atlas](https://github.com/ashemag/human-atlas)，声明在 `THIRD_PARTY.txt`。
- 模型：[Vito Tarantini 的 Studio 文件](https://forums.ldraw.org/thread-27891-post-56319.html)（2025-05，LDraw 论坛）。仓库 **没有** 记录该模型的再分发许可。
- 零件几何 primitive：[LDraw 许可](https://www.ldraw.org/article/349.html)。
- 产品对照：[LEGO Technic McLaren P1 42172 说明书](https://www.lego.com/en-us/service/building-instructions/42172)。
- LEGO、McLaren 是各自商标。

本目录的风格文档可以引用结构与色号；**不要**把 `.io` / `.bin` 当乐园或卡通城市的可发布网格。

## 10. 给 Blender / 城市资产的直接结论

1. 资产分两层：**定义**（277 种 mesh + 色）和 **放置**（3905 份矩阵）。城市的路灯、树、车位同样拆。
2. json 只放索引和变换；重顶点进独立二进制。Blender 里就是 library `.blend` + 场景里的实例。
3. 子模型名是唯一的「装配分组」资产（行李盖 / 引擎盖）。族是事后正则，不能当源文件结构。
4. 印刷 = 额外几何块，不是贴图。轻量管线可以接受。
5. 色只要实例用到的那一张短表。
