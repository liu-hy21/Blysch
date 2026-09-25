"""Rebuild park house 1F as a pastel dollhouse (family E + cozy home)."""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(r"e:\Hangyu\VibeCoding\Python\radar\Blysch")
BLEND = ROOT / "docs" / "blender" / "assets" / "park-house-l1.blend"
GLB = ROOT / "public" / "models" / "park" / "house-l1.glb"
PNG = ROOT / "docs" / "blender" / "assets" / "park-house-l1.png"

PAL = {
    "wall": (0.94, 0.90, 0.85, 1),
    "wall_hi": (0.97, 0.95, 0.92, 1),
    "plinth": (0.29, 0.20, 0.13, 1),
    "plinth_hi": (0.42, 0.31, 0.20, 1),
    "floor": (0.90, 0.78, 0.66, 1),
    "floor_hi": (0.94, 0.86, 0.77, 1),
    "mint_floor": (0.62, 0.79, 0.72, 1),
    "wood": (0.77, 0.63, 0.47, 1),
    "wood_dk": (0.58, 0.42, 0.28, 1),
    "wood_hi": (0.95, 0.87, 0.75, 1),
    "mint": (0.56, 0.79, 0.71, 1),
    "mint_dk": (0.42, 0.66, 0.60, 1),
    "peach": (0.91, 0.72, 0.64, 1),
    "cream": (0.96, 0.94, 0.90, 1),
    "white": (0.98, 0.97, 0.95, 1),
    "ink": (0.11, 0.10, 0.09, 1),
    "gold": (0.77, 0.63, 0.41, 1),
    "leaf": (0.35, 0.60, 0.34, 1),
    "leaf_hi": (0.48, 0.72, 0.42, 1),
    "tv": (0.18, 0.20, 0.22, 1),
    "steel": (0.22, 0.22, 0.23, 1),
}


def hex_ok(c):
    return c


def clear_scene():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)
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


def mat(name, color, roughness=0.48, emit=0.0):
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


def cyl(name, loc, radius, depth, material, col, parent=None, bevel=0.012, verts=20):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=loc
    )
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def sphere(name, loc, radius, material, col, parent=None, bevel=0.0):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=radius, location=loc)
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
    bg.inputs["Color"].default_value = (0.82, 0.84, 0.85, 1)
    bg.inputs["Strength"].default_value = 0.9


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

    bpy.ops.object.light_add(type="SUN", location=(5.5, -4.0, 9.0))
    sun = bpy.context.active_object
    sun.name = "L_Sun"
    sun.rotation_euler = (math.radians(42), math.radians(8), math.radians(48))
    sun.data.energy = 2.4
    sun.data.angle = math.radians(45)
    put(sun, coll("ENV"))

    bpy.ops.object.light_add(type="AREA", location=(-6.0, -5.0, 6.5))
    fill = bpy.context.active_object
    fill.name = "L_Fill"
    fill.rotation_euler = (math.radians(70), 0, math.radians(-35))
    fill.data.energy = 55
    fill.data.size = 7
    fill.data.color = (1.0, 0.96, 0.9)
    put(fill, coll("ENV"))


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


