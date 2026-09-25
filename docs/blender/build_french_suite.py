"""Connected French luxury suite: bedroom + ensuite + balcony.

One 24 x 16 m rectangular cutaway. South terrace, west bath, east bedroom,
enfilade through a wide cased opening. Ivory boiserie, herringbone, marble,
brass. Furniture stays residential scale.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path(r"E:\Hangyu\VibeCoding\blender")
BLEND = OUT / "french-suite.blend"
PNG = OUT / "french-suite.png"
GLB = OUT / "french-suite.glb"

# inner floor 24 (X) x 16 (Y)
EW = 12.16
WW = -12.16
NW = 8.16
SY = -8.00
BALC = -4.00
SPLIT = -4.00
FZ = 0.174
WALL_T = 0.16
WALL_H = 2.60
WALL_Z = 1.45
CAP_Z = 2.785

PAL = {
    "wall": (0.930, 0.880, 0.800, 1),
    "wall_hi": (0.965, 0.935, 0.880, 1),
    "panel": (0.948, 0.910, 0.845, 1),
    "plinth": (0.235, 0.170, 0.115, 1),
    "plinth_hi": (0.360, 0.270, 0.180, 1),
    "skirt": (0.900, 0.845, 0.760, 1),
    "floor": (0.780, 0.600, 0.410, 1),
    "wood": (0.760, 0.575, 0.385, 1),
    "wood_hi": (0.855, 0.690, 0.490, 1),
    "wood_dk": (0.585, 0.415, 0.265, 1),
    "walnut": (0.360, 0.250, 0.160, 1),
    "basebd": (0.955, 0.930, 0.880, 1),
    "ivory": (0.955, 0.925, 0.860, 1),
    "linen": (0.930, 0.890, 0.810, 1),
    "linen_hi": (0.965, 0.940, 0.885, 1),
    "blush": (0.900, 0.720, 0.660, 1),
    "sage": (0.520, 0.620, 0.500, 1),
    "sage_hi": (0.680, 0.760, 0.640, 1),
    "camel": (0.760, 0.560, 0.400, 1),
    "leather": (0.560, 0.360, 0.240, 1),
    "leather_dk": (0.420, 0.270, 0.175, 1),
    "marble": (0.920, 0.885, 0.830, 1),
    "marble_vein": (0.740, 0.715, 0.675, 1),
    "stone": (0.780, 0.700, 0.580, 1),
    "teak": (0.620, 0.430, 0.270, 1),
    "gold": (0.815, 0.630, 0.385, 1),
    "brass": (0.720, 0.540, 0.270, 1),
    "iron": (0.130, 0.120, 0.115, 1),
    "ink": (0.145, 0.125, 0.115, 1),
    "white": (0.970, 0.960, 0.940, 1),
    "cream": (0.945, 0.905, 0.830, 1),
    "lamp": (1.000, 0.860, 0.620, 1),
    "bulb": (1.000, 0.840, 0.550, 1),
    "glass": (0.780, 0.860, 0.900, 1),
    "leaf": (0.360, 0.540, 0.340, 1),
    "leaf_dk": (0.260, 0.430, 0.275, 1),
    "pot": (0.700, 0.430, 0.300, 1),
    "geranium": (0.720, 0.280, 0.240, 1),
    "soil": (0.280, 0.200, 0.130, 1),
    "rug": (0.910, 0.850, 0.760, 1),
    "rug_bd": (0.500, 0.590, 0.470, 1),
    "rug_med": (0.700, 0.430, 0.310, 1),
    "book_r": (0.720, 0.360, 0.300, 1),
    "book_g": (0.480, 0.560, 0.430, 1),
}


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
        segments=16, ring_count=10, radius=radius, location=loc
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
         verts=16, rot=None, scale=None):
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


def torus(name, loc, major, minor, material, col, parent=None, rot=None):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, major_segments=28,
        minor_segments=10, location=loc, rotation=rot or (0, 0, 0),
    )
    ob = bpy.context.active_object
    ob.name = name
    if ob.data.materials:
        ob.data.materials[0] = material
    else:
        ob.data.materials.append(material)
    put(ob, col, parent)
    return finish(ob, 0.0)


def empty(name, loc, col):
    ob = bpy.data.objects.new(name, None)
    col.objects.link(ob)
    ob.location = loc
    return ob


def look_at(ob, target):
    direction = Vector(target) - ob.location
    ob.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def add_point(name, loc, energy, color, col, soft=0.4):
    data = bpy.data.lights.new(name + "Data", "POINT")
    data.energy = energy
    data.color = color
    data.shadow_soft_size = soft
    ob = bpy.data.objects.new(name, data)
    ob.location = loc
    col.objects.link(ob)
    return ob


def potted_plant(name, x, y, z0, pot_r, pot_h, n_leaves, spread, leaf_len,
                 mats, col, parent=None, pot_mat=None):
    cyl(f"{name}Pot", (x, y, z0 + pot_h / 2), pot_r, pot_h, pot_mat or mats["pot"],
        col, parent, bevel=0.015)
    torus(f"{name}Rim", (x, y, z0 + pot_h), pot_r * 0.92, pot_r * 0.18,
          pot_mat or mats["pot"], col, parent)
    cyl(f"{name}Soil", (x, y, z0 + pot_h - 0.01), pot_r * 0.82, 0.02,
        mats["soil"], col, parent, bevel=0.004)
    rnd = random.Random(hash(name) & 0xFFFF)
    for i in range(n_leaves):
        a = 2 * math.pi * i / n_leaves + rnd.uniform(-0.2, 0.2)
        tilt = math.radians(rnd.uniform(22, 48))
        ln = leaf_len * rnd.uniform(0.8, 1.12)
        lx = x + math.cos(a) * spread * 0.3
        ly = y + math.sin(a) * spread * 0.3
        lz = z0 + pot_h + ln * 0.3
        cone(f"{name}Leaf{i}", (lx, ly, lz), 0.05, 0.012, ln,
             mats["leaf"] if i % 2 else mats["leaf_dk"], col, parent,
             bevel=0.006, verts=10, rot=(tilt, 0, a), scale=(1, 0.45, 1))


def gold_sconce(name, x, y, z, facing, mats, col, parent=None):
    if facing == "s":
        box(f"{name}Back", (x, y + 0.02, z), (0.08, 0.03, 0.12), mats["brass"],
            col, parent, bevel=0.008)
        box(f"{name}Arm", (x, y - 0.07, z), (0.04, 0.14, 0.04), mats["brass"],
            col, parent, bevel=0.006)
        cyl(f"{name}Shade", (x, y - 0.16, z - 0.04), 0.07, 0.12, mats["lamp"],
            col, parent, bevel=0.012)
    elif facing == "e":
        box(f"{name}Back", (x - 0.02, y, z), (0.03, 0.08, 0.12), mats["brass"],
            col, parent, bevel=0.008)
        box(f"{name}Arm", (x + 0.07, y, z), (0.14, 0.04, 0.04), mats["brass"],
            col, parent, bevel=0.006)
        cyl(f"{name}Shade", (x + 0.16, y, z - 0.04), 0.07, 0.12, mats["lamp"],
            col, parent, bevel=0.012)
    else:
        box(f"{name}Back", (x + 0.02, y, z), (0.03, 0.08, 0.12), mats["brass"],
            col, parent, bevel=0.008)
        box(f"{name}Arm", (x - 0.07, y, z), (0.14, 0.04, 0.04), mats["brass"],
            col, parent, bevel=0.006)
        cyl(f"{name}Shade", (x - 0.16, y, z - 0.04), 0.07, 0.12, mats["lamp"],
            col, parent, bevel=0.012)


def setup_world():
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.78, 0.74, 0.68, 1)
    bg.inputs["Strength"].default_value = 0.72


def setup_camera_lights():
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new("CAM_ISOData")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 31.0
    cam_data.clip_start = 0.1
    cam_data.clip_end = 160
    cam = bpy.data.objects.new("CAM_ISO", cam_data)
    cam.location = (12.8, -34.5, 21.6)
    scene.collection.objects.link(cam)
    look_at(cam, (0.2, 0.6, 0.85))
    scene.camera = cam
    put(cam, coll("CAM"))

    sun_d = bpy.data.lights.new("L_SunData", "SUN")
    sun_d.energy = 1.15
    sun_d.angle = math.radians(42)
    sun_d.color = (1.0, 0.92, 0.78)
    sun = bpy.data.objects.new("L_Sun", sun_d)
    sun.location = (14.0, -16.0, 28.0)
    sun.rotation_euler = (math.radians(50), math.radians(8), math.radians(32))
    scene.collection.objects.link(sun)
    put(sun, coll("ENV"))

    fill_d = bpy.data.lights.new("L_FillData", "AREA")
    fill_d.energy = 520
    fill_d.size = 12
    fill_d.color = (1.0, 0.93, 0.84)
    fill = bpy.data.objects.new("L_Fill", fill_d)
    fill.location = (-12.0, -14.0, 16.0)
    scene.collection.objects.link(fill)
    look_at(fill, (0, 0.4, 1.0))
    put(fill, coll("ENV"))

    env = coll("ENV")
    add_point("L_Chandelier", (4.0, 2.0, 2.35), 42, (1.0, 0.86, 0.62), env, 0.55)
    add_point("L_Bed", (4.0, 6.6, 1.85), 16, (1.0, 0.84, 0.58), env, 0.4)
    add_point("L_Vanity", (11.2, -0.4, 1.7), 12, (1.0, 0.88, 0.70), env, 0.3)
    add_point("L_Bath", (-8.0, 2.0, 2.15), 28, (1.0, 0.90, 0.78), env, 0.5)
    add_point("L_VanBath", (-11.2, 2.0, 1.75), 14, (1.0, 0.88, 0.72), env, 0.3)
    add_point("L_Balcony", (4.0, -6.0, 2.0), 18, (0.95, 0.94, 0.86), env, 0.7)


def build_shell(mats, geo):
    box("Plinth", (0, 0, -0.15), (26.8, 18.9, 0.3), mats["plinth"], geo, bevel=0.10)
    box("PlinthHi", (0, 0, -0.005), (26.05, 18.15, 0.06), mats["plinth_hi"], geo, bevel=0.03)
    box("Skirt", (0, 0, 0.06), (25.35, 17.45, 0.10), mats["skirt"], geo, bevel=0.045)
    box("Floor", (0, 0, 0.115), (24.0, 16.0, 0.07), mats["floor"], geo, bevel=0.02)

    box("WallNorth", (0, 8.24, WALL_Z), (24.96, WALL_T, WALL_H), mats["wall"], geo, bevel=0.05)
    box("WallWest", (-12.24, 0, WALL_Z), (WALL_T, 16.48, WALL_H), mats["wall"], geo, bevel=0.05)
    box("WallEast", (12.24, 0, WALL_Z), (WALL_T, 16.48, WALL_H), mats["wall"], geo, bevel=0.05)
    box("CapNorth", (0, 8.24, CAP_Z), (25.02, 0.20, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapWest", (-12.24, 0, CAP_Z), (0.20, 16.52, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapEast", (12.24, 0, CAP_Z), (0.20, 16.52, 0.07), mats["wall_hi"], geo, bevel=0.02)

    box("BaseNorth", (0, 8.13, 0.25), (24.0, 0.06, 0.16), mats["basebd"], geo, bevel=0.015)
    box("BaseWest", (-12.13, 2.0, 0.25), (0.06, 12.2, 0.16), mats["basebd"], geo, bevel=0.015)
    box("BaseEast", (12.13, 2.0, 0.25), (0.06, 12.2, 0.16), mats["basebd"], geo, bevel=0.015)

    box("StubWest", (-11.7, -8.08, 0.38), (1.15, 0.16, 0.46), mats["wall"], geo, bevel=0.04)
    box("StubEast", (11.7, -8.08, 0.38), (1.15, 0.16, 0.46), mats["wall"], geo, bevel=0.04)


def build_partitions(mats, geo):
    """South facade with French doors + west/east split wall with enfilade."""
    # split wall at x = -4, opening 2.2 wide x 2.3 high centered y=2.0
    y0, y1 = 0.90, 3.10
    box("SplitS", (SPLIT, (-3.92 + y0) / 2, WALL_Z),
        (0.18, y0 - (-3.92), WALL_H), mats["wall"], geo, bevel=0.04)
    box("SplitN", (SPLIT, (y1 + 8.08) / 2, WALL_Z),
        (0.18, 8.08 - y1, WALL_H), mats["wall"], geo, bevel=0.04)
    box("SplitHead", (SPLIT, 2.0, 2.62), (0.20, 2.24, 0.32), mats["wall"], geo, bevel=0.03)
    box("SplitCaseL", (SPLIT, y0, 1.32), (0.22, 0.08, 2.30), mats["brass"], geo, bevel=0.01)
    box("SplitCaseR", (SPLIT, y1, 1.32), (0.22, 0.08, 2.30), mats["brass"], geo, bevel=0.01)
    box("SplitCaseT", (SPLIT, 2.0, 2.47), (0.22, 2.28, 0.08), mats["brass"], geo, bevel=0.01)
    box("SplitThresh", (SPLIT, 2.0, FZ + 0.01), (0.28, 2.22, 0.02), mats["brass"], geo, bevel=0.006)
    box("SplitCap", (SPLIT, 2.08, CAP_Z), (0.22, 12.16, 0.07), mats["wall_hi"], geo, bevel=0.02)

    # south interior wall at y = -4, with door/window holes
    # bath window opening x=-8.7 to -7.3
    # bedroom doors centered 0.6, 4.0, 7.4  width 1.15 each
    def south_span(name, x0, x1):
        cx = (x0 + x1) / 2
        box(name, (cx, BALC, WALL_Z), (x1 - x0, WALL_T, WALL_H), mats["wall"], geo, bevel=0.04)

    south_span("FacadeW0", WW + 0.08, -8.75)
    south_span("FacadeW1", -7.25, SPLIT - 0.09)
    south_span("FacadeE0", SPLIT + 0.09, 0.02)
    south_span("FacadeE1", 1.18, 3.42)
    south_span("FacadeE2", 4.58, 6.82)
    south_span("FacadeE3", 7.98, EW - 0.08)
    box("FacadeHeadBath", (-8.0, BALC, 2.58), (1.55, 0.18, 0.40), mats["wall"], geo, bevel=0.03)
    for i, cx in enumerate((0.60, 4.00, 7.40)):
        box(f"FacadeHead{i}", (cx, BALC, 2.58), (1.22, 0.18, 0.40), mats["wall"], geo, bevel=0.03)
    box("FacadeCap", (0.0, BALC, CAP_Z), (24.4, 0.20, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("FacadeSillBath", (-8.0, BALC, FZ + 0.06), (1.55, 0.22, 0.08), mats["brass"], geo, bevel=0.01)
    for i, cx in enumerate((0.60, 4.00, 7.40)):
        box(f"FacadeSill{i}", (cx, BALC, FZ + 0.06), (1.22, 0.22, 0.08), mats["brass"], geo, bevel=0.01)


def french_door(tag, cx, y, mats, col, parent, open_deg=0.0):
    box(f"{tag}Frame", (cx, y, 1.32), (1.18, 0.08, 2.22), mats["walnut"], col, parent, bevel=0.012)
    if open_deg:
        leaf = box(f"{tag}Leaf", (cx - 0.22, y - 0.48, 1.32),
                   (0.07, 0.95, 2.08), mats["walnut"], col, parent, bevel=0.012)
        leaf.rotation_euler[2] = math.radians(open_deg)
        box(f"{tag}LeafGlass", (cx - 0.18, y - 0.48, 1.32),
            (0.02, 0.78, 1.78), mats["glass"], col, parent, bevel=0.006)
    else:
        box(f"{tag}Glass", (cx, y - 0.01, 1.32), (0.96, 0.02, 1.95), mats["glass"], col, parent, bevel=0.006)
        box(f"{tag}MullH", (cx, y - 0.02, 1.32), (0.96, 0.03, 0.04), mats["walnut"], col, parent, bevel=0.004)
        box(f"{tag}MullV", (cx, y - 0.02, 1.32), (0.04, 0.03, 1.95), mats["walnut"], col, parent, bevel=0.004)
        cyl(f"{tag}Knob", (cx + 0.42, y - 0.06, 1.05), 0.018, 0.04, mats["brass"],
            col, parent, bevel=0.004, verts=12, rot=(math.pi / 2, 0, 0))


def build_boiserie(mats, geo):
    """Raised ivory panels — skip openings."""
    # north wall, bedroom + bath
    for i, x in enumerate((-10.6, -7.2, -1.2, 1.8, 4.8, 7.8, 10.6)):
        if -5.2 < x < -2.8:
            continue
        box(f"PanelN{i}", (x, NW - 0.04, 1.45), (2.35, 0.04, 1.85), mats["panel"],
            geo, bevel=0.02)
        box(f"PanelNIn{i}", (x, NW - 0.055, 1.45), (2.05, 0.03, 1.55), mats["wall_hi"],
            geo, bevel=0.016)
    # east wall
    for i, y in enumerate((-1.6, 1.4, 4.4, 6.8)):
        box(f"PanelE{i}", (EW - 0.04, y, 1.45), (0.04, 2.4, 1.85), mats["panel"],
            geo, bevel=0.02)
        box(f"PanelEIn{i}", (EW - 0.055, y, 1.45), (0.03, 2.1, 1.55), mats["wall_hi"],
            geo, bevel=0.016)
    # west wall
    for i, y in enumerate((-1.6, 1.4, 4.4, 6.8)):
        box(f"PanelW{i}", (WW + 0.04, y, 1.45), (0.04, 2.4, 1.85), mats["panel"],
            geo, bevel=0.02)
        box(f"PanelWIn{i}", (WW + 0.055, y, 1.45), (0.03, 2.1, 1.55), mats["wall_hi"],
            geo, bevel=0.016)
    # split wall faces (bedroom side)
    for i, y in enumerate((-2.2, 5.4)):
        box(f"PanelSplt{i}", (SPLIT + 0.11, y, 1.45), (0.04, 2.1, 1.85), mats["panel"],
            geo, bevel=0.02)


def build_floors(mats, geo):
    # balcony teak
    box("BalconyDeck", (0.0, -6.0, FZ - 0.004), (23.7, 3.92, 0.028), mats["teak"],
        geo, bevel=0.01)
    for i, x in enumerate((-9.0, -4.5, 0.0, 4.5, 9.0)):
        box(f"DeckSeam{i}", (x, -6.0, FZ + 0.012), (0.03, 3.7, 0.006), mats["wood_dk"],
            geo, bevel=0.002)

    # bath marble slabs
    shades = (mats["marble"], mats["marble"], mats["marble_vein"])
    n = 0
    x = -11.55
    while x < -4.25:
        y = -3.55
        col_i = int((x + 12) / 1.45)
        while y < 7.9:
            m = shades[(col_i + int((y + 4) / 1.45)) % 3]
            box(f"Marble{n}", (x, y, FZ + 0.006), (1.38, 1.38, 0.022), m, geo, bevel=0.008)
            n += 1
            y += 1.45
        x += 1.45

    # bedroom herringbone chevrons, large modules
    hx0, hx1 = -3.70, 11.85
    hy0, hy1 = -3.80, 7.95
    unit = 1.55
    k = 0
    gy = hy0
    row = 0
    while gy < hy1 - 0.2:
        gx = hx0
        col = 0
        while gx < hx1 - 0.2:
            cx, cy = gx + unit / 2, gy + unit / 2
            a, b = (mats["wood"], mats["wood_hi"]) if (row + col) % 2 == 0 else (mats["wood_hi"], mats["wood_dk"])
            box(f"HboneA{k}", (cx - 0.28, cy, FZ + 0.008), (0.92, 0.28, 0.018),
                a, geo, bevel=0.006)
            box(f"HboneB{k}", (cx + 0.28, cy, FZ + 0.008), (0.92, 0.28, 0.018),
                b, geo, bevel=0.006)
            ob_a = bpy.data.objects.get(f"HboneA{k}")
            ob_b = bpy.data.objects.get(f"HboneB{k}")
            if ob_a:
                ob_a.rotation_euler[2] = math.radians(45 if (row + col) % 2 == 0 else -45)
            if ob_b:
                ob_b.rotation_euler[2] = math.radians(45 if (row + col) % 2 == 0 else -45)
            k += 1
            gx += unit
            col += 1
        gy += unit * 0.55
        row += 1


def build_doors_drapes(mats, prop, parent_bed, parent_bath):
    french_door("DoorBath", -8.0, BALC - 0.02, mats, prop, parent_bath, open_deg=0.0)
    french_door("DoorL", 0.60, BALC - 0.02, mats, prop, parent_bed, open_deg=0.0)
    french_door("DoorM", 4.00, BALC - 0.02, mats, prop, parent_bed, open_deg=38.0)
    french_door("DoorR", 7.40, BALC - 0.02, mats, prop, parent_bed, open_deg=0.0)
    # drapes flanking bedroom doors
    for i, x in enumerate((-0.15, 1.35, 3.25, 4.75, 6.65, 8.15)):
        box(f"Drape{i}", (x, BALC + 0.12, 1.45), (0.22, 0.10, 2.55),
            mats["linen"] if i % 2 == 0 else mats["blush"], prop, parent_bed, bevel=0.05)
        box(f"DrapeTie{i}", (x, BALC + 0.18, 1.15), (0.16, 0.06, 0.04),
            mats["brass"], prop, parent_bed, bevel=0.008)
    gold_sconce("SconceDoorL", 2.30, BALC + 0.08, 2.05, "s", mats, prop, parent_bed)
    gold_sconce("SconceDoorR", 5.70, BALC + 0.08, 2.05, "s", mats, prop, parent_bed)


def sofa_leg(tag, x, y, mats, col, parent):
    cyl(f"{tag}Foot", (x, y, FZ + 0.014), 0.032, 0.022, mats["ink"],
        col, parent, bevel=0.004, verts=12)
    cone(f"{tag}Bulb", (x, y, FZ + 0.07), 0.032, 0.016, 0.09, mats["walnut"],
         col, parent, bevel=0.006, verts=14)
    cyl(f"{tag}Post", (x, y, FZ + 0.14), 0.014, 0.05, mats["walnut"],
        col, parent, bevel=0.003, verts=12)


def build_bedroom(mats, prop, veg):
    parent = empty("ROOM_BED", (4.0, 2.0, 0), prop)
    cx, cy = 4.00, 6.55

    box("Rug", (cx, cy - 0.35, FZ + 0.014), (4.85, 3.65, 0.022), mats["rug"],
        prop, parent, bevel=0.02)
    box("RugBd", (cx, cy - 0.35, FZ + 0.02), (4.55, 3.35, 0.016), mats["rug_bd"],
        prop, parent, bevel=0.014)
    box("RugMed", (cx, cy - 0.35, FZ + 0.026), (1.15, 1.05, 0.012), mats["rug_med"],
        prop, parent, bevel=0.04)

    # bed facing south, head on north wall
    box("Headboard", (cx, cy + 1.02, FZ + 0.78), (1.98, 0.12, 1.22), mats["ivory"],
        prop, parent, bevel=0.04)
    box("HeadCap", (cx, cy + 1.02, FZ + 1.42), (2.04, 0.14, 0.06), mats["brass"],
        prop, parent, bevel=0.01)
    for i in range(5):
        box(f"HeadChan{i}", (cx - 0.72 + i * 0.36, cy + 0.97, FZ + 0.78),
            (0.04, 0.04, 1.00), mats["linen"], prop, parent, bevel=0.01)
    box("BedBase", (cx, cy + 0.05, FZ + 0.22), (1.82, 2.08, 0.28), mats["walnut"],
        prop, parent, bevel=0.03)
    box("Mattress", (cx, cy + 0.02, FZ + 0.42), (1.78, 2.02, 0.22), mats["linen_hi"],
        prop, parent, bevel=0.05)
    box("Duvet", (cx, cy - 0.08, FZ + 0.56), (1.72, 1.55, 0.10), mats["linen"],
        prop, parent, bevel=0.05)
    box("Throw", (cx, cy - 0.72, FZ + 0.62), (1.55, 0.42, 0.06), mats["camel"],
        prop, parent, bevel=0.03)
    box("PillowL", (cx - 0.38, cy + 0.72, FZ + 0.62), (0.52, 0.28, 0.16), mats["ivory"],
        prop, parent, bevel=0.07)
    box("PillowR", (cx + 0.38, cy + 0.72, FZ + 0.62), (0.52, 0.28, 0.16), mats["ivory"],
        prop, parent, bevel=0.07)
    box("PillowSage", (cx - 0.18, cy + 0.68, FZ + 0.72), (0.32, 0.18, 0.12), mats["sage"],
        prop, parent, bevel=0.05)
    box("PillowBlush", (cx + 0.22, cy + 0.66, FZ + 0.72), (0.28, 0.16, 0.10), mats["blush"],
        prop, parent, bevel=0.05)
    for i, (lx, ly) in enumerate((
        (cx - 0.78, cy - 0.88), (cx + 0.78, cy - 0.88),
        (cx - 0.78, cy + 0.92), (cx + 0.78, cy + 0.92),
    )):
        sofa_leg(f"BedLeg{i}", lx, ly, mats, prop, parent)

    box("Bench", (cx, cy - 1.22, FZ + 0.28), (1.35, 0.38, 0.22), mats["ivory"],
        prop, parent, bevel=0.04)
    box("BenchTop", (cx, cy - 1.22, FZ + 0.40), (1.38, 0.40, 0.06), mats["linen"],
        prop, parent, bevel=0.02)
    for i, lx in enumerate((cx - 0.52, cx + 0.52)):
        sofa_leg(f"BenchLeg{i}", lx, cy - 1.22, mats, prop, parent)

    for side, sx in (("L", -1.0), ("R", 1.0)):
        nx = cx + sx * 1.12
        ny = cy + 0.85
        box(f"Night{side}", (nx, ny, FZ + 0.28), (0.42, 0.38, 0.42), mats["walnut"],
            prop, parent, bevel=0.02)
        box(f"NightTop{side}", (nx, ny, FZ + 0.50), (0.46, 0.42, 0.04), mats["marble"],
            prop, parent, bevel=0.01)
        cyl(f"NightKn{side}", (nx + sx * 0.18, ny + 0.16, FZ + 0.28), 0.012, 0.06,
            mats["brass"], prop, parent, bevel=0.003, verts=10, rot=(math.pi / 2, 0, 0))
        gold_sconce(f"SconceBed{side}", nx, NW - 0.02, 1.72, "s", mats, prop, parent)
    cyl("NightCup", (cx - 1.12, cy + 0.85, FZ + 0.55), 0.03, 0.06, mats["white"],
        prop, parent, bevel=0.006)
    box("NightBook", (cx + 1.12, cy + 0.82, FZ + 0.535), (0.16, 0.12, 0.025),
        mats["book_g"], prop, parent, bevel=0.004)
    cyl("NightDish", (cx + 1.18, cy + 0.92, FZ + 0.53), 0.05, 0.012, mats["cream"],
        prop, parent, bevel=0.004)

    # chandelier
    cyl("ChanStem", (cx, 2.0, 2.62), 0.012, 0.28, mats["brass"], prop, parent, bevel=0.003)
    torus("ChanRing", (cx, 2.0, 2.42), 0.28, 0.018, mats["brass"], prop, parent)
    for i in range(6):
        a = i * math.pi / 3
        ax = cx + math.cos(a) * 0.28
        ay = 2.0 + math.sin(a) * 0.28
        cyl(f"ChanArm{i}", (ax, ay, 2.38), 0.01, 0.12, mats["brass"],
            prop, parent, bevel=0.002, verts=8)
        sphere(f"ChanDrop{i}", (ax, ay, 2.26), 0.045, mats["glass"], prop, parent)
    sphere("ChanCore", (cx, 2.0, 2.42), 0.06, mats["lamp"], prop, parent)

    # armoire east wall
    box("Armoire", (11.55, 3.35, FZ + 1.05), (0.58, 1.55, 2.05), mats["walnut"],
        prop, parent, bevel=0.03)
    box("ArmoireCap", (11.55, 3.35, FZ + 2.12), (0.64, 1.62, 0.08), mats["walnut"],
        prop, parent, bevel=0.016)
    box("ArmoireL", (11.28, 2.98, FZ + 1.02), (0.04, 0.68, 1.72), mats["wood_dk"],
        prop, parent, bevel=0.012)
    box("ArmoireR", (11.28, 3.72, FZ + 1.02), (0.04, 0.68, 1.72), mats["wood_dk"],
        prop, parent, bevel=0.012)
    for i, y in enumerate((2.98, 3.72)):
        cyl(f"ArmKn{i}", (11.24, y, FZ + 1.05), 0.012, 0.08, mats["brass"],
            prop, parent, bevel=0.003, verts=10, rot=(0, math.pi / 2, 0))
    box("HangCoat", (11.18, 3.10, FZ + 1.35), (0.06, 0.18, 0.85), mats["camel"],
        prop, parent, bevel=0.02)
    box("HangDress", (11.18, 3.55, FZ + 1.28), (0.05, 0.16, 0.95), mats["sage"],
        prop, parent, bevel=0.02)

    # vanity
    box("Vanity", (11.45, -0.55, FZ + 0.38), (0.48, 1.05, 0.62), mats["walnut"],
        prop, parent, bevel=0.025)
    box("VanityTop", (11.42, -0.55, FZ + 0.70), (0.54, 1.12, 0.04), mats["marble"],
        prop, parent, bevel=0.01)
    cyl("Mirror", (11.55, -0.55, FZ + 1.45), 0.38, 0.04, mats["glass"],
        prop, parent, bevel=0.008, verts=28, rot=(0, math.pi / 2, 0))
    torus("MirrorRim", (11.52, -0.55, FZ + 1.45), 0.40, 0.025, mats["brass"],
          prop, parent, rot=(0, math.pi / 2, 0))
    box("VanityStool", (10.85, -0.55, FZ + 0.24), (0.38, 0.38, 0.32), mats["sage"],
        prop, parent, bevel=0.04)
    cyl("VanityJar", (11.42, -0.20, FZ + 0.76), 0.03, 0.08, mats["white"],
        prop, parent, bevel=0.006)
    cyl("VanityTray", (11.42, -0.85, FZ + 0.735), 0.08, 0.012, mats["brass"],
        prop, parent, bevel=0.004)

    # bergere toward balcony
    bx, by = 0.55, -1.55
    box("BergeSeat", (bx, by + 0.04, FZ + 0.38), (0.62, 0.52, 0.14), mats["sage"],
        prop, parent, bevel=0.05)
    box("BergeBack", (bx, by - 0.22, FZ + 0.62), (0.64, 0.12, 0.55), mats["sage"],
        prop, parent, bevel=0.05)
    box("BergeArmL", (bx - 0.32, by, FZ + 0.48), (0.10, 0.50, 0.32), mats["sage_hi"],
        prop, parent, bevel=0.04)
    box("BergeArmR", (bx + 0.32, by, FZ + 0.48), (0.10, 0.50, 0.32), mats["sage_hi"],
        prop, parent, bevel=0.04)
    for i, (lx, ly) in enumerate((
        (bx - 0.26, by - 0.18), (bx + 0.26, by - 0.18),
        (bx - 0.26, by + 0.20), (bx + 0.26, by + 0.20),
    )):
        sofa_leg(f"BergeLeg{i}", lx, ly, mats, prop, parent)
        for k in range(4):
            sphere(f"BergeNail{i}{k}", (lx, by + 0.24, FZ + 0.32 + k * 0.06),
                   0.008, mats["brass"], prop, parent)
    box("Ottoman", (bx + 0.02, by + 0.62, FZ + 0.20), (0.48, 0.38, 0.22), mats["sage_hi"],
        prop, parent, bevel=0.04)
    cyl("SideTable", (bx + 0.72, by + 0.15, FZ + 0.28), 0.16, 0.04, mats["walnut"],
        prop, parent, bevel=0.01, verts=20)
    cyl("SidePost", (bx + 0.72, by + 0.15, FZ + 0.16), 0.03, 0.22, mats["walnut"],
        prop, parent, bevel=0.006)
    cyl("TeaCup", (bx + 0.68, by + 0.12, FZ + 0.32), 0.028, 0.04, mats["white"],
        prop, parent, bevel=0.005)
    box("TeaBook", (bx + 0.78, by + 0.22, FZ + 0.315), (0.14, 0.10, 0.02),
        mats["book_r"], prop, parent, bevel=0.003)

    # art beside bed
    box("ArtL", (-1.15, NW - 0.05, 1.58), (0.04, 0.62, 0.78), mats["brass"],
        prop, parent, bevel=0.01)
    box("ArtLIn", (-1.12, NW - 0.06, 1.58), (0.02, 0.50, 0.62), mats["linen"],
        prop, parent, bevel=0.006)
    box("ArtLMark", (-1.10, NW - 0.07, 1.48), (0.012, 0.42, 0.18), mats["sage"],
        prop, parent, bevel=0.01)
    box("ArtR", (9.15, NW - 0.05, 1.58), (0.04, 0.55, 0.70), mats["brass"],
        prop, parent, bevel=0.01)
    box("ArtRIn", (9.12, NW - 0.06, 1.58), (0.02, 0.44, 0.55), mats["blush"],
        prop, parent, bevel=0.006)

    potted_plant("BedPlant", 10.6, 6.85, FZ, 0.14, 0.22, 7, 0.28, 0.42,
                 mats, veg, parent)
    return parent


def build_bath(mats, prop, veg):
    parent = empty("ROOM_BATH", (-8.0, 2.0, 0), prop)

    box("TubPlinth", (-8.0, 2.0, FZ + 0.07), (2.55, 1.55, 0.12), mats["marble"],
        prop, parent, bevel=0.03)
    box("Tub", (-8.0, 2.0, FZ + 0.38), (0.92, 1.88, 0.48), mats["white"],
        prop, parent, bevel=0.16)
    box("TubInner", (-8.0, 2.0, FZ + 0.46), (0.70, 1.62, 0.28), mats["marble"],
        prop, parent, bevel=0.12)
    box("TubTray", (-8.0, 1.15, FZ + 0.66), (0.42, 0.22, 0.03), mats["walnut"],
        prop, parent, bevel=0.008)
    cyl("TubGlass", (-8.08, 1.15, FZ + 0.72), 0.028, 0.08, mats["glass"],
        prop, parent, bevel=0.004)
    cyl("TubVial", (-7.92, 1.18, FZ + 0.74), 0.018, 0.10, mats["blush"],
        prop, parent, bevel=0.004)
    box("TubTowel", (-8.55, 1.35, FZ + 0.22), (0.28, 0.18, 0.08), mats["camel"],
        prop, parent, bevel=0.02)

    # double vanity on west wall
    box("BathVan", (-11.45, 2.0, FZ + 0.42), (0.52, 3.65, 0.72), mats["walnut"],
        prop, parent, bevel=0.03)
    box("BathVanTop", (-11.38, 2.0, FZ + 0.80), (0.62, 3.78, 0.05), mats["marble"],
        prop, parent, bevel=0.012)
    for i, y in enumerate((1.15, 2.85)):
        cyl(f"Basin{i}", (-11.35, y, FZ + 0.86), 0.18, 0.08, mats["white"],
            prop, parent, bevel=0.02, verts=24)
        cyl(f"Tap{i}", (-11.52, y, FZ + 0.98), 0.012, 0.16, mats["brass"],
            prop, parent, bevel=0.003, verts=10)
        box(f"BathMir{i}", (-12.05, y, 1.72), (0.05, 0.62, 0.85), mats["glass"],
            prop, parent, bevel=0.01)
        torus(f"BathMirRim{i}", (-12.02, y, 1.72), 0.48, 0.022, mats["brass"],
              prop, parent, rot=(0, math.pi / 2, 0))
        gold_sconce(f"SconceVan{i}", WW + 0.04, y, 2.22, "e", mats, prop, parent)
    box("SoapL", (-11.28, 0.55, FZ + 0.84), (0.08, 0.08, 0.04), mats["cream"],
        prop, parent, bevel=0.01)
    box("TowelStack", (-11.28, 3.45, FZ + 0.86), (0.18, 0.22, 0.08), mats["ivory"],
        prop, parent, bevel=0.012)

    # shower NW
    sx, sy = -10.55, 6.55
    box("ShowerBase", (sx, sy, FZ + 0.04), (1.52, 1.52, 0.06), mats["marble_vein"],
        prop, parent, bevel=0.02)
    box("ShowerGL", (sx - 0.72, sy, FZ + 1.05), (0.04, 1.48, 2.05), mats["glass"],
        prop, parent, bevel=0.008)
    box("ShowerGN", (sx, sy + 0.72, FZ + 1.05), (1.48, 0.04, 2.05), mats["glass"],
        prop, parent, bevel=0.008)
    box("ShowerGE", (sx + 0.72, sy + 0.25, FZ + 1.05), (0.04, 0.95, 2.05), mats["glass"],
        prop, parent, bevel=0.008)
    cyl("ShowerRail", (sx, sy, FZ + 2.12), 0.015, 1.35, mats["brass"],
        prop, parent, bevel=0.004, verts=10, rot=(0, math.pi / 2, 0))
    cyl("ShowerHead", (sx, sy, FZ + 2.05), 0.12, 0.04, mats["brass"],
        prop, parent, bevel=0.008, verts=20)
    cyl("ShowerArm", (sx, sy + 0.35, FZ + 2.08), 0.012, 0.55, mats["brass"],
        prop, parent, bevel=0.003, verts=8, rot=(math.pi / 2, 0, 0))
    box("SoapDish", (sx - 0.55, sy + 0.4, FZ + 1.05), (0.12, 0.08, 0.03), mats["brass"],
        prop, parent, bevel=0.006)

    # WC alcove NE of bath, not facing the enfilade
    box("WcWall", (-5.35, 6.35, FZ + 0.62), (0.10, 1.55, 1.15), mats["wall"],
        prop, parent, bevel=0.03)
    box("Wc", (-6.05, 6.85, FZ + 0.22), (0.42, 0.55, 0.42), mats["white"],
        prop, parent, bevel=0.08)
    cyl("WcLid", (-6.05, 6.85, FZ + 0.46), 0.20, 0.04, mats["white"],
        prop, parent, bevel=0.02, verts=20)
    box("WcTank", (-6.05, 7.18, FZ + 0.55), (0.40, 0.16, 0.42), mats["white"],
        prop, parent, bevel=0.03)
    cyl("WcPaper", (-5.62, 6.45, FZ + 0.72), 0.05, 0.12, mats["ivory"],
        prop, parent, bevel=0.008, verts=14, rot=(0, math.pi / 2, 0))
    box("LinenCab", (-5.15, 5.15, FZ + 0.85), (0.42, 0.48, 1.55), mats["walnut"],
        prop, parent, bevel=0.02)
    box("LinenDoor", (-4.95, 5.15, FZ + 0.85), (0.04, 0.40, 1.38), mats["wood_dk"],
        prop, parent, bevel=0.012)
    cyl("LinenKn", (-4.92, 5.28, FZ + 0.85), 0.012, 0.06, mats["brass"],
        prop, parent, bevel=0.003, verts=10, rot=(0, math.pi / 2, 0))

    box("TowelBar", (WW + 0.08, -0.85, 1.25), (0.04, 0.55, 0.03), mats["brass"],
        prop, parent, bevel=0.006)
    box("TowelA", (WW + 0.14, -0.85, 1.05), (0.06, 0.42, 0.55), mats["ivory"],
        prop, parent, bevel=0.02)
    box("TowelB", (WW + 0.20, -0.70, 1.00), (0.05, 0.32, 0.48), mats["camel"],
        prop, parent, bevel=0.02)

    potted_plant("BathPlantN", -8.0, 7.55, FZ, 0.12, 0.18, 6, 0.22, 0.32,
                 mats, veg, parent)
    potted_plant("BathPlantS", -11.35, -2.85, FZ, 0.13, 0.20, 6, 0.24, 0.34,
                 mats, veg, parent)
    cyl("BathVaseL", (-8.35, BALC + 0.22, FZ + 0.18), 0.05, 0.22, mats["pot"],
        prop, parent, bevel=0.01)
    cyl("BathVaseR", (-7.65, BALC + 0.22, FZ + 0.16), 0.04, 0.18, mats["cream"],
        prop, parent, bevel=0.01)
    return parent


def build_balcony(mats, prop, veg):
    parent = empty("ROOM_BALC", (0.0, -6.0, 0), prop)
    # railing
    for i in range(21):
        x = -12.0 + i * 1.20
        cyl(f"RailPost{i}", (x, -7.88, FZ + 0.52), 0.028, 1.00, mats["iron"],
            prop, parent, bevel=0.006, verts=10)
        sphere(f"RailCap{i}", (x, -7.88, FZ + 1.05), 0.035, mats["brass"],
               prop, parent)
    box("RailTop", (0.0, -7.88, FZ + 1.02), (23.9, 0.04, 0.04), mats["iron"],
        prop, parent, bevel=0.008)
    box("RailMid", (0.0, -7.88, FZ + 0.55), (23.9, 0.03, 0.03), mats["iron"],
        prop, parent, bevel=0.006)

    # bistro on bedroom axis
    cyl("BistroTop", (4.0, -6.05, FZ + 0.72), 0.38, 0.04, mats["iron"],
        prop, parent, bevel=0.01, verts=24)
    cyl("BistroPost", (4.0, -6.05, FZ + 0.38), 0.03, 0.64, mats["iron"],
        prop, parent, bevel=0.006)
    cyl("BistroFoot", (4.0, -6.05, FZ + 0.04), 0.18, 0.04, mats["iron"],
        prop, parent, bevel=0.008, verts=16)
    for i, dx in enumerate((-0.55, 0.55)):
        box(f"BistroSeat{i}", (4.0 + dx, -6.05, FZ + 0.46), (0.38, 0.38, 0.06),
            mats["ivory"], prop, parent, bevel=0.02)
        box(f"BistroBack{i}", (4.0 + dx, -6.28, FZ + 0.72), (0.38, 0.06, 0.42),
            mats["iron"], prop, parent, bevel=0.012)
        cyl(f"BistroLegA{i}", (4.0 + dx - 0.12, -6.18, FZ + 0.22), 0.016, 0.42,
            mats["iron"], prop, parent, bevel=0.003, verts=8)
        cyl(f"BistroLegB{i}", (4.0 + dx + 0.12, -5.92, FZ + 0.22), 0.016, 0.42,
            mats["iron"], prop, parent, bevel=0.003, verts=8)
    cyl("BistroPot", (4.0, -6.05, FZ + 0.80), 0.08, 0.12, mats["pot"],
        prop, parent, bevel=0.01)
    cone("BistroFlower", (4.0, -6.05, FZ + 0.96), 0.07, 0.02, 0.16, mats["geranium"],
         prop, parent, bevel=0.01, verts=10)

    # boxwood west, in front of bath
    for i, x in enumerate((-10.2, -8.6)):
        cyl(f"BoxPot{i}", (x, -6.35, FZ + 0.18), 0.22, 0.28, mats["pot"],
            prop, parent, bevel=0.02, verts=16)
        sphere(f"BoxWood{i}", (x, -6.35, FZ + 0.62), 0.32, mats["leaf"], prop, parent)
        sphere(f"BoxWoodHi{i}", (x, -6.35, FZ + 0.78), 0.18, mats["leaf_dk"], prop, parent)

    box("Chaise", (-6.4, -6.15, FZ + 0.18), (0.62, 1.55, 0.14), mats["linen"],
        prop, parent, bevel=0.04)
    box("ChaiseBack", (-6.4, -6.75, FZ + 0.38), (0.62, 0.12, 0.42), mats["linen"],
        prop, parent, bevel=0.03)

    # east planters + geraniums
    box("PlanterE", (10.4, -6.20, FZ + 0.22), (2.4, 0.55, 0.38), mats["pot"],
        prop, parent, bevel=0.03)
    box("PlanterSoil", (10.4, -6.20, FZ + 0.40), (2.2, 0.42, 0.08), mats["soil"],
        prop, parent, bevel=0.01)
    for i, x in enumerate((9.5, 10.4, 11.3)):
        cone(f"Gera{i}", (x, -6.20, FZ + 0.62), 0.10, 0.03, 0.32, mats["geranium"],
             prop, parent, bevel=0.01, verts=10)
        cone(f"GeraLeaf{i}", (x + 0.08, -6.08, FZ + 0.52), 0.08, 0.02, 0.22,
             mats["leaf"], prop, parent, bevel=0.008, verts=8, rot=(0.4, 0, 0.5))
    sphere("Citrus", (9.15, -5.35, FZ + 0.85), 0.38, mats["leaf"], prop, parent)
    cyl("CitrusPot", (9.15, -5.35, FZ + 0.22), 0.22, 0.36, mats["pot"],
        prop, parent, bevel=0.02, verts=16)
    cyl("CitrusTrunk", (9.15, -5.35, FZ + 0.52), 0.04, 0.28, mats["walnut"],
        prop, parent, bevel=0.006)

    # herb trough along rail
    box("HerbTrough", (2.0, -7.55, FZ + 0.14), (8.5, 0.28, 0.18), mats["pot"],
        prop, parent, bevel=0.02)
    box("HerbSoil", (2.0, -7.55, FZ + 0.24), (8.2, 0.20, 0.06), mats["soil"],
        prop, parent, bevel=0.008)
    for i in range(9):
        x = -1.8 + i * 0.95
        cone(f"Herb{i}", (x, -7.55, FZ + 0.38), 0.05, 0.015, 0.22,
             mats["leaf"] if i % 2 else mats["sage"], prop, parent,
             bevel=0.006, verts=8)

    gold_sconce("SconceBalL", -1.2, BALC - 0.08, 2.05, "s", mats, prop, parent)
    gold_sconce("SconceBalR", 9.2, BALC - 0.08, 2.05, "s", mats, prop, parent)
    return parent


def export_glb():
    bpy.ops.object.select_all(action="DESELECT")
    mesh = None
    for ob in bpy.data.objects:
        if ob.type == "MESH":
            ob.select_set(True)
            mesh = ob
    if mesh is not None:
        bpy.context.view_layer.objects.active = mesh
    kwargs = dict(
        filepath=str(GLB),
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_extras=False,
    )
    try:
        bpy.ops.export_scene.gltf(export_format="GLB", **kwargs)
    except TypeError:
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
    veg = coll("GEO_VEG")
    coll("GEO_LIGHT")
    coll("CAM")
    coll("ENV")

    mats = {k: mat(f"M_{k}", v, 0.52) for k, v in PAL.items()}
    mats["gold"] = mat("M_gold", PAL["gold"], 0.32, metal=0.62)
    mats["brass"] = mat("M_brass", PAL["brass"], 0.30, metal=0.74)
    mats["lamp"] = mat("M_lamp", PAL["lamp"], 0.38, emit=1.4)
    mats["bulb"] = mat("M_bulb", PAL["bulb"], 0.28, emit=4.5)
    mats["glass"] = mat("M_glass", PAL["glass"], 0.08, emit=0.12, alpha=0.28)
    mats["marble"] = mat("M_marble", PAL["marble"], 0.28)
    mats["iron"] = mat("M_iron", PAL["iron"], 0.45, metal=0.35)

    setup_camera_lights()
    build_shell(mats, geo)
    build_partitions(mats, geo)
    build_boiserie(mats, geo)
    build_floors(mats, geo)
    bed = build_bedroom(mats, prop, veg)
    bath = build_bath(mats, prop, veg)
    build_balcony(mats, prop, veg)
    build_doors_drapes(mats, prop, bed, bath)

    OUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    try:
        export_glb()
    except Exception as err:
        print("glb skip", err)
    try:
        render_preview()
    except Exception as err:
        print("png skip", err)
    print("saved", BLEND)
    print("meshes", sum(1 for o in bpy.data.objects if o.type == "MESH"))
    print("objects", len(bpy.data.objects))


if __name__ == "__main__":
    main()
