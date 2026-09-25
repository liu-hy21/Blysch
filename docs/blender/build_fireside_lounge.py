"""Spacious cutaway rec room on the existing 3x fireside-lounge shell.

Walls, plinth, skirt, floor and plank layout stay exactly as built.
Interior is rebuilt as a basement entertainment floor: lounge + screen
on the west, pool table in the open center, L-bar / fridge / stairs on
the east, light-well trough along the open south edge.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(r"e:\Hangyu\VibeCoding\Python\radar\Blysch")
OUT = Path(r"E:\Hangyu\VibeCoding\blender")
BLEND = OUT / "fireside-lounge.blend"
PNG = OUT / "fireside-lounge.png"
GLB = OUT / "fireside-lounge.glb"
POOL_BLEND = OUT / "pool-table.blend"
POOL_PNG = OUT / "pool-table.png"
POOL_GLB = OUT / "pool-table.glb"
SOFA_BLEND = OUT / "sofas.blend"
SOFA_PNG = OUT / "sofas.png"
SOFA_GLB = OUT / "sofas.glb"
ARMCHAIR_BLEND = OUT / "armchair.blend"
COFFEE_BLEND = OUT / "coffee-table.blend"
LAMP_BLEND = OUT / "floor-lamp.blend"
BAR_BLEND = OUT / "bar.blend"
CINEMA_BLEND = OUT / "cinema.blend"
CONSOLE_BLEND = OUT / "media-console.blend"
ART_BLEND = OUT / "wall-art.blend"
PLANTS_BLEND = OUT / "plants.blend"

# north wall inner face (walls sit on the 3x plinth)
NW = 6.385
# east wall inner face
EW = 8.71
# plank top — furniture sits on this, shell geometry is untouched
FZ = 0.174

PAL = {
    "wall": (0.905, 0.845, 0.760, 1),
    "wall_hi": (0.945, 0.900, 0.825, 1),
    "plinth": (0.235, 0.170, 0.115, 1),
    "plinth_hi": (0.360, 0.270, 0.180, 1),
    "skirt": (0.880, 0.815, 0.720, 1),
    "floor": (0.815, 0.640, 0.445, 1),
    "wood": (0.780, 0.590, 0.395, 1),
    "wood_hi": (0.855, 0.685, 0.480, 1),
    "wood_dk": (0.585, 0.415, 0.265, 1),
    "walnut": (0.360, 0.250, 0.160, 1),
    "basebd": (0.940, 0.920, 0.880, 1),
    "white": (0.960, 0.950, 0.925, 1),
    "cream": (0.945, 0.905, 0.830, 1),
    "tile": (0.925, 0.880, 0.800, 1),
    "tile_dk": (0.845, 0.790, 0.700, 1),
    "mustard": (0.865, 0.640, 0.235, 1),
    "mustard_hi": (0.905, 0.700, 0.300, 1),
    "terra": (0.760, 0.460, 0.320, 1),
    "terra_dk": (0.660, 0.380, 0.260, 1),
    "rug": (0.215, 0.345, 0.500, 1),
    "rug_hi": (0.330, 0.475, 0.630, 1),
    "cat": (0.905, 0.560, 0.260, 1),
    "cat_dk": (0.780, 0.430, 0.180, 1),
    "cat_cream": (0.965, 0.885, 0.760, 1),
    "ink": (0.145, 0.125, 0.115, 1),
    "leaf": (0.395, 0.585, 0.365, 1),
    "leaf_dk": (0.285, 0.475, 0.305, 1),
    "pot": (0.770, 0.560, 0.400, 1),
    "gold": (0.815, 0.630, 0.385, 1),
    "blush": (0.900, 0.690, 0.610, 1),
    "fire": (1.000, 0.520, 0.130, 1),
    "ember": (1.000, 0.750, 0.350, 1),
    "win": (1.000, 0.790, 0.480, 1),
    "bulb": (1.000, 0.840, 0.550, 1),
    "book_r": (0.785, 0.450, 0.360, 1),
    "book_g": (0.520, 0.640, 0.470, 1),
    "book_b": (0.415, 0.545, 0.680, 1),
    "book_y": (0.885, 0.720, 0.420, 1),
    "leather": (0.620, 0.380, 0.240, 1),
    "leather_dk": (0.480, 0.280, 0.175, 1),
    "felt": (0.118, 0.305, 0.128, 1),
    "felt_hi": (0.175, 0.390, 0.175, 1),
    "marble": (0.130, 0.125, 0.120, 1),
    "marble_hi": (0.220, 0.195, 0.175, 1),
    "screen": (0.930, 0.935, 0.910, 1),
    "linen": (0.860, 0.800, 0.700, 1),
    "linen_hi": (0.905, 0.860, 0.775, 1),
    "well": (0.930, 0.950, 0.905, 1),
    "daylight": (0.960, 0.950, 0.880, 1),
    "lamp": (1.000, 0.860, 0.620, 1),
    "steel": (0.175, 0.155, 0.140, 1),
    "sofa": (0.930, 0.885, 0.800, 1),
    "sofa_dk": (0.860, 0.800, 0.710, 1),
    "brass": (0.720, 0.540, 0.270, 1),
    "ivory": (0.930, 0.890, 0.790, 1),
    "slate": (0.205, 0.215, 0.225, 1),
    "chalk": (0.220, 0.430, 0.760, 1),
    "cue_wrap": (0.110, 0.090, 0.080, 1),
    "felt_nose": (0.095, 0.255, 0.110, 1),
    "ball_yel": (0.920, 0.780, 0.160, 1),
    "ball_blu": (0.160, 0.310, 0.720, 1),
    "ball_red": (0.780, 0.145, 0.125, 1),
    "ball_pur": (0.400, 0.200, 0.560, 1),
    "ball_org": (0.900, 0.460, 0.110, 1),
    "ball_grn": (0.100, 0.460, 0.250, 1),
    "ball_mar": (0.540, 0.105, 0.165, 1),
    "ball_blk": (0.045, 0.045, 0.045, 1),
}

# ---------------------------------------------------------------- helpers


def clear_scene():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for mat_ in list(bpy.data.materials):
        bpy.data.materials.remove(mat_)
    for col in list(bpy.data.collections):
        bpy.data.collections.remove(col)
    base = bpy.data.collections.new("Collection")
    bpy.context.scene.collection.children.link(base)


def coll(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def mat(name, color, rough=0.5, emit=0.0, alpha=1.0, metal=0.0):
    m = bpy.data.materials.get(name)
    if m is None:
        m = bpy.data.materials.new(name)
        m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Emission Color"].default_value = color
    bsdf.inputs["Emission Strength"].default_value = emit
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        for method in ("DITHERED", "BLENDED"):
            try:
                m.surface_render_method = method
                break
            except Exception:
                continue
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
    if ob.parent is None:
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
        try:
            bpy.ops.object.shade_smooth()
        except Exception:
            pass
    ob.select_set(False)
    return ob


def box(name, loc, dims, material, col, parent=None, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    sx, sy, sz = dims
    for v in ob.data.vertices:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    ob.data.update()
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def cyl(name, loc, radius, depth, material, col, parent=None, bevel=0.012,
        verts=20, rot=None):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=verts, radius=radius, depth=depth, location=loc,
        rotation=rot or (0, 0, 0),
    )
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def sphere(name, loc, radius, material, col, parent=None, scale=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=18, ring_count=12, radius=radius, location=loc
    )
    ob = bpy.context.active_object
    ob.name = name
    if scale:
        ob.scale = scale
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, 0.0)


def cone(name, loc, r1, r2, depth, material, col, parent=None, bevel=0.01,
         verts=20, rot=None, scale=None):
    bpy.ops.mesh.primitive_cone_add(
        vertices=verts, radius1=r1, radius2=r2, depth=depth, location=loc,
        rotation=rot or (0, 0, 0),
    )
    ob = bpy.context.active_object
    ob.name = name
    if scale:
        ob.scale = scale
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, bevel)


def torus(name, loc, major, minor, material, col, parent=None, rot=None,
          scale=None):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, major_segments=36,
        minor_segments=12, location=loc, rotation=rot or (0, 0, 0),
    )
    ob = bpy.context.active_object
    ob.name = name
    if scale:
        ob.scale = scale
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, 0.0)


def empty(name, loc, col):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=loc)
    ob = bpy.context.active_object
    ob.name = name
    put(ob, col)
    return ob


def tube(name, pts, bevel, material, col, parent=None):
    cu = bpy.data.curves.new(name + "Curve", "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 2
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(pts) - 1)
    for bp, co in zip(sp.bezier_points, pts):
        bp.co = co
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    cu.bevel_depth = bevel
    cu.bevel_resolution = 2
    ob = bpy.data.objects.new(name, cu)
    cu.materials.append(material)
    col.objects.link(ob)
    if parent is not None:
        ob.parent = parent
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    try:
        bpy.ops.object.convert(target="MESH")
    except Exception:
        pass
    ob.select_set(False)
    return ob


def look_at(ob, target):
    direction = Vector(target) - ob.location
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


# ---------------------------------------------------------------- build


def setup_world():
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.16, 0.13, 0.15, 1)
    bg.inputs["Strength"].default_value = 0.55


def setup_camera_lights():
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=(2.7, -34.8, 19.8))
    cam = bpy.context.active_object
    cam.name = "CAM_ISO"
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 18.9
    cam.data.clip_start = 0.1
    cam.data.clip_end = 120
    look_at(cam, (0.0, 0.75, 1.0))
    scene.camera = cam
    put(cam, coll("CAM"))

    bpy.ops.object.light_add(type="SUN", location=(12.0, -15.0, 27.0))
    sun = bpy.context.active_object
    sun.name = "L_Sun"
    sun.rotation_euler = (math.radians(52), math.radians(8), math.radians(28))
    sun.data.energy = 0.65
    sun.data.angle = math.radians(40)
    sun.data.color = (1.0, 0.82, 0.62)
    put(sun, coll("ENV"))

    bpy.ops.object.light_add(type="AREA", location=(-10.5, -13.5, 15.6))
    fill = bpy.context.active_object
    fill.name = "L_Fill"
    fill.data.energy = 600
    fill.data.size = 10
    fill.data.color = (1.0, 0.90, 0.78)
    look_at(fill, (0, 0.9, 1.0))
    put(fill, coll("ENV"))

    env = coll("ENV")
    for name, loc, energy, color, soft in (
        ("L_Lounge", (-4.5, 0.4, 2.4), 28, (1.0, 0.82, 0.58), 0.7),
        ("L_Screen", (-4.5, 5.4, 1.8), 14, (0.95, 0.95, 0.88), 0.5),
        ("L_Pool", (0.9, 0.4, 2.6), 18, (1.0, 0.86, 0.62), 0.6),
        ("L_Bar", (5.4, 0.4, 2.3), 32, (1.0, 0.78, 0.50), 0.55),
        ("L_Cellar", (7.6, 1.2, 1.8), 16, (1.0, 0.80, 0.52), 0.4),
        ("L_Well", (0.0, -5.4, 1.4), 22, (0.92, 0.94, 0.86), 0.8),
        ("L_Lamp", (-2.55, -0.7, 1.5), 8, (1.0, 0.84, 0.55), 0.25),
        ("L_SconceE", (8.2, -2.6, 1.7), 7, (1.0, 0.78, 0.48), 0.3),
    ):
        bpy.ops.object.light_add(type="POINT", location=loc)
        pt = bpy.context.active_object
        pt.name = name
        pt.data.energy = energy
        pt.data.color = color
        pt.data.shadow_soft_size = soft
        put(pt, env)

    for i, y in enumerate((-0.7, 0.4, 1.5)):
        bpy.ops.object.light_add(type="POINT", location=(5.35, y, 1.55))
        warm = bpy.context.active_object
        warm.name = f"L_Pendant{i}"
        warm.data.energy = 9
        warm.data.color = (1.0, 0.80, 0.55)
        warm.data.shadow_soft_size = 0.3
        put(warm, env)


def build_shell(mats, geo):
    # 3x base platform — do not change
    box("Plinth", (0, 0, -0.15), (19.8, 15.3, 0.3), mats["plinth"], geo, bevel=0.09)
    box("PlinthHi", (0, 0, -0.005), (19.05, 14.55, 0.06), mats["plinth_hi"], geo, bevel=0.025)
    box("Skirt", (0, 0, 0.06), (18.45, 13.95, 0.1), mats["skirt"], geo, bevel=0.04)
    box("Floor", (0, 0, 0.115), (17.1, 12.45, 0.07), mats["floor"], geo, bevel=0.02)

    box("WallNorth", (0, 6.465, 1.45), (18.06, 0.16, 2.6), mats["wall"], geo, bevel=0.05)
    box("WallWest", (-8.79, 0, 1.45), (0.16, 12.93, 2.6), mats["wall"], geo, bevel=0.05)
    box("WallEast", (8.79, 0, 1.45), (0.16, 12.93, 2.6), mats["wall"], geo, bevel=0.05)
    box("CapNorth", (0, 6.465, 2.785), (18.10, 0.2, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapWest", (-8.79, 0, 2.785), (0.2, 12.97, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapEast", (8.79, 0, 2.785), (0.2, 12.97, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("StubWest", (-8.4, -6.305, 0.38), (1.05, 0.16, 0.46), mats["wall"], geo, bevel=0.04)
    box("StubEast", (8.4, -6.305, 0.38), (1.05, 0.16, 0.46), mats["wall"], geo, bevel=0.04)

    box("BaseNorth", (0, 6.355, 0.23), (17.1, 0.06, 0.16), mats["basebd"], geo, bevel=0.015)
    box("BaseWest", (-8.68, 0, 0.23), (0.06, 12.1, 0.16), mats["basebd"], geo, bevel=0.015)
    box("BaseEast", (8.68, 0, 0.23), (0.06, 12.1, 0.16), mats["basebd"], geo, bevel=0.015)


def build_planks(mats, geo):
    rnd = random.Random(11)
    x0, x1 = -8.4, 8.4
    shades = (mats["wood"], mats["wood_hi"], mats["wood_dk"])
    row = 0
    y = -6.05
    while y < 6.1:
        if rnd.random() < 0.45:
            cut = x0 + (x1 - x0) * rnd.uniform(0.35, 0.65)
            segs = ((x0, cut), (cut, x1))
        else:
            segs = ((x0, x1),)
        for j, (a, b) in enumerate(segs):
            m = shades[(row + j) % 3] if rnd.random() < 0.7 else rnd.choice(shades)
            box(f"Plank{row}_{j}", ((a + b) / 2, y, 0.162),
                (b - a - 0.015, 0.395, 0.024), m, geo, bevel=0.007)
        y += 0.415
        row += 1


def gold_sconce(name, x, y, z, facing, mats, prop):
    """facing: 's' on north wall, 'w' on east wall."""
    if facing == "s":
        box(f"{name}Arm", (x, y - 0.07, z), (0.07, 0.12, 0.05), mats["gold"],
            prop, bevel=0.008)
        cyl(f"{name}Shade", (x, y - 0.14, z - 0.07), 0.085, 0.13, mats["lamp"],
            prop, bevel=0.015)
    else:
        box(f"{name}Arm", (x - 0.07, y, z), (0.12, 0.07, 0.05), mats["gold"],
            prop, bevel=0.008)
        cyl(f"{name}Shade", (x - 0.14, y, z - 0.07), 0.085, 0.13, mats["lamp"],
            prop, bevel=0.015)


def potted_plant(name, x, y, z0, pot_r, pot_h, n_leaves, spread, leaf_len,
                 mats, col, parent=None):
    cyl(f"{name}Pot", (x, y, z0 + pot_h / 2), pot_r, pot_h, mats["terra"],
        col, parent, bevel=0.015)
    torus(f"{name}Rim", (x, y, z0 + pot_h), pot_r * 0.92, pot_r * 0.22,
          mats["terra"], col, parent)
    cyl(f"{name}Soil", (x, y, z0 + pot_h - 0.01), pot_r * 0.82, 0.02,
        mats["plinth"], col, parent, bevel=0.004)
    rnd = random.Random(hash(name) & 0xFFFF)
    for i in range(n_leaves):
        a = 2 * math.pi * i / n_leaves + rnd.uniform(-0.2, 0.2)
        tilt = math.radians(rnd.uniform(24, 50))
        ln = leaf_len * rnd.uniform(0.8, 1.15)
        lx = x + math.cos(a) * spread * 0.3
        ly = y + math.sin(a) * spread * 0.3
        lz = z0 + pot_h + ln * 0.3
        cone(f"{name}Leaf{i}", (lx, ly, lz), 0.05, 0.012, ln,
             mats["leaf"] if i % 2 else mats["leaf_dk"], col, parent,
             bevel=0.006, verts=10, rot=(tilt, 0, a), scale=(1, 0.45, 1))


def build_light_well(mats, geo, veg):
    """Glass trough on the south floor edge — does not touch wall geometry."""
    box("WellTrough", (0.0, -5.92, FZ + 0.12), (15.4, 0.52, 0.24), mats["white"],
        geo, bevel=0.02)
    box("WellGlass", (0.0, -5.70, FZ + 0.28), (15.2, 0.06, 0.38), mats["well"],
        geo, bevel=0.01)
    box("WellSoil", (0.0, -5.95, FZ + 0.22), (14.9, 0.36, 0.06), mats["plinth"],
        geo, bevel=0.008)
    box("WellDaylight", (0.0, -5.35, FZ + 0.012), (10.5, 0.55, 0.02),
        mats["daylight"], geo, bevel=0.006)
    for i, x in enumerate((-6.4, -3.8, -1.3, 1.2, 3.7, 6.2)):
        potted_plant(f"WellPlant{i}", x, -5.95, FZ + 0.24, 0.09, 0.10, 6, 0.18,
                     0.22, mats, veg)


def sofa_leg(tag, x, y, mats, col, parent):
    cyl(f"{tag}Foot", (x, y, FZ + 0.014), 0.040, 0.024, mats["ink"],
        col, parent, bevel=0.004, verts=16)
    cone(f"{tag}Bulb", (x, y, FZ + 0.080), 0.038, 0.018, 0.104, mats["walnut"],
         col, parent, bevel=0.007, verts=18)
    cyl(f"{tag}Ring", (x, y, FZ + 0.136), 0.024, 0.016, mats["brass"],
        col, parent, bevel=0.003, verts=14)
    cyl(f"{tag}Post", (x, y, FZ + 0.176), 0.017, 0.058, mats["walnut"],
        col, parent, bevel=0.003, verts=14)
    cone(f"{tag}Cap", (x, y, FZ + 0.216), 0.017, 0.030, 0.028, mats["walnut"],
         col, parent, bevel=0.004, verts=14)
    cyl(f"{tag}Cup", (x, y, FZ + 0.234), 0.032, 0.011, mats["brass"],
        col, parent, bevel=0.002, verts=12)


def sofa_button(tag, loc, mats, col, parent):
    sphere(tag, loc, 0.014, mats["sofa_dk"], col, parent)
    sphere(f"{tag}Rim", loc, 0.007, mats["brass"], col, parent)


def pillow(tag, loc, dims, material, col, parent, yaw=0.0, tilt=0.0):
    ob = box(tag, loc, dims, material, col, parent, bevel=min(dims) * 0.44)
    ob.rotation_euler[0] = math.radians(tilt)
    ob.rotation_euler[2] = math.radians(yaw)
    return ob


def sofa_along_y(tag, cx, cy, length, depth, look, mats, col, parent, n_seat=2):
    """Long axis along Y. look=+1 faces +X (east)."""
    s = 1.0 if look > 0 else -1.0
    arm_w, arm_h = 0.168, 0.64
    arm_d = depth - 0.04
    back_t, back_h = 0.168, 0.88
    deck_h, seat_h = 0.118, 0.148
    frame_z = FZ + 0.178
    inner = length - 2 * arm_w
    deck_z = frame_z + deck_h / 2
    box(f"{tag}Deck", (cx - s * 0.02, cy, deck_z),
        (depth - 0.14, inner + 0.06, deck_h), mats["sofa_dk"], col, parent, bevel=0.03)
    box(f"{tag}Rail", (cx + s * (depth / 2 - 0.042), cy, frame_z + 0.048),
        (0.078, inner + 0.04, 0.118), mats["sofa_dk"], col, parent, bevel=0.02)
    box(f"{tag}Apron", (cx + s * (depth / 2 - 0.028), cy, FZ + 0.112),
        (0.058, inner + 0.10, 0.078), mats["walnut"], col, parent, bevel=0.01)
    box(f"{tag}ApronIn", (cx + s * (depth / 2 - 0.038), cy, FZ + 0.126),
        (0.016, inner + 0.04, 0.028), mats["wood_dk"], col, parent, bevel=0.004)
    box(f"{tag}Kick", (cx + s * (depth / 2 - 0.07), cy, FZ + 0.072),
        (0.036, inner - 0.02, 0.038), mats["walnut"], col, parent, bevel=0.006)
    box(f"{tag}Back", (cx - s * (depth / 2 - back_t / 2), cy, FZ + back_h / 2 + 0.04),
        (back_t, length - 0.04, back_h), mats["sofa_dk"], col, parent, bevel=0.05)
    box(f"{tag}BackIn", (cx - s * (depth / 2 - back_t - 0.022), cy, FZ + 0.62),
        (0.05, inner - 0.04, 0.54), mats["sofa"], col, parent, bevel=0.036)
    box(f"{tag}BackCap",
        (cx - s * (depth / 2 - back_t / 2), cy, FZ + back_h + 0.018),
        (back_t + 0.02, length - 0.10, 0.042), mats["sofa"], col, parent, bevel=0.02)
    box(f"{tag}BackPipe",
        (cx - s * (depth / 2 - 0.018), cy, FZ + back_h - 0.04),
        (0.014, inner + 0.02, 0.014), mats["linen"], col, parent, bevel=0.005)
    for side, sy in (("N", 1.0), ("S", -1.0)):
        ay = cy + sy * (length / 2 - arm_w / 2)
        box(f"{tag}Arm{side}", (cx, ay, FZ + arm_h / 2 + 0.04),
            (arm_d, arm_w, arm_h), mats["sofa_dk"], col, parent, bevel=0.06)
        box(f"{tag}ArmIn{side}", (cx + s * 0.01, ay - sy * 0.018, FZ + arm_h / 2 + 0.06),
            (arm_d - 0.10, 0.04, arm_h - 0.16), mats["sofa"], col, parent, bevel=0.03)
        box(f"{tag}ArmFace{side}",
            (cx + s * (arm_d / 2 - 0.018), ay, FZ + arm_h / 2 + 0.04),
            (0.036, arm_w - 0.02, arm_h - 0.12), mats["sofa"], col, parent, bevel=0.02)
        cyl(f"{tag}ArmRoll{side}", (cx + s * 0.01, ay, FZ + arm_h + 0.028),
            0.062, arm_d - 0.10, mats["sofa"], col, parent, bevel=0.01,
            verts=22, rot=(0.0, math.pi / 2, 0.0))
        box(f"{tag}ArmPipe{side}",
            (cx + s * (arm_d / 2 - 0.012), ay, FZ + arm_h / 2 + 0.05),
            (0.014, arm_w - 0.05, arm_h - 0.16), mats["linen"], col, parent, bevel=0.005)
        for k in range(7):
            sphere(f"{tag}Nail{side}{k}",
                   (cx + s * (arm_d / 2 - 0.004), ay, FZ + 0.22 + k * 0.068),
                   0.011, mats["brass"], col, parent)
        box(f"{tag}ApronS{side}", (cx, ay, FZ + 0.100),
            (depth - 0.22, 0.042, 0.058), mats["walnut"], col, parent, bevel=0.008)
    cush_w = inner / n_seat - 0.032
    for i in range(n_seat):
        yy = cy - inner / 2 + cush_w / 2 + 0.016 + i * (cush_w + 0.032)
        seat_z = deck_z + deck_h / 2 + seat_h / 2 - 0.008
        box(f"{tag}Seat{i}", (cx + s * 0.05, yy, seat_z),
            (depth - 0.28, cush_w, seat_h), mats["sofa"], col, parent, bevel=0.06)
        box(f"{tag}SeatTop{i}", (cx + s * 0.05, yy, seat_z + seat_h / 2 + 0.016),
            (depth - 0.34, cush_w - 0.05, 0.046), mats["sofa"], col, parent, bevel=0.028)
        cyl(f"{tag}SeatPipeF{i}",
            (cx + s * (depth / 2 - 0.168), yy, seat_z + seat_h / 2 - 0.01),
            0.013, cush_w - 0.06, mats["linen"], col, parent, bevel=0.004,
            verts=12, rot=(math.pi / 2, 0.0, 0.0))
        cyl(f"{tag}SeatPipeS{i}",
            (cx + s * 0.05, yy + cush_w / 2 - 0.012, seat_z + seat_h / 2 - 0.01),
            0.011, depth - 0.36, mats["linen"], col, parent, bevel=0.003,
            verts=10, rot=(0.0, math.pi / 2, 0.0))
        bx = cx - s * (depth / 2 - back_t - 0.125)
        bc = box(f"{tag}BackC{i}", (bx, yy, FZ + 0.62),
                 (0.138, cush_w - 0.06, 0.46), mats["sofa"], col, parent, bevel=0.055)
        bc.rotation_euler[1] = math.radians(-12 * s)
        for r in range(2):
            for c in range(2):
                sofa_button(
                    f"{tag}Btn{i}{r}{c}",
                    (bx + s * 0.08, yy - 0.12 + c * 0.24, FZ + 0.50 + r * 0.18),
                    mats, col, parent,
                )
    ix, iy = depth / 2 - 0.12, length / 2 - 0.12
    for i, (lx, ly) in enumerate((
        (cx - ix, cy - iy), (cx + ix, cy - iy),
        (cx - ix, cy + iy), (cx + ix, cy + iy),
    )):
        sofa_leg(f"{tag}Leg{i}", lx, ly, mats, col, parent)
    box(f"{tag}StretchF", (cx + s * (depth / 2 - 0.12), cy, FZ + 0.082),
        (0.032, length - 0.28, 0.026), mats["walnut"], col, parent, bevel=0.005)
    box(f"{tag}StretchM", (cx, cy, FZ + 0.078),
        (depth - 0.28, 0.028, 0.022), mats["walnut"], col, parent, bevel=0.004)


def sofa_along_x(tag, cx, cy, length, depth, look, mats, col, parent, n_seat=2,
                 open_end=None):
    """Long axis along X. look=+1 faces +Y. open_end 'e'/'w' skips that arm."""
    s = 1.0 if look > 0 else -1.0
    arm_w, arm_h = 0.168, 0.64
    arm_d = depth - 0.04
    back_t, back_h = 0.168, 0.88
    deck_h, seat_h = 0.118, 0.148
    frame_z = FZ + 0.178
    arms = []
    if open_end != "w":
        arms.append(("W", -1.0))
    if open_end != "e":
        arms.append(("E", 1.0))
    inner = length - arm_w * len(arms)
    if len(arms) == 1:
        inner = length - arm_w - 0.04
    deck_z = frame_z + deck_h / 2
    deck_x = cx
    if open_end == "w":
        deck_x = cx + arm_w / 4
    elif open_end == "e":
        deck_x = cx - arm_w / 4
    box(f"{tag}Deck", (deck_x, cy - s * 0.02, deck_z),
        (inner + 0.10, depth - 0.14, deck_h), mats["sofa_dk"], col, parent, bevel=0.03)
    box(f"{tag}Rail", (cx, cy + s * (depth / 2 - 0.042), frame_z + 0.048),
        (inner + 0.04, 0.078, 0.118), mats["sofa_dk"], col, parent, bevel=0.02)
    box(f"{tag}Apron", (cx, cy + s * (depth / 2 - 0.028), FZ + 0.112),
        (inner + 0.10, 0.058, 0.078), mats["walnut"], col, parent, bevel=0.01)
    box(f"{tag}ApronIn", (cx, cy + s * (depth / 2 - 0.038), FZ + 0.126),
        (inner + 0.04, 0.016, 0.028), mats["wood_dk"], col, parent, bevel=0.004)
    box(f"{tag}Kick", (cx, cy + s * (depth / 2 - 0.07), FZ + 0.072),
        (inner - 0.02, 0.036, 0.038), mats["walnut"], col, parent, bevel=0.006)
    box(f"{tag}Back", (cx, cy - s * (depth / 2 - back_t / 2), FZ + back_h / 2 + 0.04),
        (length - 0.04, back_t, back_h), mats["sofa_dk"], col, parent, bevel=0.05)
    box(f"{tag}BackIn", (cx, cy - s * (depth / 2 - back_t - 0.022), FZ + 0.62),
        (inner - 0.04, 0.05, 0.54), mats["sofa"], col, parent, bevel=0.036)
    box(f"{tag}BackCap",
        (cx, cy - s * (depth / 2 - back_t / 2), FZ + back_h + 0.018),
        (length - 0.10, back_t + 0.02, 0.042), mats["sofa"], col, parent, bevel=0.02)
    box(f"{tag}BackPipe",
        (cx, cy - s * (depth / 2 - 0.018), FZ + back_h - 0.04),
        (inner + 0.02, 0.014, 0.014), mats["linen"], col, parent, bevel=0.005)
    for side, sx in arms:
        ax = cx + sx * (length / 2 - arm_w / 2)
        box(f"{tag}Arm{side}", (ax, cy, FZ + arm_h / 2 + 0.04),
            (arm_w, arm_d, arm_h), mats["sofa_dk"], col, parent, bevel=0.06)
        box(f"{tag}ArmIn{side}", (ax - sx * 0.018, cy + s * 0.01, FZ + arm_h / 2 + 0.06),
            (0.04, arm_d - 0.10, arm_h - 0.16), mats["sofa"], col, parent, bevel=0.03)
        box(f"{tag}ArmFace{side}",
            (ax, cy + s * (arm_d / 2 - 0.018), FZ + arm_h / 2 + 0.04),
            (arm_w - 0.02, 0.036, arm_h - 0.12), mats["sofa"], col, parent, bevel=0.02)
        cyl(f"{tag}ArmRoll{side}", (ax, cy + s * 0.01, FZ + arm_h + 0.028),
            0.062, arm_d - 0.10, mats["sofa"], col, parent, bevel=0.01,
            verts=22, rot=(math.pi / 2, 0.0, 0.0))
        box(f"{tag}ArmPipe{side}",
            (ax, cy + s * (arm_d / 2 - 0.012), FZ + arm_h / 2 + 0.05),
            (arm_w - 0.05, 0.014, arm_h - 0.16), mats["linen"], col, parent, bevel=0.005)
        for k in range(7):
            sphere(f"{tag}Nail{side}{k}",
                   (ax, cy + s * (arm_d / 2 - 0.004), FZ + 0.22 + k * 0.068),
                   0.011, mats["brass"], col, parent)
        box(f"{tag}ApronS{side}", (ax, cy, FZ + 0.100),
            (0.042, depth - 0.22, 0.058), mats["walnut"], col, parent, bevel=0.008)
    if open_end == "e":
        box(f"{tag}OpenCap", (cx + length / 2 - 0.04, cy, FZ + 0.42),
            (0.06, depth - 0.18, 0.36), mats["sofa_dk"], col, parent, bevel=0.04)
    elif open_end == "w":
        box(f"{tag}OpenCap", (cx - length / 2 + 0.04, cy, FZ + 0.42),
            (0.06, depth - 0.18, 0.36), mats["sofa_dk"], col, parent, bevel=0.04)
    cush_w = inner / n_seat - 0.032
    x0 = cx - inner / 2 + cush_w / 2 + 0.016
    if open_end == "w":
        x0 = cx - length / 2 + 0.06 + cush_w / 2
    elif open_end == "e":
        x0 = cx - inner / 2 + cush_w / 2
    for i in range(n_seat):
        xx = x0 + i * (cush_w + 0.032)
        seat_z = deck_z + deck_h / 2 + seat_h / 2 - 0.008
        box(f"{tag}Seat{i}", (xx, cy + s * 0.05, seat_z),
            (cush_w, depth - 0.28, seat_h), mats["sofa"], col, parent, bevel=0.06)
        box(f"{tag}SeatTop{i}", (xx, cy + s * 0.05, seat_z + seat_h / 2 + 0.016),
            (cush_w - 0.05, depth - 0.34, 0.046), mats["sofa"], col, parent, bevel=0.028)
        cyl(f"{tag}SeatPipeF{i}",
            (xx, cy + s * (depth / 2 - 0.168), seat_z + seat_h / 2 - 0.01),
            0.013, cush_w - 0.06, mats["linen"], col, parent, bevel=0.004,
            verts=12, rot=(0.0, math.pi / 2, 0.0))
        cyl(f"{tag}SeatPipeS{i}",
            (xx + cush_w / 2 - 0.012, cy + s * 0.05, seat_z + seat_h / 2 - 0.01),
            0.011, depth - 0.36, mats["linen"], col, parent, bevel=0.003,
            verts=10, rot=(math.pi / 2, 0.0, 0.0))
        by = cy - s * (depth / 2 - back_t - 0.125)
        bc = box(f"{tag}BackC{i}", (xx, by, FZ + 0.62),
                 (cush_w - 0.06, 0.138, 0.46), mats["sofa"], col, parent, bevel=0.055)
        bc.rotation_euler[0] = math.radians(12 * s)
        for r in range(2):
            for c in range(2):
                sofa_button(
                    f"{tag}Btn{i}{r}{c}",
                    (xx - 0.12 + c * 0.24, by + s * 0.07, FZ + 0.50 + r * 0.18),
                    mats, col, parent,
                )
    ix, iy = length / 2 - 0.12, depth / 2 - 0.12
    for i, (lx, ly) in enumerate((
        (cx - ix, cy - iy), (cx + ix, cy - iy),
        (cx - ix, cy + iy), (cx + ix, cy + iy),
    )):
        sofa_leg(f"{tag}Leg{i}", lx, ly, mats, col, parent)
    box(f"{tag}StretchF", (cx, cy + s * (depth / 2 - 0.12), FZ + 0.082),
        (length - 0.28, 0.032, 0.026), mats["walnut"], col, parent, bevel=0.005)
    box(f"{tag}StretchM", (cx, cy, FZ + 0.078),
        (0.028, depth - 0.28, 0.022), mats["walnut"], col, parent, bevel=0.004)



def club_chair(tag, cx, cy, mats, col, parent):
    """Cognac club chair facing +Y (toward the coffee table)."""
    w, d = 0.76, 0.82
    arm_w, arm_h = 0.12, 0.58
    box(f"{tag}Deck", (cx, cy - 0.02, FZ + 0.26),
        (w - 0.18, d - 0.16, 0.10), mats["leather_dk"], col, parent, bevel=0.025)
    box(f"{tag}Seat", (cx, cy + 0.04, FZ + 0.40),
        (w - 0.28, 0.50, 0.13), mats["leather"], col, parent, bevel=0.05)
    box(f"{tag}SeatTop", (cx, cy + 0.04, FZ + 0.475),
        (w - 0.34, 0.44, 0.04), mats["leather"], col, parent, bevel=0.022)
    cyl(f"{tag}SeatPipe", (cx, cy + 0.28, FZ + 0.455),
        0.012, w - 0.36, mats["leather_dk"], col, parent, bevel=0.003,
        verts=12, rot=(0.0, math.pi / 2, 0.0))
    bc = box(f"{tag}BackC", (cx, cy - 0.28, FZ + 0.62),
             (w - 0.30, 0.13, 0.46), mats["leather"], col, parent, bevel=0.05)
    bc.rotation_euler[0] = math.radians(12)
    box(f"{tag}Back", (cx, cy - d / 2 + 0.07, FZ + 0.58),
        (w - 0.08, 0.12, 0.68), mats["leather_dk"], col, parent, bevel=0.045)
    box(f"{tag}BackCap", (cx, cy - d / 2 + 0.07, FZ + 0.94),
        (w - 0.12, 0.14, 0.04), mats["leather"], col, parent, bevel=0.018)
    for r in range(2):
        for c in range(2):
            sphere(f"{tag}Btn{r}{c}",
                   (cx - 0.12 + c * 0.24, cy - 0.22, FZ + 0.52 + r * 0.16),
                   0.013, mats["leather_dk"], col, parent)
    for side, sx in (("L", -1.0), ("R", 1.0)):
        ax = cx + sx * (w / 2 - arm_w / 2)
        box(f"{tag}Arm{side}", (ax, cy, FZ + arm_h / 2 + 0.08),
            (arm_w, d - 0.10, arm_h), mats["leather_dk"], col, parent, bevel=0.05)
        cyl(f"{tag}ArmRoll{side}", (ax, cy + 0.02, FZ + arm_h + 0.06),
            0.055, d - 0.18, mats["leather"], col, parent, bevel=0.008,
            verts=20, rot=(math.pi / 2, 0.0, 0.0))
        box(f"{tag}ArmFace{side}", (ax, cy + d / 2 - 0.06, FZ + arm_h / 2 + 0.08),
            (arm_w - 0.02, 0.03, arm_h - 0.12), mats["leather"], col, parent, bevel=0.016)
        for k in range(6):
            sphere(f"{tag}Nail{side}{k}",
                   (ax, cy + d / 2 - 0.042, FZ + 0.24 + k * 0.07),
                   0.010, mats["brass"], col, parent)
    ix, iy = w / 2 - 0.11, d / 2 - 0.12
    for i, (lx, ly) in enumerate((
        (cx - ix, cy - iy), (cx + ix, cy - iy),
        (cx - ix, cy + iy), (cx + ix, cy + iy),
    )):
        sofa_leg(f"{tag}Leg{i}", lx, ly, mats, col, parent)
    box(f"{tag}Stretch", (cx, cy + 0.22, FZ + 0.08),
        (w - 0.28, 0.028, 0.022), mats["walnut"], col, parent, bevel=0.004)


def coffee_table(tag, cx, cy, mats, col, parent):
    cyl(f"{tag}Foot", (cx, cy, FZ + 0.04), 0.20, 0.04, mats["ink"],
        col, parent, bevel=0.01, verts=28)
    cyl(f"{tag}Post", (cx, cy, FZ + 0.20), 0.055, 0.30, mats["walnut"],
        col, parent, bevel=0.01, verts=20)
    cyl(f"{tag}Ring", (cx, cy, FZ + 0.34), 0.08, 0.018, mats["brass"],
        col, parent, bevel=0.004, verts=20)
    cyl(f"{tag}Top", (cx, cy, FZ + 0.38), 0.46, 0.04, mats["ink"],
        col, parent, bevel=0.012, verts=36)
    cyl(f"{tag}Rim", (cx, cy, FZ + 0.402), 0.47, 0.012, mats["walnut"],
        col, parent, bevel=0.004, verts=36)
    box(f"{tag}BookA", (cx + 0.12, cy + 0.08, FZ + 0.425),
        (0.18, 0.13, 0.018), mats["book_b"], col, parent, bevel=0.004)
    box(f"{tag}BookB", (cx + 0.14, cy + 0.06, FZ + 0.445),
        (0.16, 0.12, 0.016), mats["book_r"], col, parent, bevel=0.003)
    cyl(f"{tag}Tray", (cx - 0.16, cy - 0.10, FZ + 0.418), 0.09, 0.012, mats["brass"],
        col, parent, bevel=0.004, verts=24)
    cyl(f"{tag}Cup", (cx - 0.16, cy - 0.10, FZ + 0.445), 0.032, 0.045, mats["cream"],
        col, parent, bevel=0.006, verts=16)


def tower_speaker(tag, x, y, mats, col, parent):
    """Floorstander against the north wall, baffle facing -Y."""
    box(f"{tag}Plinth", (x, y, FZ + 0.028), (0.30, 0.32, 0.05), mats["walnut"],
        col, parent, bevel=0.01)
    box(f"{tag}Cab", (x, y + 0.01, FZ + 0.58), (0.24, 0.26, 1.02), mats["ink"],
        col, parent, bevel=0.018)
    box(f"{tag}Baffle", (x, y - 0.12, FZ + 0.58), (0.20, 0.025, 0.94), mats["ink"],
        col, parent, bevel=0.008)
    for i, z in enumerate((0.36, 0.62)):
        cyl(f"{tag}Woofer{i}", (x, y - 0.135, FZ + z), 0.072, 0.028, mats["steel"],
            col, parent, bevel=0.004, verts=20, rot=(math.pi / 2, 0.0, 0.0))
        cyl(f"{tag}Cone{i}", (x, y - 0.148, FZ + z), 0.048, 0.016, mats["ink"],
            col, parent, bevel=0.003, verts=16, rot=(math.pi / 2, 0.0, 0.0))
    cyl(f"{tag}Tweet", (x, y - 0.138, FZ + 0.92), 0.028, 0.022, mats["steel"],
        col, parent, bevel=0.003, verts=16, rot=(math.pi / 2, 0.0, 0.0))
    cyl(f"{tag}Port", (x, y - 0.138, FZ + 0.20), 0.022, 0.03, mats["ink"],
        col, parent, bevel=0.003, verts=12, rot=(math.pi / 2, 0.0, 0.0))
    box(f"{tag}Logo", (x, y - 0.135, FZ + 1.05), (0.05, 0.01, 0.012), mats["gold"],
        col, parent, bevel=0.002)
    for i, sx in enumerate((-1.0, 1.0)):
        cyl(f"{tag}Post{i}", (x + sx * 0.04, y + 0.12, FZ + 0.18), 0.008, 0.02,
            mats["brass"], col, parent, bevel=0.002, verts=10)


def projection_screen(cx, mats, col, parent):
    y = NW - 0.05
    box("ScreenCase", (cx, y, 2.38), (3.22, 0.10, 0.10), mats["ink"],
        col, parent, bevel=0.02)
    cyl("ScreenRoll", (cx, y - 0.01, 2.38), 0.038, 3.05, mats["steel"],
        col, parent, bevel=0.006, verts=16, rot=(0.0, math.pi / 2, 0.0))
    box("ScreenCloth", (cx, y - 0.04, 1.58), (2.95, 0.018, 1.48), mats["screen"],
        col, parent, bevel=0.006)
    box("ScreenL", (cx - 1.50, y - 0.03, 1.58), (0.04, 0.04, 1.52), mats["ink"],
        col, parent, bevel=0.008)
    box("ScreenR", (cx + 1.50, y - 0.03, 1.58), (0.04, 0.04, 1.52), mats["ink"],
        col, parent, bevel=0.008)
    box("ScreenBar", (cx, y - 0.05, 0.82), (3.00, 0.05, 0.04), mats["steel"],
        col, parent, bevel=0.008)
    for side, sx in (("L", -1.0), ("R", 1.0)):
        cyl(f"ScreenHook{side}", (cx + sx * 1.52, y, 2.38), 0.012, 0.08,
            mats["steel"], col, parent, bevel=0.003, verts=10, rot=(math.pi / 2, 0.0, 0.0))


def hanging_projector(cx, mats, col, parent):
    y, z = 4.55, 2.48
    box("ProjArm", (cx, (NW + y) / 2, z + 0.04), (0.05, NW - y, 0.04), mats["ink"],
        col, parent, bevel=0.008)
    box("ProjMount", (cx, NW - 0.08, z + 0.04), (0.16, 0.08, 0.08), mats["ink"],
        col, parent, bevel=0.01)
    box("ProjBody", (cx, y, z), (0.32, 0.22, 0.11), mats["ink"],
        col, parent, bevel=0.016)
    box("ProjTop", (cx, y, z + 0.06), (0.28, 0.18, 0.02), mats["steel"],
        col, parent, bevel=0.006)
    cyl("ProjLens", (cx, y - 0.14, z), 0.042, 0.055, mats["steel"],
        col, parent, bevel=0.006, verts=16, rot=(math.pi / 2, 0.0, 0.0))
    cyl("ProjGlass", (cx, y - 0.17, z), 0.028, 0.012, mats["well"],
        col, parent, bevel=0.002, verts=14, rot=(math.pi / 2, 0.0, 0.0))
    box("ProjVent", (cx, y + 0.08, z + 0.04), (0.18, 0.04, 0.012), mats["steel"],
        col, parent, bevel=0.003)


def wall_art(tag, x, y, z, mats, col, parent):
    box(f"{tag}Frame", (x, y, z), (0.04, 0.78, 0.62), mats["walnut"],
        col, parent, bevel=0.01)
    box(f"{tag}Mat", (x + 0.018, y, z), (0.012, 0.68, 0.52), mats["cream"],
        col, parent, bevel=0.004)
    box(f"{tag}Canvas", (x + 0.028, y, z), (0.01, 0.58, 0.42), mats["linen_hi"],
        col, parent, bevel=0.004)
    box(f"{tag}Hill", (x + 0.032, y, z - 0.08), (0.008, 0.58, 0.16), mats["leaf"],
        col, parent, bevel=0.01)
    box(f"{tag}Sun", (x + 0.034, y + 0.12, z + 0.10), (0.008, 0.10, 0.10), mats["mustard"],
        col, parent, bevel=0.02)


def media_console(tag, cx, cy, mats, col, parent):
    box(f"{tag}Rug", (cx, cy + 0.28, FZ + 0.012), (2.55, 1.05, 0.016), mats["linen"],
        col, parent, bevel=0.012)
    box(f"{tag}Body", (cx, cy, FZ + 0.26), (2.20, 0.42, 0.40), mats["ink"],
        col, parent, bevel=0.02)
    box(f"{tag}Top", (cx, cy, FZ + 0.48), (2.28, 0.48, 0.04), mats["walnut"],
        col, parent, bevel=0.01)
    box(f"{tag}Kick", (cx, cy + 0.18, FZ + 0.07), (2.10, 0.04, 0.06), mats["walnut"],
        col, parent, bevel=0.006)
    for i, dx in enumerate((-0.72, 0.0, 0.72)):
        box(f"{tag}Door{i}", (cx + dx, cy + 0.21, FZ + 0.27),
            (0.64, 0.02, 0.30), mats["ink"], col, parent, bevel=0.01)
        box(f"{tag}Handle{i}", (cx + dx + 0.22, cy + 0.23, FZ + 0.27),
            (0.08, 0.016, 0.016), mats["brass"], col, parent, bevel=0.004)
    for i, (lx, ly) in enumerate((
        (cx - 1.00, cy - 0.16), (cx + 1.00, cy - 0.16),
        (cx - 1.00, cy + 0.16), (cx + 1.00, cy + 0.16),
    )):
        cyl(f"{tag}Foot{i}", (lx, ly, FZ + 0.03), 0.028, 0.05, mats["walnut"],
            col, parent, bevel=0.005, verts=12)
    box(f"{tag}Bar", (cx, cy + 0.05, FZ + 0.53), (1.28, 0.10, 0.055), mats["steel"],
        col, parent, bevel=0.01)
    box(f"{tag}BarGrille", (cx, cy + 0.10, FZ + 0.53), (1.10, 0.02, 0.03), mats["ink"],
        col, parent, bevel=0.004)


def build_lounge(mats, prop, veg, light_col):
    parent = empty("ROOM_LOUNGE", (-4.5, 0.4, 0), prop)
    # linen rug under the seating group
    box("LoungeRug", (-4.55, 0.55, FZ + 0.01), (4.7, 3.9, 0.02), mats["linen"],
        prop, parent, bevel=0.02)
    box("LoungeRugIn", (-4.55, 0.55, FZ + 0.018), (4.35, 3.55, 0.012),
        mats["linen_hi"], prop, parent, bevel=0.012)

    # west 2-seat sofa, back to west wall, facing the coffee table
    sofa_along_y("SofaW", -6.38, 0.95, 2.12, 0.92, +1, mats, prop, parent, n_seat=2)
    pillow("SofaWLumbar", (-6.18, 0.95, FZ + 0.54), (0.13, 0.42, 0.13),
           mats["blush"], prop, parent, yaw=6)
    pillow("SofaWThrowA", (-6.20, 1.38, FZ + 0.62), (0.18, 0.32, 0.28),
           mats["linen"], prop, parent, yaw=18, tilt=8)
    pillow("SofaWThrowB", (-6.16, 0.52, FZ + 0.60), (0.16, 0.28, 0.24),
           mats["cream"], prop, parent, yaw=-12, tilt=6)

    # north chaise of the L, open to the east, facing the coffee table
    sofa_along_x("Chaise", -4.82, 2.18, 2.02, 0.90, -1, mats, prop, parent,
                 n_seat=2, open_end="e")
    pillow("ChaiseBolster", (-5.62, 2.05, FZ + 0.58), (0.16, 0.36, 0.16),
           mats["sofa_dk"], prop, parent, yaw=80)
    pillow("ChaiseThrow", (-4.35, 2.08, FZ + 0.56), (0.38, 0.42, 0.08),
           mats["mustard"], prop, parent, yaw=12, tilt=4)
    box("ChaiseFoldA", (-4.05, 2.22, FZ + 0.52), (0.28, 0.34, 0.045),
        mats["mustard_hi"], prop, parent, bevel=0.02)
    box("ChaiseFoldB", (-4.00, 2.20, FZ + 0.56), (0.24, 0.30, 0.04),
        mats["mustard"], prop, parent, bevel=0.018)

    # south sofa facing the screen
    sofa_along_x("SofaS", -4.50, -0.88, 2.28, 0.90, +1, mats, prop, parent, n_seat=2)
    pillow("SofaSThrowL", (-5.18, -0.78, FZ + 0.62), (0.18, 0.30, 0.26),
           mats["blush"], prop, parent, yaw=-16, tilt=7)
    pillow("SofaSThrowR", (-3.88, -0.82, FZ + 0.60), (0.16, 0.26, 0.22),
           mats["cream"], prop, parent, yaw=14, tilt=5)
    pillow("SofaSLumbar", (-4.50, -0.72, FZ + 0.54), (0.46, 0.12, 0.12),
           mats["linen"], prop, parent, yaw=4)

    club_chair("Chair", -6.50, -0.55, mats, prop, parent)
    coffee_table("Table", -4.55, 0.55, mats, prop, parent)

    # floor lamp, east of the south sofa (kept per spec)
    cyl("LampBase", (-2.55, -0.72, FZ + 0.03), 0.11, 0.05, mats["walnut"],
        prop, parent, bevel=0.01)
    cyl("LampPole", (-2.55, -0.72, FZ + 0.72), 0.022, 1.38, mats["walnut"],
        prop, parent, bevel=0.006)
    cone("LampShade", (-2.55, -0.72, FZ + 1.42), 0.20, 0.12, 0.22, mats["lamp"],
         prop, parent, bevel=0.015, verts=24)
    cyl("LampGlow", (-2.55, -0.72, FZ + 1.30), 0.11, 0.02, mats["bulb"],
        light_col, parent, bevel=0.004)

    projection_screen(-4.50, mats, prop, parent)
    tower_speaker("SpeakerL", -6.35, NW - 0.22, mats, prop, parent)
    tower_speaker("SpeakerR", -2.65, NW - 0.22, mats, prop, parent)
    hanging_projector(-4.50, mats, prop, parent)

    gold_sconce("SconceNL", -6.55, NW, 2.22, "s", mats, prop)
    gold_sconce("SconceNR", -2.45, NW, 2.22, "s", mats, prop)
    # lounge-east sconce on the north wall, between lounge and pool
    gold_sconce("SconceLoungeE", -1.15, NW, 1.78, "s", mats, prop)

    wall_art("Art", -8.68, 0.35, 1.58, mats, prop, parent)
    media_console("Console", -4.50, -4.70, mats, prop, parent)

    potted_plant("PlantNW", -7.85, 5.35, FZ, 0.16, 0.24, 9, 0.30, 0.55, mats, veg, parent)
    potted_plant("PlantW", -7.90, 1.85, FZ, 0.14, 0.22, 8, 0.26, 0.48, mats, veg, parent)
    potted_plant("PlantSW", -7.55, -4.55, FZ, 0.15, 0.22, 8, 0.28, 0.50, mats, veg, parent)


def pool_sphere(name, loc, radius, material, col, parent=None, scale=None):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=36, ring_count=20, radius=radius, location=loc
    )
    ob = bpy.context.active_object
    ob.name = name
    if scale:
        ob.scale = scale
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, 0.0)


def build_pool(mats, prop):
    """American 8-foot table: slate, six rails, pockets, 15-ball rack, cues."""
    parent = empty("ROOM_POOL", (0.95, 0.35, 0), prop)
    cx, cy = 0.95, 0.35
    FL, FW = 2.236, 1.118
    RW, RH, CW, CH = 0.122, 0.054, 0.064, 0.046
    bed = FZ + 0.752
    felt_h = 0.012
    slate_h = 0.038
    outer_l, outer_w = FL + 2 * RW, FW + 2 * RW
    foot_y, head_y = cy - FL / 2, cy + FL / 2
    west_x, east_x = cx - FW / 2, cx + FW / 2
    wood_z = bed + CH + RH / 2 - 0.010
    cush_z = bed + CH / 2 + 0.001
    apron_z = bed - 0.088
    CORNER, SIDE = 0.148, 0.092
    OVER = 0.022

    def sight(tag, x, y):
        s = box(tag, (x, y, wood_z + RH / 2 - 0.003), (0.022, 0.022, 0.009),
                mats["ivory"], prop, parent, bevel=0.002)
        s.rotation_euler[2] = math.radians(45)

    def bolts(tag, x, y, length, axis):
        n = max(3, int(length / 0.24))
        for i in range(n):
            t = (i + 0.5) / n - 0.5
            bx = x if axis == "y" else x + t * length
            by = y + t * length if axis == "y" else y
            cyl(f"{tag}Bolt{i}", (bx, by, apron_z + 0.018), 0.007, 0.014,
                mats["brass"], prop, parent, bevel=0.002, verts=12)

    def long_seg(tag, side, y0, y1):
        length = y1 - y0
        mid = (y0 + y1) / 2
        sign = 1 if side == "e" else -1
        x_wood = cx + sign * (FW / 2 + RW / 2)
        x_cush = cx + sign * (FW / 2 - OVER + CW / 2)
        x_face = cx + sign * (FW / 2 + 0.010)
        x_apron = cx + sign * (FW / 2 + RW / 2 + 0.006)
        box(f"{tag}Wood", (x_wood, mid, wood_z), (RW, length, RH),
            mats["walnut"], prop, parent, bevel=0.010)
        box(f"{tag}Cap", (x_wood, mid, wood_z + RH / 2 + 0.004),
            (RW * 0.92, length - 0.012, 0.012), mats["wood_dk"], prop, parent, bevel=0.006)
        box(f"{tag}Inlay", (x_wood, mid, wood_z + RH / 2 + 0.011),
            (RW * 0.38, length - 0.05, 0.004), mats["brass"], prop, parent, bevel=0.001)
        box(f"{tag}Cush", (x_cush, mid, cush_z), (CW, length - 0.018, CH),
            mats["felt_nose"], prop, parent, bevel=0.012)
        box(f"{tag}Face", (x_face, mid, bed + 0.018), (0.018, length - 0.02, 0.028),
            mats["felt_nose"], prop, parent, bevel=0.006)
        box(f"{tag}Apron", (x_apron, mid, apron_z), (RW * 0.90, length, 0.14),
            mats["wood_dk"], prop, parent, bevel=0.012)
        bolts(tag, x_apron, mid, length, "y")
        for k in (1, 2, 3, 5, 6, 7):
            yd = foot_y + k * FL / 8
            if y0 + 0.05 < yd < y1 - 0.05:
                sight(f"{tag}Sight{k}", x_wood, yd)
        for end, yj in ((0, y0), (1, y1)):
            box(f"{tag}Jaw{end}", (x_cush, yj, cush_z), (CW * 0.9, 0.036, CH),
                mats["leather_dk"], prop, parent, bevel=0.008)

    def short_seg(tag, end, x0, x1):
        length = x1 - x0
        mid = (x0 + x1) / 2
        sign = -1 if end == "s" else 1
        y_wood = cy + sign * (FL / 2 + RW / 2)
        y_cush = cy + sign * (FL / 2 - OVER + CW / 2)
        y_face = cy + sign * (FL / 2 + 0.010)
        y_apron = cy + sign * (FL / 2 + RW / 2 + 0.006)
        box(f"{tag}Wood", (mid, y_wood, wood_z), (length, RW, RH),
            mats["walnut"], prop, parent, bevel=0.010)
        box(f"{tag}Cap", (mid, y_wood, wood_z + RH / 2 + 0.004),
            (length - 0.012, RW * 0.92, 0.012), mats["wood_dk"], prop, parent, bevel=0.006)
        box(f"{tag}Inlay", (mid, y_wood, wood_z + RH / 2 + 0.011),
            (length - 0.05, RW * 0.38, 0.004), mats["brass"], prop, parent, bevel=0.001)
        box(f"{tag}Cush", (mid, y_cush, cush_z), (length - 0.018, CW, CH),
            mats["felt_nose"], prop, parent, bevel=0.012)
        box(f"{tag}Face", (mid, y_face, bed + 0.018), (length - 0.02, 0.018, 0.028),
            mats["felt_nose"], prop, parent, bevel=0.006)
        box(f"{tag}Apron", (mid, y_apron, apron_z), (length, RW * 0.90, 0.14),
            mats["wood_dk"], prop, parent, bevel=0.012)
        bolts(tag, mid, y_apron, length, "x")
        for k in (1, 2, 3):
            xd = west_x + k * FW / 4
            if x0 + 0.05 < xd < x1 - 0.05:
                sight(f"{tag}Sight{k}", xd, y_wood)
        for endi, xj in ((0, x0), (1, x1)):
            box(f"{tag}Jaw{endi}", (xj, y_cush, cush_z), (0.036, CW * 0.9, CH),
                mats["leather_dk"], prop, parent, bevel=0.008)

    # turned legs
    inset = 0.17
    leg_xy = (
        (cx - outer_w / 2 + inset, cy - outer_l / 2 + inset),
        (cx + outer_w / 2 - inset, cy - outer_l / 2 + inset),
        (cx - outer_w / 2 + inset, cy + outer_l / 2 - inset),
        (cx + outer_w / 2 - inset, cy + outer_l / 2 - inset),
    )
    for i, (lx, ly) in enumerate(leg_xy):
        cyl(f"LegPad{i}", (lx, ly, FZ + 0.016), 0.072, 0.028, mats["ink"],
            prop, parent, bevel=0.006, verts=20)
        cyl(f"LegBun{i}", (lx, ly, FZ + 0.055), 0.062, 0.055, mats["walnut"],
            prop, parent, bevel=0.01, verts=20)
        cone(f"LegTaper{i}", (lx, ly, FZ + 0.20), 0.054, 0.036, 0.22,
             mats["walnut"], prop, parent, bevel=0.01, verts=20)
        cyl(f"LegRing{i}", (lx, ly, FZ + 0.335), 0.046, 0.028, mats["brass"],
            prop, parent, bevel=0.006, verts=16)
        cone(f"LegUpper{i}", (lx, ly, FZ + 0.46), 0.038, 0.050, 0.20,
             mats["walnut"], prop, parent, bevel=0.01, verts=20)
        box(f"LegCap{i}", (lx, ly, FZ + 0.58), (0.115, 0.115, 0.10),
            mats["wood_dk"], prop, parent, bevel=0.014)

    # stretchers between legs
    box("StretchS", (cx, cy - outer_l / 2 + inset, FZ + 0.21),
        (outer_w - 2 * inset - 0.08, 0.045, 0.04), mats["walnut"], prop, parent, bevel=0.008)
    box("StretchN", (cx, cy + outer_l / 2 - inset, FZ + 0.21),
        (outer_w - 2 * inset - 0.08, 0.045, 0.04), mats["walnut"], prop, parent, bevel=0.008)
    box("StretchW", (cx - outer_w / 2 + inset, cy, FZ + 0.21),
        (0.045, outer_l - 2 * inset - 0.08, 0.04), mats["walnut"], prop, parent, bevel=0.008)
    box("StretchE", (cx + outer_w / 2 - inset, cy, FZ + 0.21),
        (0.045, outer_l - 2 * inset - 0.08, 0.04), mats["walnut"], prop, parent, bevel=0.008)
    box("StretchX", (cx, cy, FZ + 0.205), (outer_w - 2 * inset - 0.16, 0.038, 0.032),
        mats["wood_dk"], prop, parent, bevel=0.006)

    box("PoolSlate", (cx, cy, bed - felt_h - slate_h / 2),
        (FW + 0.06, FL + 0.06, slate_h), mats["slate"], prop, parent, bevel=0.006)
    box("PoolBed", (cx, cy, bed - 0.078), (outer_w - 0.05, outer_l - 0.05, 0.09),
        mats["walnut"], prop, parent, bevel=0.02)
    box("PoolFelt", (cx, cy, bed - felt_h / 2), (FW, FL, felt_h),
        mats["felt"], prop, parent, bevel=0.006)
    # spots
    cyl("FootSpot", (cx, cy - FL / 4, bed + 0.001), 0.012, 0.003, mats["ivory"],
        prop, parent, bevel=0.001, verts=16)
    cyl("HeadSpot", (cx, cy + FL / 4, bed + 0.001), 0.012, 0.003, mats["ivory"],
        prop, parent, bevel=0.001, verts=16)
    cyl("CenterSpot", (cx, cy, bed + 0.001), 0.008, 0.003, mats["ivory"],
        prop, parent, bevel=0.001, verts=14)

    long_seg("RailES", "e", foot_y + CORNER, cy - SIDE)
    long_seg("RailEN", "e", cy + SIDE, head_y - CORNER)
    long_seg("RailWS", "w", foot_y + CORNER, cy - SIDE)
    long_seg("RailWN", "w", cy + SIDE, head_y - CORNER)
    short_seg("RailS", "s", west_x + CORNER, east_x - CORNER)
    short_seg("RailN", "n", west_x + CORNER, east_x - CORNER)

    # pockets: leather hole, brass iron, hanging leather bag
    corners = (
        (west_x, foot_y, math.radians(225)),
        (east_x, foot_y, math.radians(315)),
        (west_x, head_y, math.radians(135)),
        (east_x, head_y, math.radians(45)),
    )
    for i, (px, py, ang) in enumerate(corners):
        cyl(f"PockHoleC{i}", (px, py, bed + 0.003), 0.070, 0.018, mats["ink"],
            prop, parent, bevel=0.003, verts=24)
        torus(f"PockIronC{i}", (px, py, bed + 0.016), 0.074, 0.012, mats["brass"],
              prop, parent)
        torus(f"PockLeatherC{i}", (px, py, bed + 0.008), 0.060, 0.010, mats["leather_dk"],
              prop, parent)
        bag_x = px + 0.042 * math.cos(ang)
        bag_y = py + 0.042 * math.sin(ang)
        cone(f"PockBagC{i}", (bag_x, bag_y, bed - 0.12), 0.058, 0.020, 0.16,
             mats["leather_dk"], prop, parent, bevel=0.01, verts=18)
        cyl(f"PockRingC{i}", (bag_x, bag_y, bed - 0.028), 0.050, 0.018, mats["brass"],
            prop, parent, bevel=0.004, verts=16)
        cyl(f"PockThroatC{i}", (px, py, bed - 0.04), 0.052, 0.06, mats["leather"],
            prop, parent, bevel=0.006, verts=16)
    for i, (px, py, ang) in enumerate((
        (west_x, cy, math.radians(180)),
        (east_x, cy, math.radians(0)),
    )):
        cyl(f"PockHoleS{i}", (px, py, bed + 0.003), 0.060, 0.018, mats["ink"],
            prop, parent, bevel=0.003, verts=22)
        torus(f"PockIronS{i}", (px, py, bed + 0.016), 0.064, 0.011, mats["brass"],
              prop, parent)
        torus(f"PockLeatherS{i}", (px, py, bed + 0.008), 0.052, 0.009, mats["leather_dk"],
              prop, parent)
        bag_x = px + 0.038 * math.cos(ang)
        bag_y = py + 0.038 * math.sin(ang)
        cone(f"PockBagS{i}", (bag_x, bag_y, bed - 0.11), 0.050, 0.018, 0.14,
             mats["leather_dk"], prop, parent, bevel=0.01, verts=16)
        cyl(f"PockThroatS{i}", (px, py, bed - 0.036), 0.046, 0.05, mats["leather"],
            prop, parent, bevel=0.006, verts=14)

    # 15-ball rack at the foot spot, apex toward the head
    BR = 0.0286
    gap = 0.0008
    sx, sy = BR * 2 + gap, (BR * 2 + gap) * math.sqrt(3) / 2
    ay = cy - FL / 4
    az = bed + BR - 0.001
    solids = {
        1: mats["ball_yel"], 2: mats["ball_blu"], 3: mats["ball_red"],
        4: mats["ball_pur"], 5: mats["ball_org"], 6: mats["ball_grn"],
        7: mats["ball_mar"], 8: mats["ball_blk"],
    }
    stripes = {
        9: mats["ball_yel"], 10: mats["ball_blu"], 11: mats["ball_red"],
        12: mats["ball_pur"], 13: mats["ball_org"], 14: mats["ball_grn"],
        15: mats["ball_mar"],
    }
    rack = (1, 10, 2, 11, 8, 7, 9, 6, 14, 4, 15, 13, 12, 5, 3)
    n = 0
    for row in range(5):
        for i in range(row + 1):
            num = rack[n]
            n += 1
            bx = cx + (i - row / 2) * sx
            by = ay - row * sy
            body = solids[num] if num in solids else stripes[num]
            pool_sphere(f"Ball{num}", (bx, by, az), BR, body, prop, parent)
            if num in stripes:
                pool_sphere(f"Ball{num}Band", (bx, by, az), BR * 1.012, mats["ivory"],
                            prop, parent, scale=(1.0, 1.0, 0.26))
            if num == 8:
                cyl("Ball8Spot", (bx, by, az + BR * 0.84), 0.009, 0.003,
                    mats["ivory"], prop, parent, bevel=0.001, verts=14)

    def stick(name, p0, p1, w, h, z):
        mx = (p0[0] + p1[0]) / 2
        my = (p0[1] + p1[1]) / 2
        dx = p1[0] - p0[0]
        dy = p1[1] - p0[1]
        ob = box(name, (mx, my, z), (w, math.hypot(dx, dy), h),
                 mats["wood_hi"], prop, parent, bevel=0.003)
        ob.rotation_euler[2] = math.atan2(dx, dy)
        return ob

    pad = 0.006
    apex = (cx, ay + BR + pad)
    base_y = ay - 4 * sy - BR - pad
    half = 2 * sx + BR + pad
    bl, brp = (cx - half, base_y), (cx + half, base_y)
    stick("RackLeft", apex, bl, 0.016, 0.028, az + 0.006)
    stick("RackRight", apex, brp, 0.016, 0.028, az + 0.006)
    stick("RackBase", bl, brp, 0.016, 0.028, az + 0.006)

    pool_sphere("CueBall", (cx - 0.08, cy + FL / 4, az), BR, mats["white"],
                prop, parent)

    def cue(tag, x, y, z, yaw):
        dx, dy = math.sin(yaw), math.cos(yaw)
        rot = (math.radians(90), 0, yaw)
        parts = (
            ("Tip", 0.0085, 0.016, mats["ivory"]),
            ("Ferrule", 0.0100, 0.032, mats["white"]),
            ("Shaft", 0.0125, 0.70, mats["wood_hi"]),
            ("Joint", 0.0138, 0.022, mats["brass"]),
            ("Wrap", 0.0155, 0.22, mats["cue_wrap"]),
            ("Butt", 0.0185, 0.34, mats["walnut"]),
            ("ButtCap", 0.0195, 0.030, mats["brass"]),
        )
        cursor = 0.72
        for pname, radius, length, material in parts:
            off = cursor - length / 2
            cyl(f"{tag}{pname}", (x + dx * off, y + dy * off, z), radius, length,
                material, prop, parent, bevel=0.002, verts=16, rot=rot)
            cursor -= length

    cue("CueA", cx + 0.18, cy + 0.22, bed + 0.014, math.radians(18))
    cue("CueB", cx - 0.22, cy - 0.08, bed + 0.016, math.radians(-14))

    box("ChalkA", (cx + 0.20, head_y + RW / 2, wood_z + RH / 2 + 0.016),
        (0.028, 0.028, 0.026), mats["chalk"], prop, parent, bevel=0.003)
    box("ChalkB", (cx + 0.25, head_y + RW / 2, wood_z + RH / 2 + 0.016),
        (0.028, 0.028, 0.026), mats["chalk"], prop, parent, bevel=0.003)
    cyl("BridgeShaft", (east_x + RW / 2, cy + 0.38, wood_z + 0.018), 0.008, 0.52,
        mats["wood_hi"], prop, parent, bevel=0.002, verts=12,
        rot=(math.radians(90), 0, math.radians(8)))
    box("BridgeHead", (east_x + RW / 2 - 0.012, cy + 0.64, wood_z + 0.028),
        (0.046, 0.014, 0.026), mats["walnut"], prop, parent, bevel=0.003)
    for i, dx in enumerate((-0.014, 0.0, 0.014)):
        cyl(f"BridgeProng{i}", (east_x + RW / 2 - 0.012 + dx, cy + 0.655,
                                wood_z + 0.042), 0.004, 0.018, mats["ivory"],
            prop, parent, bevel=0.001, verts=10)


def build_bar(mats, prop, veg, light_col):
    parent = empty("ROOM_BAR", (5.5, 0.4, 0), prop)
    # north-south island
    box("BarBody", (5.35, 0.35, FZ + 0.46), (0.78, 3.45, 0.90), mats["ink"],
        prop, parent, bevel=0.035)
    box("BarTop", (5.35, 0.35, FZ + 0.94), (0.92, 3.58, 0.08), mats["marble"],
        prop, parent, bevel=0.018)
    box("BarVeinA", (5.42, 0.10, FZ + 0.985), (0.04, 2.4, 0.012), mats["gold"],
        prop, parent, bevel=0.004)
    box("BarVeinB", (5.22, 0.80, FZ + 0.985), (0.03, 1.6, 0.012), mats["marble_hi"],
        prop, parent, bevel=0.004)
    # L-return toward the east wall
    box("BarReturn", (6.55, 1.90, FZ + 0.46), (1.70, 0.70, 0.90), mats["ink"],
        prop, parent, bevel=0.03)
    box("BarReturnTop", (6.55, 1.90, FZ + 0.94), (1.82, 0.82, 0.08), mats["marble"],
        prop, parent, bevel=0.016)

    for i, y in enumerate((-0.95, -0.05, 0.85, 1.75)):
        cyl(f"StoolSeat{i}", (4.48, y, FZ + 0.62), 0.16, 0.07, mats["ink"],
            prop, parent, bevel=0.02)
        cyl(f"StoolPost{i}", (4.48, y, FZ + 0.32), 0.032, 0.58, mats["walnut"],
            prop, parent, bevel=0.006)
        cyl(f"StoolFoot{i}", (4.48, y, FZ + 0.04), 0.11, 0.04, mats["walnut"],
            prop, parent, bevel=0.008)
        torus(f"StoolRing{i}", (4.48, y, FZ + 0.22), 0.12, 0.012, mats["steel"],
              prop, parent)

    # back bar + bottle shelves on the east wall
    box("BackCab", (8.28, 0.55, FZ + 0.46), (0.55, 2.55, 0.90), mats["walnut"],
        prop, parent, bevel=0.025)
    box("BackTop", (8.22, 0.55, FZ + 0.94), (0.62, 2.62, 0.07), mats["marble"],
        prop, parent, bevel=0.014)
    for s, z in enumerate((1.28, 1.68, 2.08)):
        box(f"WineShelf{s}", (8.38, 0.55, z), (0.28, 2.40, 0.04), mats["walnut"],
            prop, parent, bevel=0.01)
        box(f"WineLight{s}", (8.32, 0.55, z - 0.04), (0.08, 2.28, 0.02),
            mats["lamp"], prop, parent, bevel=0.004)
        bottle_m = (mats["book_r"], mats["felt"], mats["gold"], mats["cream"],
                    mats["book_b"], mats["leather"], mats["ink"])
        for i in range(8):
            cyl(f"Bottle{s}_{i}", (8.38, -0.50 + i * 0.30, z + 0.14), 0.04, 0.22,
                bottle_m[(s + i) % 7], prop, parent, bevel=0.008)
    for i, y in enumerate((-0.15, 0.35, 0.85, 1.35)):
        cyl(f"TopBottle{i}", (8.10, y, FZ + 1.08), 0.038, 0.20,
            (mats["gold"], mats["book_r"], mats["felt"], mats["cream"])[i],
            prop, parent, bevel=0.008)
        cyl(f"WineGlass{i}", (8.10, y + 0.18, FZ + 1.02), 0.028, 0.08, mats["well"],
            prop, parent, bevel=0.006)

    # tall black fridge between bar return and stairs
    box("Fridge", (8.22, 2.85, FZ + 0.92), (0.62, 0.70, 1.82), mats["ink"],
        prop, parent, bevel=0.025)
    box("FridgeHandle", (7.88, 2.72, FZ + 1.05), (0.04, 0.04, 0.55), mats["steel"],
        prop, parent, bevel=0.006)

    gold_sconce("SconceBar", EW, 0.55, 2.20, "w", mats, prop)
    gold_sconce("SconceSE", EW, -2.65, 1.72, "w", mats, prop)

    for i, y in enumerate((-0.70, 0.40, 1.50)):
        cyl(f"BarCord{i}", (5.35, y, (2.78 + 1.72) / 2), 0.010, 2.78 - 1.72,
            mats["ink"], prop, parent, bevel=0.003)
        cone(f"BarShade{i}", (5.35, y, 1.72), 0.16, 0.05, 0.18, mats["ink"],
             prop, parent, bevel=0.012, verts=24)
        cyl(f"BarGlow{i}", (5.35, y, 1.60), 0.11, 0.02, mats["bulb"],
            light_col, parent, bevel=0.004)


def build_stairs(mats, prop):
    """NE corner, against the east wall, climbing toward the north wall."""
    parent = empty("ROOM_STAIRS", (7.85, 4.4, 0), prop)
    rise, run, y0 = 0.155, 0.28, 3.35
    sx, rail_x = 7.95, 7.38
    for i in range(9):
        h = (i + 1) * rise
        cy = y0 + i * run + run / 2
        box(f"Stair{i}", (sx, cy, FZ + h / 2), (1.05, run + 0.02, h),
            mats["walnut"] if i % 2 else mats["wood_dk"], prop, parent, bevel=0.012)
    rail_pts = [(rail_x, y0, FZ + rise + 0.70)]
    for j, i in enumerate((0, 2, 4, 6, 8)):
        top = FZ + (i + 1) * rise
        cy = y0 + i * run + run / 2
        cyl(f"StairPost{j}", (rail_x, cy, top + 0.36), 0.022, 0.72,
            mats["walnut"], prop, parent, bevel=0.007)
        rail_pts.append((rail_x, cy, top + 0.72))
    tube("StairRail", rail_pts, 0.026, mats["walnut"], prop, parent)
    cyl("StairNewel", (rail_x, y0 + 0.04, FZ + 0.52), 0.035, 0.90, mats["walnut"],
        prop, parent, bevel=0.01)
    sphere("StairNewelCap", (rail_x, y0 + 0.04, FZ + 0.98), 0.05, mats["walnut"],
           prop, parent)
    box("StairDoor", (8.22, 5.95, 1.35), (0.08, 0.72, 1.95), mats["walnut"],
        prop, parent, bevel=0.02)
    box("StairDoorPanel", (8.16, 5.95, 1.35), (0.03, 0.52, 1.55), mats["wood_dk"],
        prop, parent, bevel=0.01)


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
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PNG)
    bpy.ops.render.render(write_still=True)


def main():
    clear_scene()
    setup_world()
    geo = coll("GEO_BUILDING")
    prop = coll("GEO_PROP")
    veg = coll("GEO_VEG")
    light_col = coll("GEO_LIGHT")
    coll("CAM")
    coll("ENV")

    mats = {k: mat(f"M_{k}", v, 0.55) for k, v in PAL.items()}
    mats["well"] = mat("M_well", PAL["well"], 0.22, emit=0.85, alpha=0.35)
    mats["daylight"] = mat("M_daylight", PAL["daylight"], 0.5, emit=0.9)
    mats["lamp"] = mat("M_lamp", PAL["lamp"], 0.4, emit=1.6)
    mats["bulb"] = mat("M_bulb", PAL["bulb"], 0.3, emit=5.5)
    mats["gold"] = mat("M_gold", PAL["gold"], 0.35, metal=0.55)
    mats["screen"] = mat("M_screen", PAL["screen"], 0.28, emit=0.35)
    mats["marble"] = mat("M_marble", PAL["marble"], 0.28)
    mats["felt"] = mat("M_felt", PAL["felt"], 0.78)
    mats["felt_nose"] = mat("M_felt_nose", PAL["felt_nose"], 0.70)
    mats["brass"] = mat("M_brass", PAL["brass"], 0.32, metal=0.72)
    mats["slate"] = mat("M_slate", PAL["slate"], 0.55)
    mats["chalk"] = mat("M_chalk", PAL["chalk"], 0.85)
    mats["ball_blk"] = mat("M_ball_blk", PAL["ball_blk"], 0.28)

    setup_camera_lights()
    build_shell(mats, geo)
    build_planks(mats, geo)
    build_light_well(mats, geo, veg)
    build_lounge(mats, prop, veg, light_col)
    build_pool(mats, prop)
    build_bar(mats, prop, veg, light_col)
    build_stairs(mats, prop)

    OUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    export_glb()
    render_preview()
    print("saved", BLEND)
    print("glb", GLB, "bytes", GLB.stat().st_size if GLB.exists() else 0)
    print("png", PNG, "bytes", PNG.stat().st_size if PNG.exists() else 0)
    print("meshes", sum(1 for o in bpy.data.objects if o.type == "MESH"))


main()