def build_shell(mats, geo, rooms):
    plinth = box("Plinth", (0, 0, -0.16), (9.15, 7.95, 0.28), mats["plinth"], geo, bevel=0.08)
    skirt = box("Skirt", (0, 0, 0.02), (8.72, 7.52, 0.14), mats["wall"], geo, bevel=0.05)
    floor = box("Floor", (0, 0.05, 0.12), (8.28, 6.95, 0.1), mats["floor"], geo, bevel=0.02)
    floor_hi = box("FloorInlay", (2.15, -0.35, 0.175), (3.7, 5.7, 0.02), mats["floor_hi"], geo, bevel=0.01)

    west = box("WallWest", (-4.2, 0.12, 1.28), (0.18, 6.9, 2.28), mats["wall"], geo, bevel=0.045)
    east = box("WallEast", (4.2, 0.12, 1.28), (0.18, 6.9, 2.28), mats["wall"], geo, bevel=0.045)
    north = box("WallNorth", (0, 3.48, 1.28), (8.58, 0.18, 2.28), mats["wall"], geo, bevel=0.045)
    cap_w = box("WallWestCap", (-4.2, 0.12, 2.44), (0.22, 6.94, 0.08), mats["wall_hi"], geo, bevel=0.02)
    cap_e = box("WallEastCap", (4.2, 0.12, 2.44), (0.22, 6.94, 0.08), mats["wall_hi"], geo, bevel=0.02)
    cap_n = box("WallNorthCap", (0, 3.48, 2.44), (8.62, 0.22, 0.08), mats["wall_hi"], geo, bevel=0.02)

    box("SouthStubW", (-2.45, -3.38, 0.34), (3.3, 0.16, 0.4), mats["wall"], geo, bevel=0.03)
    box("SouthStubE", (2.45, -3.38, 0.34), (3.3, 0.16, 0.4), mats["wall"], geo, bevel=0.03)
    box("DoorJambL", (-0.58, -3.38, 1.05), (0.14, 0.16, 1.82), mats["wall"], geo, bevel=0.02)
    box("DoorJambR", (0.58, -3.38, 1.05), (0.14, 0.16, 1.82), mats["wall"], geo, bevel=0.02)
    box("DoorLint", (0, -3.38, 1.98), (1.3, 0.16, 0.14), mats["wall"], geo, bevel=0.02)
    box("Door", (0.02, -3.40, 1.02), (0.92, 0.08, 1.72), mats["wood_dk"], geo, bevel=0.02)
    cyl("DoorKnob", (0.32, -3.50, 0.92), 0.035, 0.05, mats["gold"], geo, bevel=0.004)
    box("Threshold", (0, -3.22, 0.2), (1.15, 0.42, 0.08), mats["wood"], geo, bevel=0.015)

    for i, x in enumerate((-2.7, 0.0, 2.7)):
        box(f"WinFrame{i}", (x, 3.40, 1.55), (1.35, 0.08, 1.05), mats["wood"], geo, bevel=0.015)
        box(f"WinGlass{i}", (x, 3.39, 1.55), (1.12, 0.04, 0.82), mats["cream"], geo, bevel=0.01)
        box(f"WinSill{i}", (x, 3.28, 1.0), (1.42, 0.16, 0.08), mats["wood_hi"], geo, bevel=0.012)

    return {
        "plinth": plinth,
        "skirt": skirt,
        "floor": floor,
        "floor_hi": floor_hi,
        "west": west,
        "east": east,
        "north": north,
        "cap_w": cap_w,
        "cap_e": cap_e,
        "cap_n": cap_n,
    }


