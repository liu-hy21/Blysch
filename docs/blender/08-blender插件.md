# 08 Blender 插件（微缩 / 游戏资产）

给卡通城市、软陶家具、低模建筑装的一套。来源是 [extensions.blender.org](https://extensions.blender.org/)，已写入 Blender **5.2.1** 用户配置。已打开 **Allow Online Access**。

重启一次带界面的 Blender 后全部生效。PolyQuilt 在无窗口模式下不能初始化 GPU，已标成启用，GUI 打开才会加载。

## 建模（倒角盒子、布尔窗洞、路牙）

| 插件 | 干什么 |
|------|--------|
| Extra Mesh Objects | 齿轮、管、圆角墙这类额外网格体 |
| Extra Curve Objects | 曲线螺旋、花环 |
| Bool Tool / Booltron | 窗洞、路牙缺口、建筑挖空 |
| LoopTools | 圆、松弛、桥接，做球树冠、凉亭环 |
| F2 | 快速补面 |
| tinyCAD | 边相交、延长，路网对缝 |
| Edit Mesh Tools | 一堆编辑态小工具 |
| BoltFactory | 螺丝螺母（停车桩、充电桩细节） |
| Bsurfaces | 用笔画出补面 |

## 摆放与建筑

| 插件 | 干什么 |
|------|--------|
| Archimesh | 房间、门、窗积木 |
| Align Tools | 家具对齐台座 |
| Place Helper | 摆放、阵列、散射（树、花盆实例） |
| A.N.T.Landscape | 需要起伏地面时用，默认花园不要上 |
| Add Camera Rigs | 跟拍相机；等距静帧仍用手摆正交相机 |
| MeasureIt | 核对 10m 路模块尺寸 |

## 资产库与导出

| 插件 | 干什么 |
|------|--------|
| ACT Game Asset Creation Toolset | 低模游戏件整理、导出 |
| Game Asset Optimizer | 减面、贴图尺寸 |
| LODify | LOD / 视口减负 |
| All Objects into Assets | 选中 Collection 进 Asset Browser |
| Batch Asset Placer | 从浏览器批量摆到 3D 游标 |
| Quick Asset Saver | 快速存成本地资产 |
| glTF 2.0 | 核心自带，导 GLB |
| 3D Print Toolbox | 查非流形、厚度（不是真去打印） |
| Tissue | 重复构件阵列（栏杆、瓦垄简化） |

## 材质 / UV / 其它

| 插件 | 干什么 |
|------|--------|
| Node Wrangler | 核心自带。`Ctrl+Shift+点击` 预览节点 |
| Magic UV | 箱子式 UV，印刷件用 |
| Copy Attributes Menu | 复制变换/材质到实例 |
| Modifier List | 修改器面板更好用（Bevel 堆叠） |
| Rigify | 人偶骨架；街角咖啡小人才用 |
| Blender MCP | Cursor 连 Blender |

## 打开 GUI 后看哪里

- **Add → Mesh** 多 Extra Objects、Bolt
- **N 面板** Bool Tool、Place Helper、ACT、Archimesh、MeasureIt
- **Edit Mode** 右键 / W：LoopTools、F2、tinyCAD
- **Edit → Preferences → Extensions** 已装列表

## 没装的（有意）

- Hard Ops / Boxcutter / Kit Ops：收费。
- BlenderKit / Poly Haven 独立插件：官方扩展目录里没有同名包；MCP 已带 Poly Haven / Sketchfab 下载。
- Images as Planes：5.2 已并进核心导入，扩展名不存在。

## 重装命令

```text
blender --online-mode --command extension install --sync --enable bool_tool,booltron,looptools,extra_mesh_objects,extra_curve_objectes,f2,tinycad_mesh_tools,boltfactory,copy_attributes_menu,add_camera_rigs,archimesh,align_tools,edit_mesh_tools,magic_uv,measureit,print3d_toolbox,Modifier_List_Fork,PlaceHelper,act_game_asset_creation_toolset,asset_optimizer,all_objects_into_assets,batch_asset_placer,Quick_Asset_Saver,PolyQuilt_Fork,bsurfaces_gpl_edition,lodify_optimizer,antlandscape,tissue
```

本机可执行文件：`C:\Users\liuha\AppData\Local\Programs\Blender 5.2\blender.exe`
