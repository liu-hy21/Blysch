"""Rebuild park house B1 as a pastel dollhouse basement lounge (family E + cozy home).

Layout follows docs/负一楼.md: open entertainment floor, no inner walls.
Mansion scale: footprint ~13.7x9.6, roughly 2.2x the L1 floor area.
Zones: bar (NW) + wine cellar (W wall) + pool table (center-west),
home theater (NE) + gym (SW) + lounge (SE), stair core on north wall,
light-well glass band on the low south stub with daylight patches inside.
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(r"e:\Hangyu\VibeCoding\Python\radar\Blysch")
BLEND = ROOT / "docs" / "blender" / "assets" / "park-house-b1.blend"
GLB = ROOT / "public" / "models" / "park" / "house-b1.glb"
PNG = ROOT / "docs" / "blender" / "assets" / "park-house-b1.png"

FLOOR_Z = 0.18  # plank top

PAL = {
    "wall": (0.541, 0.478, 0.400, 1),      # #8a7a66 warm grey-brown
    "wall_hi": (0.604, 0.541, 0.463, 1),   # #9a8a76
    "wall_dk": (0.478, 0.416, 0.345, 1),   # #7a6a58
    "plinth": (0.141, 0.110, 0.086, 1),    # #241c16
    "plinth_hi": (0.239, 0.165, 0.118, 1), # #3d2a1e
    "floor": (0.420, 0.318, 0.220, 1),     # #6b5138 dark wood
    "floor_hi": (0.463, 0.357, 0.247, 1),  # lighter plank
    "floor_dk": (0.341, 0.247, 0.173, 1),  # #573f2c groove
    "walnut": (0.353, 0.227, 0.118, 1),    # #5a3a1e
    "walnut_dk": (0.239, 0.165, 0.118, 1), # #3d2a1e
    "walnut_hi": (0.545, 0.384, 0.224, 1), # #8b6239
    "velvet": (0.541, 0.227, 0.196, 1),    # #8a3a32 brick red
    "velvet_dk": (0.416, 0.165, 0.149, 1), # #6a2a26
    "velvet_hi": (0.627, 0.290, 0.243, 1), # #a04a3e
    "felt": (0.290, 0.478, 0.188, 1),      # #4a7a30
    "felt_dk": (0.239, 0.400, 0.149, 1),   # #3d6626
    "mat_dk": (0.239, 0.227, 0.204, 1),    # #3d3a34 gym mat
    "ink": (0.110, 0.098, 0.090, 1),       # #1c1917
    "gold": (0.769, 0.627, 0.416, 1),      # #c4a06a
    "lamp": (0.894, 0.765, 0.416, 1),      # #e4c36a warm lamp
    "spill": (0.910, 0.831, 0.541, 1),     # #e8d48a light spill
    "well": (0.933, 0.949, 0.863, 1),      # #eef2dc light-well glass
    "daylight": (0.957, 0.941, 0.847, 1),  # #f4f0d8 sun patch
    "screen": (0.847, 0.910, 0.894, 1),    # #d8e8e4 theater screen
    "grey": (0.784, 0.753, 0.722, 1),      # #c8c0b8
    "grey_dk": (0.541, 0.518, 0.486, 1),   # #8a847c
    "grey_hi": (0.910, 0.886, 0.855, 1),   # #e8e2da
    "steel": (0.239, 0.196, 0.157, 1),     # #3d3228
    "mirror": (0.660, 0.780, 0.830, 1),    # pale blue-grey mirror
    "glass": (0.850, 0.900, 0.880, 1),     # cellar door glass
    "white": (0.960, 0.950, 0.920, 1),
    "cream": (0.930, 0.900, 0.840, 1),
}


def clear_scene():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for mat_ in list(bpy.data.materials):
        bpy.data.materials.remove(mat_)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col)
    base = bpy.data.collections.get("Collection")
    if base is None:
        base = bpy.data.collections.new("Collection")
        bpy.context.scene.collection.children.link(base)


def coll(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def mat(name, color, roughness=0.5, emit=0.0):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    bsdf.inputs["Emission Color"].default_value = color
    bsdf.inputs["Emission Strength"].default_value = emit
    return m


def put(ob, col, parent=None):
    for c in list(ob.users_collection):
        c.objects.unlink(ob)
    col.objects.link(ob)
    if parent is not None:
        world = ob.matrix_world.copy()
        ob.parent = parent
        ob.matrix_parent_inverse = parent.matrix_world.inverted()
        ob.matrix_world = world
    return ob


def finish(ob, bevel=0.03):
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = ob.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(30)
        mod.affect = "EDGES"
        mod.offset_type = "WIDTH"
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(50))
    except Exception:
        bpy.ops.object.shade_smooth()
    ob.select_set(False)
    return ob


def box(name, loc, dims, material, col, parent=None, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.dimensions = dims
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def cyl(name, loc, radius, depth, material, col, parent=None, bevel=0.012, verts=20, rot=None):
    kwargs = dict(vertices=verts, radius=radius, depth=depth, location=loc)
    if rot is not None:
        kwargs["rotation"] = rot
    bpy.ops.mesh.primitive_cylinder_add(**kwargs)
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def sphere(name, loc, radius, material, col, parent=None, bevel=0.0):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=16, ring_count=10, radius=radius, location=loc
    )
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def empty(name, loc, col):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=loc)
    ob = bpy.context.active_object
    ob.name = name
    put(ob, col)
    return ob


def setup_world():
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.72, 0.75, 0.80, 1)
    bg.inputs["Strength"].default_value = 0.55


def mesh_bounds():
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for ob in bpy.data.objects:
        if ob.type != "MESH":
            continue
        for corner in ob.bound_box:
            world = ob.matrix_world @ Vector(corner)
            lo.x, lo.y, lo.z = min(lo.x, world.x), min(lo.y, world.y), min(lo.z, world.z)
            hi.x, hi.y, hi.z = max(hi.x, world.x), max(hi.y, world.y), max(hi.z, world.z)
    return lo, hi


def setup_camera_lights():
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=(9.4, -9.4, 8.2))
    cam = bpy.context.active_object
    cam.name = "CAM_ISO"
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 13.6
    cam.data.clip_start = 0.1
    cam.data.clip_end = 80
    cam.rotation_euler = (math.radians(54.8), 0.0, math.radians(45.0))
    scene.camera = cam
    put(cam, coll("CAM"))

    env = coll("ENV")
    bpy.ops.object.light_add(type="SUN", location=(5.5, -4.0, 9.0))
    sun = bpy.context.active_object
    sun.name = "L_Sun"
    sun.rotation_euler = (math.radians(42), math.radians(8), math.radians(48))
    sun.data.energy = 1.0
    sun.data.angle = math.radians(50)
    sun.data.color = (1.0, 0.88, 0.72)
    put(sun, env)

    bpy.ops.object.light_add(type="AREA", location=(-8.5, -7.0, 8.0))
    fill = bpy.context.active_object
    fill.name = "L_Fill"
    fill.rotation_euler = (math.radians(70), 0, math.radians(-35))
    fill.data.energy = 70
    fill.data.size = 10
    fill.data.color = (1.0, 0.90, 0.78)
    put(fill, env)

    for name, loc, energy, color in (
        ("L_Bar", (-3.9, 3.1, 2.5), 70, (1.0, 0.82, 0.55)),
        ("L_Lounge", (3.9, -1.8, 2.5), 60, (1.0, 0.80, 0.50)),
        ("L_Well", (0.8, -3.7, 1.8), 55, (0.95, 0.95, 0.85)),
        ("L_Pool", (-2.0, 0.3, 2.7), 40, (1.0, 0.86, 0.60)),
        ("L_Theater", (4.3, 2.4, 2.3), 25, (1.0, 0.75, 0.50)),
    ):
        bpy.ops.object.light_add(type="POINT", location=loc)
        pt = bpy.context.active_object
        pt.name = name
        pt.data.energy = energy
        pt.data.color = color
        pt.data.shadow_soft_size = 0.6
        put(pt, env)


def frame_camera():
    lo, hi = mesh_bounds()
    center = (lo + hi) * 0.5
    span = max(hi.x - lo.x, hi.y - lo.y, hi.z - lo.z, 1.0)
    cam = bpy.data.objects["CAM_ISO"]
    dist = span * 1.2
    cam.location = center + Vector((dist, -dist, dist * 0.78))
    cam.data.ortho_scale = span * 1.28
    for area in bpy.context.screen.areas:
        if area.type != "VIEW_3D":
            continue
        for space in area.spaces:
            if space.type == "VIEW_3D":
                space.region_3d.view_perspective = "CAMERA"


def build_shell(mats, geo):
    box("Plinth", (0, 0.05, -0.16), (14.55, 10.70, 0.28), mats["plinth"], geo, bevel=0.08)
    box("Skirt", (0, 0.05, 0.02), (14.12, 10.27, 0.14), mats["wall_dk"], geo, bevel=0.05)
    box("FloorBase", (0, 0.06, 0.115), (13.68, 9.60, 0.09), mats["floor_dk"], geo, bevel=0.02)
    # dark wood planks running east-west with fine grooves
    for i in range(11):
        y = -4.185 + i * 0.87
        tone = mats["floor"] if i % 2 == 0 else mats["floor_hi"]
        box(f"Plank{i}", (0, y, 0.15), (13.68, 0.85, 0.06), tone, geo, bevel=0.012)

    box("WallWest", (-6.72, 0.12, 1.28), (0.18, 9.6, 2.28), mats["wall"], geo, bevel=0.045)
    box("WallEast", (6.72, 0.12, 1.28), (0.18, 9.6, 2.28), mats["wall"], geo, bevel=0.045)
    box("WallNorth", (0, 4.83, 1.28), (13.62, 0.18, 2.28), mats["wall"], geo, bevel=0.045)
    # dark cut-edge caps nod to the deep-brown basement ceiling
    box("WallWestCap", (-6.72, 0.12, 2.44), (0.22, 9.64, 0.08), mats["plinth_hi"], geo, bevel=0.02)
    box("WallEastCap", (6.72, 0.12, 2.44), (0.22, 9.64, 0.08), mats["plinth_hi"], geo, bevel=0.02)
    box("WallNorthCap", (0, 4.83, 2.44), (13.66, 0.22, 0.08), mats["plinth_hi"], geo, bevel=0.02)

    # south side: sealed, low stub full width (no door on B1)
    box("SouthStub", (0, -4.73, 0.34), (13.62, 0.16, 0.4), mats["wall"], geo, bevel=0.03)
    box("SouthStubCap", (0, -4.73, 0.56), (13.66, 0.2, 0.06), mats["plinth_hi"], geo, bevel=0.015)

    # light-well glass band sitting on the south stub (cols 22-40 of the plan, widened)
    box("WellGlass", (0.8, -4.73, 0.79), (5.2, 0.1, 0.44), mats["well"], geo, bevel=0.015)
    box("WellRailTop", (0.8, -4.73, 1.04), (5.44, 0.14, 0.08), mats["walnut_dk"], geo, bevel=0.015)
    box("WellPostL", (-1.86, -4.73, 0.79), (0.08, 0.14, 0.52), mats["walnut_dk"], geo, bevel=0.012)
    box("WellPostR", (3.46, -4.73, 0.79), (0.08, 0.14, 0.52), mats["walnut_dk"], geo, bevel=0.012)
    for i, x in enumerate((-0.93, -0.07, 0.8, 1.67, 2.53)):
        box(f"WellMullion{i}", (x, -4.73, 0.79), (0.05, 0.12, 0.44), mats["walnut_dk"], geo, bevel=0.008)
    # one daylight spill on the floor, clear of the stub shadow from the iso camera
    box("WellDaylight", (0.8, -3.85, 0.19), (3.4, 0.55, 0.02), mats["daylight"], geo, bevel=0.01)


def build_stairs(mats, geo, prop, parent):
    """Stair core against the north wall, set piece only (not climbable)."""
    box("ST_SideWall", (-0.2, 3.45, 1.1), (0.1, 2.3, 1.9), mats["wall"], geo, parent, 0.03)
    box("ST_SideCap", (-0.2, 3.45, 2.06), (0.14, 2.34, 0.08), mats["wall_hi"], geo, parent, 0.015)
    for i in range(6):
        z = 0.28 + i * 0.21
        y = 2.75 + i * 0.24
        box(f"ST_Step{i}", (0.55, y, z), (1.3, 0.3, 0.12), mats["walnut_hi"], geo, parent, 0.018)
    box("ST_Rail", (1.28, 3.35, 1.62), (0.05, 1.6, 0.05), mats["walnut_dk"], prop, parent, 0.008)
    for i, y in enumerate((2.75, 3.35, 3.95)):
        box(f"ST_RailPost{i}", (1.28, y, 1.42), (0.04, 0.04, 0.36), mats["walnut_dk"], prop, parent, 0.006)
    box("ST_UnderDoor", (0.55, 4.7, 0.9), (0.9, 0.08, 1.5), mats["walnut_dk"], prop, parent, 0.015)


def build_bar(mats, prop, parent):
    # back bar against the north wall
    box("BAR_BackCab", (-3.9, 4.42, FLOOR_Z + 0.42), (2.8, 0.5, 0.84), mats["walnut"], prop, parent, 0.03)
    box("BAR_BackTop", (-3.9, 4.4, FLOOR_Z + 0.87), (2.86, 0.56, 0.08), mats["walnut_hi"], prop, parent, 0.015)
    box("BAR_Shelf", (-3.9, 4.56, 1.62), (2.8, 0.22, 0.05), mats["walnut"], prop, parent, 0.012)
    box("BAR_ShelfLight", (-3.9, 4.54, 1.585), (2.7, 0.06, 0.03), mats["spill"], prop, parent, 0.006)
    box("BAR_ShelfEndL", (-5.28, 4.56, 1.5), (0.06, 0.2, 0.28), mats["walnut_dk"], prop, parent, 0.01)
    box("BAR_ShelfEndR", (-2.52, 4.56, 1.5), (0.06, 0.2, 0.28), mats["walnut_dk"], prop, parent, 0.01)
    bottle_mats = [mats["felt_dk"], mats["velvet"], mats["gold"], mats["cream"], mats["velvet_hi"]]
    for i in range(7):
        cyl(
            f"BAR_ShelfBottle{i}", (-5.08 + i * 0.4, 4.56, 1.755), 0.05, 0.22,
            bottle_mats[i % 5], prop, parent, 0.01,
        )
    for i, x in enumerate((-4.7, -4.3, -3.7, -3.3)):
        cyl(f"BAR_TopBottle{i}", (x, 4.32, FLOOR_Z + 1.02), 0.045, 0.2, bottle_mats[(i + 2) % 5], prop, parent, 0.01)

    # front counter with a gold kick
    box("BAR_Counter", (-3.9, 3.35, FLOOR_Z + 0.45), (2.6, 0.42, 0.9), mats["walnut_dk"], prop, parent, 0.035)
    box("BAR_CounterTop", (-3.9, 3.35, FLOOR_Z + 0.92), (2.72, 0.5, 0.08), mats["walnut_hi"], prop, parent, 0.018)
    box("BAR_Kick", (-3.9, 3.125, FLOOR_Z + 0.08), (2.5, 0.04, 0.1), mats["gold"], prop, parent, 0.008)
    for i, x in enumerate((-4.55, -4.05, -3.35)):
        cyl(f"BAR_Cup{i}", (x, 3.32, FLOOR_Z + 1.0), 0.04, 0.07, mats["cream"], prop, parent, 0.008)

    for i, x in enumerate((-4.9, -4.3, -3.6, -3.0)):
        cyl(f"BAR_Stool{i}", (x, 2.72, FLOOR_Z + 0.44), 0.15, 0.08, mats["velvet"], prop, parent, 0.02)
        cyl(f"BAR_StoolLeg{i}", (x, 2.72, FLOOR_Z + 0.22), 0.035, 0.4, mats["walnut"], prop, parent, 0.006)
        cyl(f"BAR_StoolBase{i}", (x, 2.72, FLOOR_Z + 0.02), 0.09, 0.04, mats["walnut_dk"], prop, parent, 0.008)


def build_wine_cellar(mats, prop, parent):
    """Rack on the west wall with a glass front."""
    box("WINE_Back", (-6.58, 0.7, 1.12), (0.05, 2.2, 1.9), mats["walnut_dk"], prop, parent, 0.01)
    box("WINE_SideS", (-6.4, -0.37, 1.12), (0.36, 0.06, 1.9), mats["walnut"], prop, parent, 0.012)
    box("WINE_SideN", (-6.4, 1.77, 1.12), (0.36, 0.06, 1.9), mats["walnut"], prop, parent, 0.012)
    box("WINE_Top", (-6.4, 0.7, 2.05), (0.38, 2.2, 0.07), mats["walnut_hi"], prop, parent, 0.012)
    box("WINE_Kick", (-6.4, 0.7, FLOOR_Z + 0.05), (0.38, 2.2, 0.1), mats["walnut_dk"], prop, parent, 0.01)
    bottle_mats = [mats["felt_dk"], mats["velvet"], mats["gold"], mats["cream"], mats["felt"]]
    for s, z in enumerate((0.72, 1.22, 1.72)):
        box(f"WINE_Shelf{s}", (-6.4, 0.7, z), (0.36, 2.14, 0.05), mats["walnut"], prop, parent, 0.01)
        for i in range(7):
            cyl(
                f"WINE_Bottle{s}_{i}", (-6.42, -0.26 + i * 0.32, z + 0.135), 0.045, 0.22,
                bottle_mats[(s + i) % 5], prop, parent, 0.008,
            )
    box("WINE_GlassDoor", (-6.205, 0.7, 1.12), (0.03, 2.14, 1.86), mats["glass"], prop, parent, 0.008)
    box("WINE_DoorStile", (-6.195, 1.72, 1.12), (0.05, 0.06, 1.86), mats["walnut_dk"], prop, parent, 0.008)
    cyl("WINE_DoorKnob", (-6.165, 1.66, 1.1), 0.028, 0.05, mats["gold"], prop, parent, 0.004, rot=(0, math.radians(90), 0))


def build_pool(mats, prop, parent):
    box("POOL_Rug", (-2.0, 0.3, FLOOR_Z + 0.015), (3.4, 2.0, 0.03), mats["velvet_dk"], prop, parent, 0.02)
    box("POOL_RugIn", (-2.0, 0.3, FLOOR_Z + 0.028), (3.2, 1.8, 0.015), mats["velvet"], prop, parent, 0.01)
    cx, cy = -2.0, 0.3
    for i, (dx, dy) in enumerate(((-0.62, -0.32), (0.62, -0.32), (-0.62, 0.32), (0.62, 0.32))):
        box(f"POOL_Leg{i}", (cx + dx, cy + dy, FLOOR_Z + 0.31), (0.12, 0.12, 0.62), mats["walnut_dk"], prop, parent, 0.02)
    box("POOL_Frame", (cx, cy, FLOOR_Z + 0.62), (1.6, 0.95, 0.2), mats["walnut"], prop, parent, 0.035)
    box("POOL_Felt", (cx, cy, FLOOR_Z + 0.74), (1.44, 0.79, 0.04), mats["felt"], prop, parent, 0.02)
    pocket_xy = [(-0.7, -0.375), (0.7, -0.375), (-0.7, 0.375), (0.7, 0.375), (0, -0.385), (0, 0.385)]
    for i, (dx, dy) in enumerate(pocket_xy):
        cyl(f"POOL_Pocket{i}", (cx + dx, cy + dy, FLOOR_Z + 0.765), 0.05, 0.02, mats["ink"], prop, parent, 0.004)
    sphere("POOL_BallW", (cx - 0.25, cy - 0.05, FLOOR_Z + 0.795), 0.036, mats["white"], prop, parent)
    sphere("POOL_BallR", (cx + 0.28, cy + 0.08, FLOOR_Z + 0.795), 0.036, mats["velvet_hi"], prop, parent)
    sphere("POOL_BallG", (cx + 0.2, cy - 0.12, FLOOR_Z + 0.795), 0.036, mats["gold"], prop, parent)

    # cue rack on the west wall, south of the cellar
    box("POOL_CuePlate", (-6.58, -0.9, 1.05), (0.06, 0.5, 0.12), mats["walnut_dk"], prop, parent, 0.01)
    box("POOL_CueBase", (-6.5, -0.9, FLOOR_Z + 0.02), (0.12, 0.5, 0.05), mats["walnut_dk"], prop, parent, 0.008)
    for i, y in enumerate((-1.02, -0.78)):
        cyl(f"POOL_Cue{i}", (-6.5, y, FLOOR_Z + 0.68), 0.016, 1.32, mats["walnut_hi"], prop, parent, 0.004, verts=12)

    # spectator stools west of the rug
    for i, y in enumerate((0.05, 0.75)):
        cyl(f"POOL_Stool{i}", (-4.05, y, FLOOR_Z + 0.35), 0.14, 0.07, mats["grey"], prop, parent, 0.02)
        cyl(f"POOL_StoolLeg{i}", (-4.05, y, FLOOR_Z + 0.16), 0.03, 0.32, mats["walnut"], prop, parent, 0.005)
        cyl(f"POOL_StoolBase{i}", (-4.05, y, FLOOR_Z + 0.02), 0.09, 0.04, mats["walnut_dk"], prop, parent, 0.008)


def _recliner(mats, prop, parent, idx, x, y, base_z):
    # base_z is the platform top the chair stands on
    box(f"TH_Seat{idx}", (x, y, base_z + 0.13), (0.44, 0.46, 0.26), mats["velvet"], prop, parent, 0.05)
    box(f"TH_Back{idx}", (x, y - 0.27, base_z + 0.38), (0.44, 0.15, 0.56), mats["velvet_dk"], prop, parent, 0.045)
    box(f"TH_ArmL{idx}", (x - 0.27, y, base_z + 0.2), (0.1, 0.44, 0.28), mats["velvet_dk"], prop, parent, 0.03)
    box(f"TH_ArmR{idx}", (x + 0.27, y, base_z + 0.2), (0.1, 0.44, 0.28), mats["velvet_dk"], prop, parent, 0.03)


def build_theater(mats, prop, parent):
    box("TH_PanelL", (2.2, 4.72, 1.35), (0.5, 0.06, 1.7), mats["walnut_dk"], prop, parent, 0.02)
    box("TH_PanelR", (6.3, 4.72, 1.35), (0.5, 0.06, 1.7), mats["walnut_dk"], prop, parent, 0.02)
    box("TH_ScreenFrame", (4.3, 4.7, 1.6), (2.8, 0.1, 1.3), mats["ink"], prop, parent, 0.02)
    box("TH_Screen", (4.3, 4.635, 1.6), (2.64, 0.05, 1.14), mats["screen"], prop, parent, 0.012)
    box("TH_SpeakerL", (2.75, 4.55, 0.78), (0.24, 0.26, 1.2), mats["ink"], prop, parent, 0.02)
    box("TH_SpeakerR", (5.85, 4.55, 0.78), (0.24, 0.26, 1.2), mats["ink"], prop, parent, 0.02)
    # two riser steps, front row low / back row higher
    box("TH_RiserA", (4.3, 2.65, FLOOR_Z + 0.035), (3.6, 0.65, 0.07), mats["walnut_dk"], prop, parent, 0.02)
    box("TH_RiserB", (4.3, 1.6, FLOOR_Z + 0.09), (3.6, 0.85, 0.18), mats["walnut_dk"], prop, parent, 0.02)
    box("TH_RiserBTop", (4.3, 1.6, FLOOR_Z + 0.185), (3.56, 0.81, 0.02), mats["walnut"], prop, parent, 0.008)
    for i, x in enumerate((3.25, 4.0, 4.75, 5.5)):
        _recliner(mats, prop, parent, f"A{i}", x, 2.65, FLOOR_Z + 0.07)
        _recliner(mats, prop, parent, f"B{i}", x, 1.6, FLOOR_Z + 0.195)


def build_gym(mats, prop, parent):
    # treadmill facing north
    box("GYM_TreadBase", (-5.3, -1.15, FLOOR_Z + 0.06), (0.55, 1.05, 0.12), mats["mat_dk"], prop, parent, 0.03)
    box("GYM_TreadBelt", (-5.3, -1.15, FLOOR_Z + 0.13), (0.4, 0.85, 0.02), mats["ink"], prop, parent, 0.01)
    box("GYM_TreadPostL", (-5.5, -0.7, FLOOR_Z + 0.42), (0.06, 0.06, 0.6), mats["steel"], prop, parent, 0.01)
    box("GYM_TreadPostR", (-5.1, -0.7, FLOOR_Z + 0.42), (0.06, 0.06, 0.6), mats["steel"], prop, parent, 0.01)
    box("GYM_TreadBar", (-5.3, -0.7, FLOOR_Z + 0.72), (0.5, 0.08, 0.1), mats["steel"], prop, parent, 0.015)
    box("GYM_TreadDot", (-5.3, -0.745, FLOOR_Z + 0.74), (0.2, 0.03, 0.06), mats["screen"], prop, parent, 0.006)

    # exercise bike, rolling along y
    wheel_rot = (0, math.radians(90), 0)
    cyl("GYM_BikeWheelR", (-3.85, -1.75, FLOOR_Z + 0.22), 0.22, 0.05, mats["steel"], prop, parent, 0.01, rot=wheel_rot)
    cyl("GYM_BikeWheelF", (-3.85, -1.08, FLOOR_Z + 0.22), 0.22, 0.05, mats["steel"], prop, parent, 0.01, rot=wheel_rot)
    box("GYM_BikeFrame", (-3.85, -1.4, FLOOR_Z + 0.42), (0.06, 0.7, 0.08), mats["steel"], prop, parent, 0.01)
    box("GYM_BikeSeatPost", (-3.85, -1.72, FLOOR_Z + 0.6), (0.05, 0.05, 0.4), mats["steel"], prop, parent, 0.008)
    box("GYM_BikeSeat", (-3.85, -1.72, FLOOR_Z + 0.82), (0.22, 0.2, 0.07), mats["velvet_dk"], prop, parent, 0.02)
    box("GYM_BikeHandlePost", (-3.85, -1.08, FLOOR_Z + 0.62), (0.05, 0.05, 0.45), mats["steel"], prop, parent, 0.008)
    box("GYM_BikeHandle", (-3.85, -1.08, FLOOR_Z + 0.86), (0.34, 0.06, 0.05), mats["steel"], prop, parent, 0.01)

    box("GYM_Mat", (-2.2, -1.8, FLOOR_Z + 0.012), (1.1, 0.7, 0.025), mats["mat_dk"], prop, parent, 0.015)

    # weight rack + barbell + bench
    box("GYM_RackPostL", (-5.83, -3.3, FLOOR_Z + 0.57), (0.08, 0.3, 1.15), mats["steel"], prop, parent, 0.012)
    box("GYM_RackPostR", (-5.37, -3.3, FLOOR_Z + 0.57), (0.08, 0.3, 1.15), mats["steel"], prop, parent, 0.012)
    box("GYM_RackTop", (-5.6, -3.3, FLOOR_Z + 1.16), (0.56, 0.08, 0.07), mats["steel"], prop, parent, 0.01)
    cyl("GYM_Bar", (-5.6, -3.12, FLOOR_Z + 0.98), 0.02, 0.95, mats["steel"], prop, parent, 0.004, rot=wheel_rot)
    for i, x in enumerate((-5.98, -5.88, -5.32, -5.22)):
        cyl(f"GYM_Plate{i}", (x, -3.12, FLOOR_Z + 0.98), 0.11, 0.045, mats["mat_dk"], prop, parent, 0.008, rot=wheel_rot)
    box("GYM_Bench", (-5.6, -4.0, FLOOR_Z + 0.2), (0.35, 0.75, 0.1), mats["velvet_dk"], prop, parent, 0.02)
    box("GYM_BenchLegA", (-5.6, -3.78, FLOOR_Z + 0.08), (0.26, 0.08, 0.16), mats["steel"], prop, parent, 0.01)
    box("GYM_BenchLegB", (-5.6, -4.22, FLOOR_Z + 0.08), (0.26, 0.08, 0.16), mats["steel"], prop, parent, 0.01)

    # dumbbell rack between bench and bike
    box("GYM_DbShelf", (-4.3, -3.55, FLOOR_Z + 0.32), (0.8, 0.28, 0.07), mats["steel"], prop, parent, 0.012)
    box("GYM_DbLegL", (-4.65, -3.55, FLOOR_Z + 0.15), (0.06, 0.24, 0.3), mats["steel"], prop, parent, 0.01)
    box("GYM_DbLegR", (-3.95, -3.55, FLOOR_Z + 0.15), (0.06, 0.24, 0.3), mats["steel"], prop, parent, 0.01)
    for i, x in enumerate((-4.6, -4.4, -4.2, -4.0)):
        cyl(f"GYM_Dumbbell{i}", (x, -3.55, FLOOR_Z + 0.42), 0.05, 0.16, mats["mat_dk"], prop, parent, 0.008, rot=wheel_rot)

    # tall mirror on the west wall
    box("GYM_MirrorFrame", (-6.6, -2.2, 1.3), (0.06, 2.3, 1.4), mats["walnut_dk"], prop, parent, 0.015)
    box("GYM_Mirror", (-6.565, -2.2, 1.3), (0.03, 2.18, 1.28), mats["mirror"], prop, parent, 0.01)


def build_lounge(mats, prop, parent):
    # big rug anchoring the lounge zone
    box("LNG_Rug", (3.9, -1.9, FLOOR_Z + 0.008), (3.8, 3.0, 0.02), mats["cream"], prop, parent, 0.02)

    # sectional main sofa facing south toward the card table
    box("LNG_SofaBase", (3.9, -0.8, FLOOR_Z + 0.21), (2.2, 0.62, 0.36), mats["grey"], prop, parent, 0.045)
    box("LNG_SofaBack", (3.9, -0.5, FLOOR_Z + 0.5), (2.2, 0.2, 0.6), mats["grey_dk"], prop, parent, 0.04)
    box("LNG_SofaArmL", (2.72, -0.8, FLOOR_Z + 0.35), (0.16, 0.62, 0.45), mats["grey_dk"], prop, parent, 0.03)
    box("LNG_SofaArmR", (5.08, -0.8, FLOOR_Z + 0.35), (0.16, 0.62, 0.45), mats["grey_dk"], prop, parent, 0.03)
    box("LNG_PillowA", (3.3, -0.62, FLOOR_Z + 0.5), (0.28, 0.15, 0.2), mats["grey_hi"], prop, parent, 0.03)
    box("LNG_PillowB", (3.9, -0.62, FLOOR_Z + 0.5), (0.28, 0.15, 0.2), mats["velvet_hi"], prop, parent, 0.03)
    box("LNG_PillowC", (4.5, -0.62, FLOOR_Z + 0.5), (0.28, 0.15, 0.2), mats["grey_hi"], prop, parent, 0.03)

    # chaise along the east side, facing west
    box("LNG_ChaiseBase", (5.7, -2.0, FLOOR_Z + 0.18), (0.62, 1.6, 0.3), mats["grey"], prop, parent, 0.04)
    box("LNG_ChaiseBack", (6.02, -2.0, FLOOR_Z + 0.44), (0.18, 1.6, 0.55), mats["grey_dk"], prop, parent, 0.035)
    box("LNG_ChaisePillow", (5.72, -1.55, FLOOR_Z + 0.42), (0.16, 0.28, 0.18), mats["grey_hi"], prop, parent, 0.03)

    # card table: walnut + green felt inlay, four stools
    box("LNG_TableTop", (3.6, -2.3, FLOOR_Z + 0.42), (0.9, 0.9, 0.07), mats["walnut"], prop, parent, 0.025)
    box("LNG_TableFelt", (3.6, -2.3, FLOOR_Z + 0.46), (0.68, 0.68, 0.02), mats["felt"], prop, parent, 0.01)
    for i, (dx, dy) in enumerate(((-0.36, -0.36), (0.36, -0.36), (-0.36, 0.36), (0.36, 0.36))):
        box(f"LNG_TableLeg{i}", (3.6 + dx, -2.3 + dy, FLOOR_Z + 0.2), (0.07, 0.07, 0.4), mats["walnut_dk"], prop, parent, 0.01)
    box("LNG_Cards", (3.42, -2.22, FLOOR_Z + 0.48), (0.1, 0.07, 0.015), mats["white"], prop, parent, 0.003)
    cyl("LNG_Chips", (3.78, -2.38, FLOOR_Z + 0.485), 0.035, 0.03, mats["velvet"], prop, parent, 0.004)
    for i, (x, y) in enumerate(((2.85, -2.3), (4.35, -2.3), (3.6, -1.55), (3.6, -3.05))):
        cyl(f"LNG_Stool{i}", (x, y, FLOOR_Z + 0.24), 0.14, 0.07, mats["grey"], prop, parent, 0.02)
        cyl(f"LNG_StoolLeg{i}", (x, y, FLOOR_Z + 0.1), 0.03, 0.2, mats["walnut"], prop, parent, 0.005)

    # bookshelf on the east wall
    box("LNG_ShelfBack", (6.58, -3.6, 1.0), (0.05, 1.1, 1.55), mats["walnut_dk"], prop, parent, 0.01)
    box("LNG_ShelfSideS", (6.4, -4.12, 1.0), (0.36, 0.06, 1.55), mats["walnut"], prop, parent, 0.012)
    box("LNG_ShelfSideN", (6.4, -3.08, 1.0), (0.36, 0.06, 1.55), mats["walnut"], prop, parent, 0.012)
    box("LNG_ShelfTop", (6.4, -3.6, 1.76), (0.38, 1.1, 0.06), mats["walnut_hi"], prop, parent, 0.012)
    book_mats = [mats["cream"], mats["velvet"], mats["felt_dk"], mats["gold"]]
    for s, z in enumerate((0.7, 1.25)):
        box(f"LNG_Shelf{s}", (6.4, -3.6, z), (0.36, 1.04, 0.05), mats["walnut"], prop, parent, 0.01)
        for i, y in enumerate((-3.95, -3.75, -3.5, -3.3)):
            box(f"LNG_Book{s}_{i}", (6.4, y, z + 0.155), (0.2, 0.05, 0.26), book_mats[(s + i) % 4], prop, parent, 0.006)

    # floor lamp beside the chaise
    cyl("LNG_LampBase", (5.9, -0.55, FLOOR_Z + 0.02), 0.09, 0.04, mats["walnut_dk"], prop, parent, 0.008)
    cyl("LNG_LampPole", (5.9, -0.55, FLOOR_Z + 0.65), 0.03, 1.3, mats["walnut_dk"], prop, parent, 0.006)
    cyl("LNG_LampShade", (5.9, -0.55, FLOOR_Z + 1.35), 0.11, 0.16, mats["lamp"], prop, parent, 0.015)

    # wall lamp on the east wall beside the sofa (per spec)
    box("LNG_WallLampArm", (6.56, -0.8, 1.66), (0.12, 0.06, 0.05), mats["gold"], prop, parent, 0.008)
    cyl("LNG_WallLampShade", (6.48, -0.8, 1.56), 0.09, 0.13, mats["lamp"], prop, parent, 0.015)


def export_glb():
    bpy.ops.object.select_all(action="DESELECT")
    for ob in bpy.data.objects:
        if ob.type == "MESH":
            ob.select_set(True)
    GLB.parent.mkdir(parents=True, exist_ok=True)
    kwargs = dict(
        filepath=str(GLB),
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_extras=False,
    )
    try:
        bpy.ops.export_scene.gltf(export_format="GLB", **kwargs)
    except TypeError as err:
        print("gltf format fallback", err)
        bpy.ops.export_scene.gltf(**kwargs)


def render_preview():
    scene = bpy.context.scene
    try:
        scene.render.engine = "BLENDER_EEVEE"
    except TypeError:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PNG)
    bpy.ops.render.render(write_still=True)


def main():
    clear_scene()
    setup_world()
    geo = coll("GEO_BUILDING")
    prop = coll("GEO_PROP")
    coll("CAM")
    coll("ENV")
    rooms = {
        "bar": empty("ROOM_BAR", (-3.9, 3.4, 0), geo),
        "pool": empty("ROOM_POOL", (-2.0, 0.3, 0), geo),
        "theater": empty("ROOM_THEATER", (4.3, 2.1, 0), geo),
        "gym": empty("ROOM_GYM", (-4.3, -2.3, 0), geo),
        "lounge": empty("ROOM_LOUNGE", (3.9, -1.9, 0), geo),
        "core": empty("ROOM_CORE", (0.55, 3.5, 0), geo),
    }
    mats = {k: mat(f"M_{k}", v, 0.5) for k, v in PAL.items()}
    mats["lamp"] = mat("M_lamp", PAL["lamp"], 0.42, emit=1.4)
    mats["spill"] = mat("M_spill", PAL["spill"], 0.45, emit=0.9)
    mats["well"] = mat("M_well", PAL["well"], 0.35, emit=0.9)
    mats["daylight"] = mat("M_daylight", PAL["daylight"], 0.5, emit=0.7)
    mats["screen"] = mat("M_screen", PAL["screen"], 0.3, emit=0.4)
    mats["mirror"] = mat("M_mirror", PAL["mirror"], 0.15)
    mats["glass"] = mat("M_glass", PAL["glass"], 0.2, emit=0.06)
    setup_camera_lights()
    build_shell(mats, geo)
    build_stairs(mats, geo, prop, rooms["core"])
    build_bar(mats, prop, rooms["bar"])
    build_wine_cellar(mats, prop, rooms["bar"])
    build_pool(mats, prop, rooms["pool"])
    build_theater(mats, prop, rooms["theater"])
    build_gym(mats, prop, rooms["gym"])
    build_lounge(mats, prop, rooms["lounge"])
    frame_camera()
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    export_glb()
    render_preview()
    print("saved", BLEND)
    print("glb", GLB, "bytes", GLB.stat().st_size if GLB.exists() else 0)
    print("png", PNG, "bytes", PNG.stat().st_size if PNG.exists() else 0)
    print("meshes", sum(1 for o in bpy.data.objects if o.type == "MESH"))


main()