def build_kitchen(mats, prop, parent):
    box("K_WestCab", (-3.72, 0.35, 0.58), (0.62, 4.4, 0.84), mats["mint"], prop, parent, 0.03)
    box("K_WestTop", (-3.70, 0.35, 1.04), (0.68, 4.46, 0.08), mats["wood_hi"], prop, parent, 0.015)
    box("K_NorthCab", (-2.35, 2.95, 0.58), (2.2, 0.62, 0.84), mats["mint"], prop, parent, 0.03)
    box("K_NorthTop", (-2.35, 2.93, 1.04), (2.26, 0.68, 0.08), mats["wood_hi"], prop, parent, 0.015)
    box("K_UpperL", (-3.78, 1.55, 1.92), (0.32, 1.5, 0.7), mats["wood"], prop, parent, 0.02)
    box("K_UpperR", (-3.78, -0.55, 1.92), (0.32, 1.2, 0.7), mats["wood"], prop, parent, 0.02)
    box("K_FridgeBody", (-1.28, 2.72, 1.12), (0.62, 0.58, 1.9), mats["cream"], prop, parent, 0.03)
    box("K_FridgeDoor", (-1.28, 2.42, 1.18), (0.52, 0.06, 1.55), mats["mint"], prop, parent, 0.015)
    cyl("K_FridgeHandle", (-1.08, 2.37, 1.2), 0.018, 0.28, mats["gold"], prop, parent, 0.003)
    box("K_Oven", (-3.72, -1.15, 0.48), (0.58, 0.7, 0.62), mats["steel"], prop, parent, 0.02)
    box("K_OvenGlass", (-3.42, -1.15, 0.5), (0.04, 0.46, 0.32), mats["ink"], prop, parent, 0.008)
    cyl("K_BurnerA", (-3.55, -0.95, 1.1), 0.09, 0.03, mats["steel"], prop, parent, 0.004)
    cyl("K_BurnerB", (-3.55, -1.28, 1.1), 0.09, 0.03, mats["steel"], prop, parent, 0.004)
    box("K_Sink", (-2.45, 2.88, 1.1), (0.7, 0.38, 0.06), mats["white"], prop, parent, 0.01)
    cyl("K_Faucet", (-2.45, 3.05, 1.22), 0.025, 0.22, mats["steel"], prop, parent, 0.004)
    box("K_FaucetArm", (-2.45, 2.96, 1.34), (0.04, 0.16, 0.04), mats["steel"], prop, parent, 0.004)
    box("K_Board", (-3.55, 0.55, 1.1), (0.34, 0.46, 0.03), mats["wood"], prop, parent, 0.008)
    cyl("K_Kettle", (-3.52, 1.15, 1.22), 0.1, 0.18, mats["peach"], prop, parent, 0.02)
    cyl("K_Pot", (-3.55, 0.1, 1.18), 0.12, 0.1, mats["mint_dk"], prop, parent, 0.015)
    box("K_Island", (-2.15, 0.15, 0.58), (1.15, 0.72, 0.84), mats["wood_dk"], prop, parent, 0.035)
    box("K_IslandTop", (-2.15, 0.15, 1.03), (1.22, 0.8, 0.08), mats["wood_hi"], prop, parent, 0.018)
    for i, y in enumerate((-0.18, 0.15, 0.48)):
        cyl(f"K_Stool{i}", (-1.42, y, 0.38), 0.13, 0.08, mats["mint"], prop, parent, 0.02)
        cyl(f"K_StoolLeg{i}", (-1.42, y, 0.22), 0.035, 0.28, mats["wood"], prop, parent, 0.006)
    box("K_BoxA", (-3.35, -2.35, 0.38), (0.32, 0.28, 0.28), mats["wood"], prop, parent, 0.015)
    box("K_BoxB", (-3.08, -2.42, 0.3), (0.24, 0.22, 0.18), mats["peach"], prop, parent, 0.012)


def build_dining(mats, prop, parent):
    box("D_Table", (-2.15, -1.85, 0.52), (1.35, 0.78, 0.08), mats["wood"], prop, parent, 0.025)
    for i, x in enumerate((-2.55, -1.75)):
        cyl(f"D_Leg{i}a", (x, -2.1, 0.3), 0.04, 0.44, mats["wood_dk"], prop, parent, 0.006)
        cyl(f"D_Leg{i}b", (x, -1.6, 0.3), 0.04, 0.44, mats["wood_dk"], prop, parent, 0.006)
    seats = [(-2.55, -2.38), (-1.75, -2.38), (-2.55, -1.32), (-1.75, -1.32)]
    for i, (x, y) in enumerate(seats):
        cyl(f"D_Seat{i}", (x, y, 0.38), 0.14, 0.07, mats["peach"], prop, parent, 0.02)
        cyl(f"D_SeatLeg{i}", (x, y, 0.2), 0.03, 0.28, mats["wood"], prop, parent, 0.005)
        box(f"D_Back{i}", (x, y + (0.12 if y < -1.8 else -0.12), 0.55), (0.22, 0.05, 0.28), mats["peach"], prop, parent, 0.015)
    cyl("D_PlateA", (-2.35, -1.85, 0.59), 0.08, 0.02, mats["white"], prop, parent, 0.004)
    cyl("D_PlateB", (-1.95, -1.85, 0.59), 0.08, 0.02, mats["white"], prop, parent, 0.004)
    cyl("D_Cup", (-2.15, -1.62, 0.62), 0.035, 0.07, mats["mint"], prop, parent, 0.008)


