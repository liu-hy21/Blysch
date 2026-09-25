"""Cozy blue dining-nook dollhouse (isometric cutaway).

Built from docs/blender/assets/a82aacf0-7b9b-444a-9d74-d08fcf197321.png:
light blue walls, two arched windows with sheer curtains, plank wood floor,
round dining table with four chairs on a jute rug, sideboard with plants,
wall shelf, pendant lamp, framed print, floor plant and a little stool.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(r"e:\Hangyu\VibeCoding\Python\radar\Blysch")
BLEND = ROOT / "docs" / "blender" / "assets" / "dining-nook.blend"
PNG = ROOT / "docs" / "blender" / "assets" / "dining-nook.png"
GLB = ROOT / "public" / "models" / "park" / "dining-nook.glb"

PAL = {
    "wall": (0.775, 0.865, 0.920, 1),
    "wall_hi": (0.870, 0.925, 0.955, 1),
    "plinth": (0.300, 0.215, 0.145, 1),
    "plinth_hi": (0.430, 0.320, 0.210, 1),
    "skirt": (0.930, 0.880, 0.815, 1),
    "floor": (0.855, 0.700, 0.500, 1),
    "wood": (0.815, 0.640, 0.435, 1),
    "wood_hi": (0.885, 0.735, 0.520, 1),
    "wood_dk": (0.700, 0.520, 0.340, 1),
    "basebd": (0.955, 0.945, 0.920, 1),
    "white": (0.965, 0.955, 0.935, 1),
    "cream": (0.945, 0.905, 0.830, 1),
    "sheer": (0.975, 0.960, 0.925, 1),
    "jute": (0.870, 0.795, 0.640, 1),
    "jute_dk": (0.760, 0.675, 0.520, 1),
    "sky": (0.620, 0.815, 0.935, 1),
    "glass": (0.830, 0.920, 0.970, 1),
    "leaf": (0.410, 0.630, 0.390, 1),
    "leaf_dk": (0.300, 0.510, 0.330, 1),
    "pot": (0.800, 0.600, 0.430, 1),
    "terra": (0.735, 0.500, 0.360, 1),
    "gold": (0.800, 0.640, 0.410, 1),
    "ink": (0.160, 0.140, 0.130, 1),
    "blush": (0.920, 0.720, 0.640, 1),
    "bulb": (1.000, 0.850, 0.560, 1),
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
    ob.dimensions = dims
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
        major_radius=major, minor_radius=minor, major_segments=28,
        minor_segments=10, location=loc, rotation=rot or (0, 0, 0),
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


def slab_from_outline(name, outline, depth, loc, material, col, parent=None,
                      bevel=0.02):
    """Extrude a 2D XZ outline along Y. outline: [(x, z), ...] ccw."""
    n = len(outline)
    verts = [(x, -depth / 2, z) for x, z in outline]
    verts += [(x, depth / 2, z) for x, z in outline]
    faces = [tuple(reversed(range(n))), tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    ob.location = loc
    mesh.materials.append(material)
    col.objects.link(ob)
    if parent is not None:
        world = ob.matrix_world.copy()
        ob.parent = parent
        ob.matrix_parent_inverse = parent.matrix_world.inverted()
        ob.matrix_world = world
    return finish(ob, bevel)


def arch_outline(width, rect_h, segments=16):
    r = width / 2.0
    pts = [(-r, 0.0), (r, 0.0), (r, rect_h)]
    for i in range(1, segments):
        a = math.pi * i / segments
        pts.append((r * math.cos(a), rect_h + r * math.sin(a)))
    pts.append((-r, rect_h))
    return pts


def curtain(name, loc, width, height, pleats, material, col, parent=None,
            amp=0.06):
    """Wavy pleated curtain slab hanging from loc's z (top edge)."""
    nx = pleats * 6 + 1
    verts = []
    for row_z in (0.0, -height):
        for i in range(nx):
            t = i / (nx - 1)
            x = (t - 0.5) * width
            y = amp * math.sin(2 * math.pi * pleats * t)
            y *= 1.0 + 0.35 * (-row_z / height)
            verts.append((x, y, row_z))
    faces = []
    for i in range(nx - 1):
        faces.append((i, i + 1, nx + i + 1, nx + i))
    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    ob.location = loc
    mesh.materials.append(material)
    col.objects.link(ob)
    if parent is not None:
        world = ob.matrix_world.copy()
        ob.parent = parent
        ob.matrix_parent_inverse = parent.matrix_world.inverted()
        ob.matrix_world = world
    sol = ob.modifiers.new("Solidify", "SOLIDIFY")
    sol.thickness = 0.008
    try:
        bpy.ops.object.select_all(action="DESELECT")
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.shade_smooth()
        ob.select_set(False)
    except Exception:
        pass
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


def local_xy(cx, cy, ang, sx, sy):
    """Chair-local coords -> world. ang = outward azimuth; +sy faces table."""
    return (cx - sx * math.sin(ang) - sy * math.cos(ang),
            cy + sx * math.cos(ang) - sy * math.sin(ang))


# ---------------------------------------------------------------- build


def setup_world():
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.905, 0.900, 0.915, 1)
    bg.inputs["Strength"].default_value = 0.9


def setup_camera_lights():
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=(0.7, -11.4, 6.5))
    cam = bpy.context.active_object
    cam.name = "CAM_ISO"
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 6.2
    cam.data.clip_start = 0.1
    cam.data.clip_end = 60
    look_at(cam, (-0.1, 0.35, 1.0))
    scene.camera = cam
    put(cam, coll("CAM"))

    bpy.ops.object.light_add(type="SUN", location=(4.0, -5.0, 9.0))
    sun = bpy.context.active_object
    sun.name = "L_Sun"
    sun.rotation_euler = (math.radians(52), math.radians(8), math.radians(28))
    sun.data.energy = 2.4
    sun.data.angle = math.radians(40)
    sun.data.color = (1.0, 0.95, 0.86)
    put(sun, coll("ENV"))

    bpy.ops.object.light_add(type="AREA", location=(-4.5, -4.5, 5.5))
    fill = bpy.context.active_object
    fill.name = "L_Fill"
    fill.data.energy = 90
    fill.data.size = 6
    fill.data.color = (1.0, 0.94, 0.89)
    look_at(fill, (0, 0.5, 1.0))
    put(fill, coll("ENV"))

    # warm bounce near the windows
    bpy.ops.object.light_add(type="POINT", location=(1.1, 1.2, 1.9))
    glow = bpy.context.active_object
    glow.name = "L_WindowGlow"
    glow.data.energy = 12
    glow.data.color = (1.0, 0.85, 0.66)
    glow.data.shadow_soft_size = 0.8
    put(glow, coll("ENV"))

    # low warm wash "through" the windows onto the floor
    bpy.ops.object.light_add(type="AREA", location=(0.9, 1.7, 2.1))
    patch = bpy.context.active_object
    patch.name = "L_SunPatch"
    patch.data.energy = 60
    patch.data.size = 1.6
    patch.data.color = (1.0, 0.87, 0.68)
    look_at(patch, (0.2, -0.7, 0.1))
    put(patch, coll("ENV"))

    # pendant warmth over the table
    bpy.ops.object.light_add(type="POINT", location=(-0.85, -0.15, 1.5))
    warm = bpy.context.active_object
    warm.name = "L_Pendant"
    warm.data.energy = 10
    warm.data.color = (1.0, 0.78, 0.56)
    warm.data.shadow_soft_size = 0.4
    put(warm, coll("ENV"))