def build_core(mats, geo, prop, parent):
    box("CoreWest", (-0.55, 2.45, 1.15), (0.12, 1.85, 2.05), mats["wall"], geo, parent, 0.03)
    box("CoreSouth", (0.05, 1.55, 1.15), (1.32, 0.12, 2.05), mats["wall"], geo, parent, 0.03)
    box("CoreEast", (0.72, 2.55, 1.15), (0.12, 1.65, 2.05), mats["wall"], geo, parent, 0.03)
    box("CoreCap", (0.08, 2.4, 2.2), (1.4, 2.0, 0.08), mats["wall_hi"], geo, parent, 0.015)
    box("PowderFloor", (0.08, 2.48, 0.185), (1.18, 1.7, 0.03), mats["mint_floor"], geo, parent, 0.008)
    box("PowderDoor", (0.02, 1.50, 0.95), (0.62, 0.06, 1.55), mats["wood"], prop, parent, 0.015)
    cyl("ToiletBowl", (-0.18, 2.85, 0.38), 0.16, 0.28, mats["white"], prop, parent, 0.03)
    box("ToiletTank", (-0.18, 3.08, 0.62), (0.28, 0.12, 0.38), mats["white"], prop, parent, 0.02)
    box("Vanity", (0.42, 2.95, 0.48), (0.46, 0.34, 0.58), mats["mint"], prop, parent, 0.02)
    cyl("VanitySink", (0.42, 2.95, 0.8), 0.12, 0.05, mats["white"], prop, parent, 0.01)
    cyl("Mirror", (0.42, 3.22, 1.35), 0.16, 0.04, mats["cream"], prop, parent, 0.01)
    box("BathMat", (0.08, 2.15, 0.2), (0.42, 0.28, 0.03), mats["peach"], prop, parent, 0.01)

    for i in range(6):
        z = 0.28 + i * 0.22
        y = 1.85 + i * 0.22
        box(f"Step{i}", (1.45, y, z), (1.15, 0.36, 0.12), mats["wood"], geo, parent, 0.018)
    box("StairSide", (2.05, 2.55, 0.95), (0.08, 1.7, 1.55), mats["wall"], geo, parent, 0.02)
    box("Rail", (1.95, 2.55, 1.55), (0.05, 1.55, 0.05), mats["wood_dk"], prop, parent, 0.008)