def build_shell(mats, geo):
    box("Plinth", (0, 0, -0.15), (6.6, 5.1, 0.3), mats["plinth"], geo, bevel=0.09)
    box("PlinthHi", (0, 0, -0.005), (6.35, 4.85, 0.06), mats["plinth_hi"], geo, bevel=0.025)
    box("Skirt", (0, 0, 0.06), (6.15, 4.65, 0.1), mats["skirt"], geo, bevel=0.04)
    box("Floor", (0, 0, 0.115), (5.7, 4.15, 0.07), mats["floor"], geo, bevel=0.02)

    # two walls only (front open cutaway)
    box("WallNorth", (0, 2.155, 1.45), (6.02, 0.16, 2.6), mats["wall"], geo, bevel=0.05)
    box("WallWest", (-2.93, 0, 1.45), (0.16, 4.31, 2.6), mats["wall"], geo, bevel=0.05)
    box("CapNorth", (0, 2.155, 2.785), (6.06, 0.2, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapWest", (-2.93, 0, 2.785), (0.2, 4.35, 0.07), mats["wall_hi"], geo, bevel=0.02)
    # low front stubs to frame the cut
    box("StubWest", (-2.4, -2.075, 0.38), (1.05, 0.16, 0.46), mats["wall"], geo, bevel=0.04)
    box("StubEast", (2.4, -2.075, 0.38), (1.05, 0.16, 0.46), mats["wall"], geo, bevel=0.04)

    # white baseboards along the inner wall faces
    box("BaseNorth", (0, 2.045, 0.23), (5.7, 0.06, 0.16), mats["basebd"], geo, bevel=0.015)
    box("BaseWest", (-2.82, 0, 0.23), (0.06, 4.0, 0.16), mats["basebd"], geo, bevel=0.015)


def build_planks(mats, geo):
    rnd = random.Random(11)
    x0, x1 = -2.79, 2.79
    shades = (mats["wood"], mats["wood_hi"], mats["wood_dk"])
    row = 0
    y = -1.87
    while y < 1.9:
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


def build_window(i, x, mats, geo):
    z0 = 1.02  # sill line
    opening = arch_outline(0.78, 1.12)
    rim_pts = arch_outline(0.9, 1.17)
    # sky + glass sit just in front of the wall face (y=2.075)
    slab_from_outline(f"WinSky{i}", opening, 0.02, (x, 2.06, z0),
                      mats["sky"], geo, bevel=0.004)
    slab_from_outline(f"WinGlass{i}", opening, 0.014, (x, 2.048, z0),
                      mats["glass"], geo, bevel=0.003)
    # rounded arch rim
    tube(f"WinRim{i}", [(x + px, 2.045, z0 - 0.055 + pz) for px, pz in rim_pts],
         0.034, mats["white"], geo)
    # mullions
    box(f"WinMullV{i}", (x, 2.04, z0 + 0.62), (0.034, 0.026, 1.24),
        mats["white"], geo, bevel=0.008)
    box(f"WinMullH{i}", (x, 2.04, z0 + 0.48), (0.74, 0.026, 0.034),
        mats["white"], geo, bevel=0.008)
    # sill ledge
    box(f"WinSill{i}", (x, 2.02, z0 - 0.075), (1.0, 0.15, 0.05),
        mats["white"], geo, bevel=0.014)


def build_windows_curtains(mats, geo, prop):
    build_window(0, 0.35, mats, geo)
    build_window(1, 1.55, mats, geo)
    # sheer panels: left of w1, between, right of w2
    for i, cx in enumerate((0.08, 0.95, 1.82)):
        curtain(f"Curtain{i}", (cx, 2.0, 2.3), 0.55, 1.32, 4,
                mats["sheer"], prop)
        torus(f"Tie{i}", (cx, 2.0, 1.55), 0.085, 0.013, mats["gold"], prop,
              rot=(math.radians(90), 0, 0))
    # dark wood rod + finials
    cyl("CurtainRod", (0.95, 2.0, 2.34), 0.015, 2.3, mats["wood_dk"], prop,
        bevel=0.004, rot=(0, math.radians(90), 0))
    sphere("RodEndA", (-0.2, 2.0, 2.34), 0.03, mats["wood_dk"], prop)
    sphere("RodEndB", (2.1, 2.0, 2.34), 0.03, mats["wood_dk"], prop)


def build_rug(mats, prop):
    cx, cy = -0.85, -0.15
    cyl("RugBase", (cx, cy, 0.157), 1.32, 0.014, mats["jute"], prop,
        bevel=0.004, verts=48)
    for i, r in enumerate((0.55, 0.9, 1.2)):
        torus(f"RugRing{i}", (cx, cy, 0.166), r, 0.014, mats["jute_dk"], prop)
    torus("RugEdge", (cx, cy, 0.164), 1.30, 0.026, mats["jute_dk"], prop)


def build_table(mats, prop):
    cx, cy = -0.85, -0.15
    parent = empty("ROOM_TABLE", (cx, cy, 0), prop)
    cyl("TableTop", (cx, cy, 0.755), 0.68, 0.05, mats["wood"], prop, parent,
        bevel=0.02, verts=36)
    cyl("TableApron", (cx, cy, 0.71), 0.34, 0.05, mats["wood_dk"], prop, parent,
        bevel=0.012)
    cyl("TablePost", (cx, cy, 0.46), 0.06, 0.5, mats["wood"], prop, parent,
        bevel=0.014)
    cyl("TableFoot", (cx, cy, 0.2), 0.3, 0.06, mats["wood_dk"], prop, parent,
        bevel=0.02, verts=28)
    # tea set
    sphere("Teapot", (-0.72, -0.3, 0.855), 0.075, mats["cream"], prop, parent,
           scale=(1, 1, 0.82))
    cone("TeapotLid", (-0.72, -0.3, 0.925), 0.045, 0.015, 0.035,
         mats["wood_dk"], prop, parent, bevel=0.006)
    sphere("TeapotKnob", (-0.72, -0.3, 0.948), 0.014, mats["gold"], prop, parent)
    tube("TeapotSpout", [(-0.79, -0.3, 0.86), (-0.86, -0.31, 0.9),
                         (-0.88, -0.31, 0.94)], 0.015, mats["cream"], prop, parent)
    torus("TeapotHandle", (-0.63, -0.3, 0.87), 0.038, 0.011, mats["wood_dk"],
          prop, parent, rot=(0, math.radians(90), 0))
    for i, (px, py) in enumerate(((-1.08, 0.02), (-0.58, 0.12))):
        cyl(f"Cup{i}", (px, py, 0.815), 0.038, 0.055, mats["white"], prop,
            parent, bevel=0.008)
        torus(f"CupEar{i}", (px + 0.045, py, 0.815), 0.02, 0.007,
              mats["white"], prop, parent, rot=(0, math.radians(90), 0))


def build_chair(i, ang_deg, mats, prop):
    cx, cy = -0.85, -0.15
    ang = math.radians(ang_deg)
    px, py = cx + 1.06 * math.cos(ang), cy + 1.06 * math.sin(ang)
    parent = empty(f"ROOM_CHAIR{i}", (px, py, 0), prop)
    w = lambda sx, sy: local_xy(px, py, ang, sx, sy)
    for j, (sx, sy) in enumerate(((-0.17, -0.16), (0.17, -0.16),
                                  (-0.17, 0.16), (0.17, 0.16))):
        lx, ly = w(sx, sy)
        cyl(f"Chair{i}Leg{j}", (lx, ly, 0.36), 0.024, 0.42, mats["wood_dk"],
            prop, parent, bevel=0.008)
    sx, sy = w(0, 0)
    box(f"Chair{i}Seat", (sx, sy, 0.565), (0.42, 0.40, 0.07), mats["wood"],
        prop, parent, bevel=0.02).rotation_euler = (0, 0, -ang)
    box(f"Chair{i}Pad", (sx, sy, 0.625), (0.36, 0.34, 0.05), mats["cream"],
        prop, parent, bevel=0.02).rotation_euler = (0, 0, -ang)
    for j, sxx in enumerate((-0.17, 0.17)):
        lx, ly = w(sxx, -0.185)
        cyl(f"Chair{i}Post{j}", (lx, ly, 0.81), 0.02, 0.42, mats["wood_dk"],
            prop, parent, bevel=0.007)
    lx, ly = w(0, -0.185)
    box(f"Chair{i}RailTop", (lx, ly, 0.99), (0.38, 0.04, 0.085), mats["wood"],
        prop, parent, bevel=0.025).rotation_euler = (0, 0, -ang)
    box(f"Chair{i}RailMid", (lx, ly, 0.80), (0.34, 0.032, 0.05), mats["wood"],
        prop, parent, bevel=0.015).rotation_euler = (0, 0, -ang)


def build_chairs(mats, prop):
    for i, a in enumerate((102, 168, 232, 320)):
        build_chair(i, a, mats, prop)


def potted_plant(name, x, y, z0, pot_r, pot_h, n_leaves, spread, leaf_len,
                 mats, col, parent=None, trailing=False):
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
        if trailing:
            tilt = math.radians(rnd.uniform(75, 110))
        ln = leaf_len * rnd.uniform(0.8, 1.15)
        lx = x + math.cos(a) * spread * 0.3
        ly = y + math.sin(a) * spread * 0.3
        lz = z0 + pot_h + ln * 0.3
        if trailing:
            lz = z0 + pot_h - ln * 0.15
        cone(f"{name}Leaf{i}", (lx, ly, lz), 0.05, 0.012, ln,
             mats["leaf"] if i % 2 else mats["leaf_dk"], col, parent,
             bevel=0.006, verts=10, rot=(tilt, 0, a), scale=(1, 0.45, 1))


def build_sideboard(mats, prop, veg):
    x, y = 2.15, 1.62
    parent = empty("ROOM_SIDEBOARD", (x, y, 0), prop)
    box("SideBody", (x, y, 0.68), (1.3, 0.42, 0.6), mats["wood"], prop, parent,
        bevel=0.03)
    box("SideTop", (x, y, 1.0), (1.38, 0.47, 0.05), mats["wood_hi"], prop,
        parent, bevel=0.015)
    for j, sx in enumerate((-0.55, 0.55)):
        for k, sy in enumerate((-0.15, 0.15)):
            cyl(f"SideLeg{j}{k}", (x + sx, y + sy, 0.27), 0.026, 0.24,
                mats["wood_dk"], prop, parent, bevel=0.008)
    # door seams + knobs
    for j, sx in enumerate((-0.215, 0.215)):
        box(f"SideDoor{j}", (x + sx, y - 0.215, 0.68), (0.4, 0.015, 0.5),
            mats["wood_dk"], prop, parent, bevel=0.01)
        sphere(f"SideKnob{j}", (x + sx + (0.14 if sx < 0 else -0.14),
               y - 0.235, 0.68), 0.018, mats["gold"], prop, parent)
    box("SideSeam", (x, y - 0.212, 0.68), (0.014, 0.012, 0.5),
        mats["wood_dk"], prop, parent, bevel=0.004)
    # decor on top: broad plant + book stack
    potted_plant("SidePlant", x - 0.38, y + 0.02, 1.025, 0.09, 0.12, 6, 0.16,
                 0.3, mats, veg, parent)
    box("SideBookA", (x + 0.32, y, 1.045), (0.2, 0.14, 0.03), mats["blush"],
        prop, parent, bevel=0.006)
    box("SideBookB", (x + 0.33, y - 0.01, 1.072), (0.17, 0.12, 0.025),
        mats["cream"], prop, parent, bevel=0.006)


def build_shelf(mats, prop, veg):
    x, y, z = 2.3, 1.97, 2.04
    parent = empty("ROOM_SHELF", (x, y, z), prop)
    box("ShelfBoard", (x, y, z), (0.8, 0.2, 0.045), mats["wood"], prop, parent,
        bevel=0.012)
    for j, sx in enumerate((-0.3, 0.3)):
        box(f"ShelfBracket{j}", (x + sx, y + 0.05, z - 0.075),
            (0.035, 0.1, 0.11), mats["wood_dk"], prop, parent, bevel=0.008)
    potted_plant("ShelfTrail", x - 0.24, y, z + 0.025, 0.06, 0.09, 5, 0.1,
                 0.3, mats, veg, parent, trailing=True)
    box("ShelfBookA", (x + 0.05, y, z + 0.037), (0.16, 0.11, 0.028),
        mats["cream"], prop, parent, bevel=0.005)
    box("ShelfBookB", (x + 0.06, y, z + 0.062), (0.13, 0.1, 0.024),
        mats["wall"], prop, parent, bevel=0.005)
    cyl("ShelfVase", (x + 0.27, y, z + 0.075), 0.045, 0.1, mats["white"], prop,
        parent, bevel=0.012)
    sphere("ShelfVaseTwig", (x + 0.27, y, z + 0.16), 0.02, mats["leaf_dk"],
           veg, parent, scale=(1, 1, 1.6))


def build_picture(mats, prop):
    # small landscape print on the west wall (inner face x=-2.85)
    box("PicFrame", (-2.82, 0.45, 1.78), (0.05, 0.5, 0.4), mats["wood_hi"],
        prop, bevel=0.012)
    box("PicArt", (-2.785, 0.45, 1.78), (0.02, 0.42, 0.32), mats["sky"], prop,
        bevel=0.004)
    sphere("PicSun", (-2.772, 0.36, 1.86), 0.035, mats["bulb"], prop,
           scale=(0.4, 1, 1))
    box("PicHillA", (-2.775, 0.45, 1.70), (0.014, 0.42, 0.08), mats["leaf"],
        prop, bevel=0.02)


def build_floorplant(mats, veg):
    potted_plant("FloorPlant", -2.32, 0.55, 0.15, 0.19, 0.28, 8, 0.34, 0.55,
                 mats, veg)


def build_stool(mats, prop):
    x, y = 1.5, -1.3
    parent = empty("ROOM_STOOL", (x, y, 0), prop)
    for i in range(3):
        a = math.radians(90 + i * 120)
        lx = x + 0.13 * math.cos(a)
        ly = y + 0.13 * math.sin(a)
        t = math.radians(9)
        cyl(f"StoolLeg{i}", (lx, ly, 0.31), 0.024, 0.34, mats["wood_dk"],
            prop, parent, bevel=0.008,
            rot=(t * math.sin(a), -t * math.cos(a), 0))
    torus("StoolRing", (x, y, 0.24), 0.13, 0.012, mats["wood_dk"], prop, parent)
    cyl("StoolSeat", (x, y, 0.45), 0.24, 0.06, mats["wood"], prop, parent,
        bevel=0.02, verts=28)
    sphere("StoolPad", (x, y, 0.5), 0.26, mats["cream"], prop, parent,
           scale=(1, 1, 0.42))


def build_pendant(mats, prop, light_col):
    x, y = -0.85, -0.15
    parent = empty("ROOM_PENDANT", (x, y, 0), prop)
    cyl("PendantCord", (x, y, 2.28), 0.011, 0.94, mats["ink"], prop, parent,
        bevel=0.003)
    cone("PendantShade", (x, y, 1.72), 0.19, 0.06, 0.22, mats["wood_dk"],
         prop, parent, bevel=0.015, verts=28)
    cyl("PendantGlow", (x, y, 1.615), 0.15, 0.014, mats["bulb"], light_col,
        parent, bevel=0.004, verts=28)
    sphere("PendantBulb", (x, y, 1.57), 0.048, mats["bulb"], light_col, parent)


# ---------------------------------------------------------------- main


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
    mats["sheer"] = mat("M_sheer", PAL["sheer"], 0.7, alpha=0.7)
    mats["sky"] = mat("M_sky", PAL["sky"], 0.9, emit=0.7)
    mats["glass"] = mat("M_glass", PAL["glass"], 0.15, alpha=0.18)
    mats["bulb"] = mat("M_bulb", PAL["bulb"], 0.3, emit=6.0)
    mats["gold"] = mat("M_gold", PAL["gold"], 0.35, metal=0.6)

    setup_camera_lights()
    build_shell(mats, geo)
    build_planks(mats, geo)
    build_windows_curtains(mats, geo, prop)
    build_rug(mats, prop)
    build_table(mats, prop)
    build_chairs(mats, prop)
    build_sideboard(mats, prop, veg)
    build_shelf(mats, prop, veg)
    build_picture(mats, prop)
    build_floorplant(mats, veg)
    build_stool(mats, prop)
    build_pendant(mats, prop, light_col)

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    export_glb()
    render_preview()
    print("saved", BLEND)
    print("glb", GLB, "bytes", GLB.stat().st_size if GLB.exists() else 0)
    print("png", PNG, "bytes", PNG.stat().st_size if PNG.exists() else 0)
    print("meshes", sum(1 for o in bpy.data.objects if o.type == "MESH"))


main()