def build_living(mats, prop, parent):
    box("Rug", (2.25, -0.55, 0.19), (2.7, 3.15, 0.03), mats["peach"], prop, parent, 0.02)
    box("SofaBase", (2.35, -2.05, 0.42), (1.85, 0.72, 0.42), mats["mint"], prop, parent, 0.045)
    box("SofaBack", (2.35, -2.38, 0.78), (1.85, 0.22, 0.55), mats["mint"], prop, parent, 0.04)
    box("SofaArmL", (1.42, -2.05, 0.58), (0.18, 0.72, 0.42), mats["mint_dk"], prop, parent, 0.03)
    box("SofaArmR", (3.28, -2.05, 0.58), (0.18, 0.72, 0.42), mats["mint_dk"], prop, parent, 0.03)
    box("PillowA", (1.95, -1.95, 0.7), (0.32, 0.18, 0.22), mats["peach"], prop, parent, 0.03)
    box("PillowB", (2.7, -1.95, 0.7), (0.32, 0.18, 0.22), mats["wood_hi"], prop, parent, 0.03)
    cyl("TableTop", (2.3, -0.55, 0.42), 0.52, 0.07, mats["wood"], prop, parent, 0.02)
    for i, ang in enumerate((0.7, 2.3, 3.9, 5.5)):
        x = 2.3 + math.cos(ang) * 0.32
        y = -0.55 + math.sin(ang) * 0.32
        cyl(f"TableLeg{i}", (x, y, 0.24), 0.035, 0.3, mats["wood_dk"], prop, parent, 0.005)
    cyl("CupA", (2.18, -0.42, 0.5), 0.04, 0.06, mats["white"], prop, parent, 0.006)
    cyl("CupB", (2.42, -0.62, 0.5), 0.04, 0.06, mats["mint"], prop, parent, 0.006)
    box("Book", (2.45, -0.38, 0.48), (0.16, 0.12, 0.03), mats["peach"], prop, parent, 0.004)
    box("Remote", (2.05, -0.72, 0.47), (0.12, 0.05, 0.02), mats["steel"], prop, parent, 0.004)
    box("TvCab", (2.35, 2.85, 0.42), (1.7, 0.42, 0.48), mats["wood"], prop, parent, 0.03)
    box("TvScreen", (2.35, 2.68, 1.15), (1.35, 0.06, 0.78), mats["tv"], prop, parent, 0.012)
    box("TvBezel", (2.35, 2.72, 1.15), (1.48, 0.05, 0.9), mats["wood_dk"], prop, parent, 0.01)
    cyl("LampPole", (3.55, -0.15, 0.7), 0.03, 1.0, mats["wood"], prop, parent, 0.006)
    sphere("LampShade", (3.55, -0.15, 1.28), 0.18, mats["white"], prop, parent, 0.0)
    # plant
    cyl("Pot", (3.55, 1.55, 0.38), 0.18, 0.28, mats["peach"], prop, parent, 0.02)
    sphere("LeafA", (3.55, 1.55, 0.72), 0.16, mats["leaf"], prop, parent, 0.0)
    sphere("LeafB", (3.42, 1.42, 0.82), 0.13, mats["leaf_hi"], prop, parent, 0.0)
    sphere("LeafC", (3.68, 1.62, 0.88), 0.12, mats["leaf"], prop, parent, 0.0)
    box("ArtA", (4.08, 0.35, 1.55), (0.04, 0.55, 0.7), mats["peach"], prop, parent, 0.01)
    box("ArtAIn", (4.05, 0.35, 1.55), (0.03, 0.4, 0.5), mats["mint"], prop, parent, 0.008)
    box("ArtB", (4.08, 1.55, 1.45), (0.04, 0.42, 0.52), mats["wood_hi"], prop, parent, 0.01)
    box("Speaker", (1.35, 2.85, 0.52), (0.22, 0.22, 0.42), mats["cream"], prop, parent, 0.02)


def assign_lamp_emit(mats):
    shade = bpy.data.objects.get("LampShade")
    if shade:
        shade.data.materials.clear()
        shade.data.materials.append(mats["lamp"])


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
    scene.render.engine = "BLENDER_EEVEE"
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
        "kitchen": empty("ROOM_KITCHEN", (-2.2, 0.2, 0), geo),
        "live": empty("ROOM_LIVE", (2.2, -0.2, 0), geo),
        "core": empty("ROOM_CORE", (0.6, 2.2, 0), geo),
    }
    mats = {k: mat(f"M_{k}", v, 0.48) for k, v in PAL.items()}
    mats["lamp"] = mat("M_lamp", PAL["white"], 0.4, emit=1.6)
    mats["tv"] = mat("M_tv", PAL["tv"], 0.25, emit=0.15)
    setup_camera_lights()
    build_shell(mats, geo, rooms)
    build_kitchen(mats, prop, rooms["kitchen"])
    build_dining(mats, prop, rooms["kitchen"])
    build_core(mats, geo, prop, rooms["core"])
    build_living(mats, prop, rooms["live"])
    assign_lamp_emit(mats)
    frame_camera()
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    export_glb()
    render_preview()
    print("saved", BLEND)
    print("glb", GLB, "bytes", GLB.stat().st_size if GLB.exists() else 0)
    print("png", PNG, "bytes", PNG.stat().st_size if PNG.exists() else 0)
    print("meshes", sum(1 for o in bpy.data.objects if o.type == "MESH"))


main()
