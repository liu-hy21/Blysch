"""Dreamy pink bedroom dollhouse (family E pastel cutaway).

Built from docs/blender/assets/a82aacf0-7b9b-444a-9d74-d08fcf197321.png:
arched back wall, sheer curtains with fairy lights, canopy bed, fluffy rug,
vanity with oval mirror, hanging flower lamp, sheep plush, white cat.
"""

from __future__ import annotations

import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(r"e:\Hangyu\VibeCoding\Python\radar\Blysch")
BLEND = ROOT / "docs" / "blender" / "assets" / "dream-room.blend"
PNG = ROOT / "docs" / "blender" / "assets" / "dream-room.png"
GLB = ROOT / "public" / "models" / "park" / "dream-room.glb"

PAL = {
    "wall": (0.955, 0.870, 0.900, 1),
    "wall_hi": (0.985, 0.950, 0.945, 1),
    "arch": (0.890, 0.635, 0.720, 1),
    "plinth": (0.290, 0.200, 0.130, 1),
    "plinth_hi": (0.420, 0.310, 0.200, 1),
    "skirt": (0.960, 0.905, 0.895, 1),
    "floor": (0.945, 0.855, 0.825, 1),
    "floor_hi": (0.965, 0.895, 0.865, 1),
    "sheer": (0.990, 0.985, 0.975, 1),
    "pink": (0.955, 0.780, 0.845, 1),
    "pink_dk": (0.900, 0.615, 0.710, 1),
    "blush": (0.980, 0.720, 0.780, 1),
    "cream": (0.970, 0.940, 0.895, 1),
    "white": (0.985, 0.975, 0.965, 1),
    "gold": (0.790, 0.630, 0.400, 1),
    "wire": (0.550, 0.440, 0.300, 1),
    "wood": (0.870, 0.725, 0.575, 1),
    "wood_hi": (0.940, 0.850, 0.720, 1),
    "leaf": (0.450, 0.670, 0.420, 1),
    "leaf_dk": (0.330, 0.550, 0.370, 1),
    "bulb": (1.000, 0.870, 0.600, 1),
    "mirror": (0.880, 0.930, 0.960, 1),
    "ink": (0.130, 0.110, 0.120, 1),
    "mint": (0.680, 0.840, 0.780, 1),
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


def star_outline(r1, r2, points=5):
    pts = []
    for i in range(points * 2):
        a = math.pi / 2 + i * math.pi / points
        r = r1 if i % 2 == 0 else r2
        pts.append((r * math.cos(a), r * math.sin(a)))
    return pts


def curtain(name, loc, width, height, pleats, material, col, parent=None,
            amp=0.065):
    """Wavy pleated curtain slab hanging from loc's z (top edge)."""
    nx = pleats * 6 + 1
    verts = []
    for row_z in (0.0, -height):
        for i in range(nx):
            t = i / (nx - 1)
            x = (t - 0.5) * width
            y = amp * math.sin(2 * math.pi * pleats * t)
            # slight flare toward the bottom
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


def drape_cone(name, loc, r_top, r_bot, height, waves, material, col,
               parent=None, amp=0.05):
    n = 48
    verts = []
    for ring, (r, z) in enumerate(((r_top, 0.0), (r_bot, -height))):
        grow = 1.0 + ring * 0.6
        for i in range(n):
            a = 2 * math.pi * i / n
            rr = r * (1 + amp * grow * math.sin(waves * a))
            verts.append((rr * math.cos(a), rr * math.sin(a), z))
    faces = []
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    faces.append(tuple(reversed(range(n))))  # top cap (hidden by hoop)
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


_LIGHT_MESH = None


def _light_mesh(material):
    global _LIGHT_MESH
    if _LIGHT_MESH is None:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.021)
        tmp = bpy.context.active_object
        _LIGHT_MESH = tmp.data
        _LIGHT_MESH.materials.append(material)
        bpy.data.objects.remove(tmp, do_unlink=True)
    return _LIGHT_MESH


def light_string(name, pts, col, material, parent=None):
    """pts: already-resampled world positions for each bulb."""
    mesh = _light_mesh(material)
    obs = []
    for i, p in enumerate(pts):
        ob = bpy.data.objects.new(f"{name}_{i:02d}", mesh)
        ob.location = p
        col.objects.link(ob)
        if parent is not None:
            world = ob.matrix_world.copy()
            ob.parent = parent
            ob.matrix_parent_inverse = parent.matrix_world.inverted()
            ob.matrix_world = world
        obs.append(ob)
    return obs


def sag_line(p0, p1, count, sag=0.0):
    pts = []
    for i in range(count):
        t = i / (count - 1) if count > 1 else 0.0
        x = p0[0] + (p1[0] - p0[0]) * t
        y = p0[1] + (p1[1] - p0[1]) * t
        z = p0[2] + (p1[2] - p0[2]) * t - sag * math.sin(math.pi * t)
        pts.append((x, y, z))
    return pts


def circle_pts(center, radius, count, z=None):
    pts = []
    for i in range(count):
        a = 2 * math.pi * i / count
        pts.append((center[0] + radius * math.cos(a),
                    center[1] + radius * math.sin(a),
                    z if z is not None else center[2]))
    return pts


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
    bg.inputs["Color"].default_value = (0.93, 0.905, 0.915, 1)
    bg.inputs["Strength"].default_value = 0.85


def setup_camera_lights():
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=(1.05, -11.2, 6.35))
    cam = bpy.context.active_object
    cam.name = "CAM_ISO"
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 6.95
    cam.data.clip_start = 0.1
    cam.data.clip_end = 60
    look_at(cam, (0.0, 0.1, 1.1))
    scene.camera = cam
    put(cam, coll("CAM"))

    bpy.ops.object.light_add(type="SUN", location=(4.0, -5.0, 9.0))
    sun = bpy.context.active_object
    sun.name = "L_Sun"
    sun.rotation_euler = (math.radians(50), math.radians(6), math.radians(30))
    sun.data.energy = 2.0
    sun.data.angle = math.radians(42)
    sun.data.color = (1.0, 0.94, 0.84)
    put(sun, coll("ENV"))

    bpy.ops.object.light_add(type="AREA", location=(-4.5, -4.5, 5.5))
    fill = bpy.context.active_object
    fill.name = "L_Fill"
    fill.data.energy = 70
    fill.data.size = 6
    fill.data.color = (1.0, 0.93, 0.88)
    look_at(fill, (0, 0.5, 1.0))
    put(fill, coll("ENV"))

    bpy.ops.object.light_add(type="POINT", location=(0.35, 0.4, 2.1))
    warm = bpy.context.active_object
    warm.name = "L_Warm"
    warm.data.energy = 14
    warm.data.color = (1.0, 0.78, 0.58)
    warm.data.shadow_soft_size = 0.6
    put(warm, coll("ENV"))


def build_shell(mats, geo):
    box("Plinth", (0, 0, -0.15), (6.6, 5.1, 0.3), mats["plinth"], geo, bevel=0.09)
    box("PlinthHi", (0, 0, -0.005), (6.35, 4.85, 0.06), mats["plinth_hi"], geo, bevel=0.025)
    box("Skirt", (0, 0, 0.06), (6.15, 4.65, 0.1), mats["skirt"], geo, bevel=0.04)
    box("Floor", (0, 0, 0.115), (5.7, 4.15, 0.07), mats["floor"], geo, bevel=0.02)
    box("FloorInlay", (0.15, -0.1, 0.153), (4.4, 3.0, 0.012), mats["floor_hi"], geo, bevel=0.008)

    # back + side walls (front open), E-family thick slabs
    box("WallNorth", (0, 2.155, 1.45), (6.02, 0.16, 2.6), mats["wall"], geo, bevel=0.05)
    box("WallWest", (-2.93, 0, 1.45), (0.16, 4.31, 2.6), mats["wall"], geo, bevel=0.05)
    box("WallEast", (2.93, 0, 1.45), (0.16, 4.31, 2.6), mats["wall"], geo, bevel=0.05)
    box("CapNorth", (0, 2.155, 2.785), (6.06, 0.2, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapWest", (-2.93, 0, 2.785), (0.2, 4.35, 0.07), mats["wall_hi"], geo, bevel=0.02)
    box("CapEast", (2.93, 0, 2.785), (0.2, 4.35, 0.07), mats["wall_hi"], geo, bevel=0.02)
    # low front stubs to frame the cut
    box("StubWest", (-2.4, -2.075, 0.38), (1.05, 0.16, 0.46), mats["wall"], geo, bevel=0.04)
    box("StubEast", (2.4, -2.075, 0.38), (1.05, 0.16, 0.46), mats["wall"], geo, bevel=0.04)


def build_arch(mats, geo, light_col):
    # raised arch panel on the back wall, centred behind the bed
    pts = arch_outline(1.9, 1.55)
    arch = slab_from_outline("ArchPanel", pts, 0.055, (-0.95, 1.975, 0.15),
                             mats["arch"], geo, bevel=0.025)
    # trim along the arch outline (slightly forward of the panel face)
    trim_pts = [(-0.95 + x, 1.935, 0.15 + z) for x, z in pts]
    tube("ArchTrim", trim_pts, 0.016, mats["gold"], geo)
    # fairy lights tracing the arch
    light_pts = [(-0.95 + x, 1.905, 0.15 + z) for x, z in pts[::1]]
    # thin the outline to a nice bulb spacing
    keep = []
    for p in light_pts:
        if not keep or (Vector(p) - Vector(keep[-1])).length > 0.14:
            keep.append(p)
    light_string("LX_Arch", keep, light_col, mats["bulb"])
    return arch


def build_curtains(mats, prop, light_col):
    # left pair flanking the arch
    curtain("CurtainL1", (-2.52, 1.92, 2.62), 0.62, 2.45, 5, mats["sheer"], prop)
    curtain("CurtainL2", (-2.06, 1.94, 2.62), 0.5, 2.45, 4, mats["sheer"], prop)
    # right panel at the room edge
    curtain("CurtainR1", (2.56, 1.92, 2.62), 0.62, 2.45, 5, mats["sheer"], prop)
    # gold rods
    cyl("RodL", (-2.3, 1.92, 2.64), 0.016, 1.15, mats["gold"], prop,
        bevel=0.004, rot=(0, math.radians(90), 0))
    cyl("RodR", (2.56, 1.92, 2.64), 0.016, 0.85, mats["gold"], prop,
        bevel=0.004, rot=(0, math.radians(90), 0))
    sphere("RodEndL", (-2.8, 1.92, 2.64), 0.032, mats["gold"], prop)
    sphere("RodEndR", (2.98, 1.92, 2.64), 0.032, mats["gold"], prop)
    # top light strings with a gentle sag
    tube("WireL", sag_line((-2.82, 1.885, 2.6), (-1.9, 1.885, 2.6), 14, 0.09),
         0.005, mats["wire"], prop)
    light_string("LX_L", sag_line((-2.82, 1.885, 2.6), (-1.9, 1.885, 2.6), 10, 0.09),
                 light_col, mats["bulb"])
    tube("WireR", sag_line((2.28, 1.885, 2.6), (2.86, 1.885, 2.6), 10, 0.06),
         0.005, mats["wire"], prop)
    light_string("LX_R", sag_line((2.28, 1.885, 2.6), (2.86, 1.885, 2.6), 7, 0.06),
                 light_col, mats["bulb"])


def build_bed(mats, prop, light_col, parent):
    cx, cy = -0.95, 1.0  # bed centre
    # ball feet + base + mattress
    for i, (fx, fy) in enumerate(((-1.58, 0.24), (-0.32, 0.24), (-1.58, 1.76), (-0.32, 1.76))):
        sphere(f"BedFoot{i}", (fx, fy, 0.185), 0.048, mats["wood"], prop, parent)
    box("BedBase", (cx, cy, 0.36), (1.45, 1.8, 0.3), mats["cream"], prop, parent, 0.05)
    box("Mattress", (cx, cy, 0.60), (1.38, 1.72, 0.18), mats["white"], prop, parent, 0.055)
    box("Blanket", (cx, cy - 0.29, 0.727), (1.42, 1.12, 0.075), mats["pink"], prop, parent, 0.032)
    # blanket fold ridge
    box("BlanketFold", (cx, cy + 0.28, 0.71), (1.42, 0.09, 0.06), mats["blush"], prop, parent, 0.028)
    # pillows
    sphere("PillowL", (cx - 0.34, 1.58, 0.75), 0.17, mats["white"], prop, parent,
           scale=(1.15, 0.72, 0.45))
    sphere("PillowR", (cx + 0.34, 1.58, 0.75), 0.17, mats["pink"], prop, parent,
           scale=(1.15, 0.72, 0.45))
    # star cushion leaning against the pillows
    star = slab_from_outline("StarCushion", star_outline(0.14, 0.062), 0.06,
                             (cx + 0.14, 1.28, 0.82), mats["blush"], prop, parent, 0.012)
    star.rotation_euler = (math.radians(70), 0, math.radians(12))

    # canopy: hoop + sheer drape + hook + lights
    torus("CanopyHoop", (cx, 1.42, 2.46), 0.55, 0.022, mats["gold"], prop, parent)
    drape_cone("CanopyDrape", (cx, 1.42, 2.46), 0.5, 0.98, 1.0, 9,
               mats["sheer2"], prop, parent)
    cyl("CanopyHook", (cx, 1.42, 2.94), 0.012, 1.0, mats["gold"], prop, parent, 0.003)
    light_string("LX_Canopy", circle_pts((cx, 1.42, 2.44), 0.55, 13),
                 light_col, mats["bulb"], parent)


def build_rug(mats, prop):
    bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=1.0, depth=0.035,
                                        location=(0.3, -0.45, 0.175))
    rug_lo = bpy.context.active_object
    rug_lo.name = "RugLo"
    rug_lo.scale = (1.0, 0.88, 1.0)
    rug_lo.data.materials.append(mats["pink_dk"])
    put(rug_lo, prop)
    finish(rug_lo, 0.02)
    bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=0.93, depth=0.03,
                                        location=(0.3, -0.45, 0.2))
    rug = bpy.context.active_object
    rug.name = "Rug"
    rug.scale = (1.0, 0.88, 1.0)
    rug.data.materials.append(mats["pink"])
    put(rug, prop)
    finish(rug, 0.02)


def build_nightstand(mats, prop, parent):
    box("Nightstand", (0.28, 1.78, 0.36), (0.44, 0.38, 0.42), mats["white"], prop, parent, 0.035)
    box("NightstandTop", (0.28, 1.78, 0.585), (0.5, 0.44, 0.045), mats["wood_hi"], prop, parent, 0.012)
    box("NightDrawer", (0.28, 1.575, 0.42), (0.3, 0.03, 0.13), mats["pink"], prop, parent, 0.01)
    sphere("NightKnob", (0.28, 1.55, 0.42), 0.018, mats["gold"], prop, parent)
    # glowing star lamp on top
    cyl("StarStem", (0.28, 1.78, 0.66), 0.014, 0.1, mats["gold"], prop, parent, 0.003)
    slab_from_outline("StarLamp", star_outline(0.13, 0.058), 0.055,
                      (0.28, 1.78, 0.82), mats["lamp"], prop, parent, 0.01)


def build_vanity(mats, prop, parent):
    # desk
    box("DeskTop", (1.95, 1.79, 0.76), (1.1, 0.44, 0.05), mats["white"], prop, parent, 0.015)
    box("DeskSideL", (1.45, 1.79, 0.45), (0.05, 0.4, 0.62), mats["white"], prop, parent, 0.012)
    box("DeskSideR", (2.45, 1.79, 0.45), (0.05, 0.4, 0.62), mats["white"], prop, parent, 0.012)
    box("DeskDrawer", (1.95, 1.565, 0.62), (0.62, 0.03, 0.15), mats["pink"], prop, parent, 0.01)
    sphere("DeskKnob", (1.95, 1.545, 0.62), 0.02, mats["gold"], prop, parent)
    # oval mirror: gold frame ring + mirror disc, tilted back a touch
    tilt = math.radians(90 - 9)
    torus("MirrorFrame", (1.95, 1.82, 1.32), 0.27, 0.022, mats["gold"], prop,
          parent, rot=(tilt, 0, 0), scale=(1.0, 1.28, 1.0))
    cyl("MirrorGlass", (1.95, 1.815, 1.325), 0.265, 0.02, mats["mirror"], prop,
        parent, 0.004, verts=28, rot=(tilt, 0, 0))
    # mirror glass needs oval scale too — scale after rotation is applied in local z
    mg = bpy.data.objects["MirrorGlass"]
    mg.scale = (1.0, 1.0, 1.28)
    bpy.ops.object.select_all(action="DESELECT")
    mg.select_set(True)
    bpy.context.view_layer.objects.active = mg
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    mg.select_set(False)
    # little bottles and a brush on the desk
    cyl("BottleA", (1.62, 1.72, 0.83), 0.028, 0.09, mats["pink_dk"], prop, parent, 0.008)
    cyl("BottleACap", (1.62, 1.72, 0.885), 0.014, 0.025, mats["gold"], prop, parent, 0.004)
    cyl("BottleB", (1.72, 1.78, 0.815), 0.024, 0.06, mats["mint"], prop, parent, 0.008)
    sphere("BottleC", (1.8, 1.85, 0.82), 0.032, mats["blush"], prop, parent, scale=(1, 1, 0.8))
    box("Brush", (2.2, 1.68, 0.8), (0.16, 0.035, 0.03), mats["wood"], prop, parent, 0.01)
    box("BrushHead", (2.29, 1.68, 0.815), (0.05, 0.05, 0.05), mats["pink_dk"], prop, parent, 0.015)
    # mini mushroom lamp, lit
    cyl("MiniLampStem", (2.32, 1.83, 0.86), 0.014, 0.14, mats["white"], prop, parent, 0.004)
    sphere("MiniLampShade", (2.32, 1.83, 0.955), 0.07, mats["lamp"], prop, parent,
           scale=(1, 1, 0.72))
    # books stacked by the desk
    box("BookA", (1.28, 1.5, 0.19), (0.22, 0.16, 0.035), mats["pink_dk"], prop, parent, 0.008)
    box("BookB", (1.29, 1.51, 0.225), (0.2, 0.15, 0.03), mats["mint"], prop, parent, 0.008)
    box("BookC", (1.27, 1.49, 0.257), (0.21, 0.14, 0.032), mats["cream"], prop, parent, 0.008)
    # stool (pouf)
    sphere("Stool", (1.95, 1.05, 0.32), 0.21, mats["pink"], prop, parent,
           scale=(1, 1, 0.72))
    torus("StoolBase", (1.95, 1.05, 0.175), 0.14, 0.02, mats["gold"], prop, parent)


def build_shelves(mats, prop, veg, parent):
    for i, z in enumerate((1.45, 1.95)):
        box(f"Shelf{i}", (2.79, 0.95, z), (0.18, 0.9, 0.035), mats["wood_hi"], prop, parent, 0.01)
        # brackets
        for j, y in enumerate((0.62, 1.28)):
            box(f"ShelfBr{i}{j}", (2.83, y, z - 0.09), (0.05, 0.05, 0.14),
                mats["gold"], prop, parent, 0.008)
    # shelf props: books + clock on lower, plants on upper
    for i in range(3):
        ob = box(f"ShelfBook{i}", (2.79, 0.68 + i * 0.075, 1.58), (0.12, 0.05, 0.22),
                 (mats["pink_dk"], mats["mint"], mats["cream"])[i], prop, parent, 0.008)
    cyl("ShelfClock", (2.78, 1.2, 1.6), 0.075, 0.05, mats["cream"], prop, parent,
        0.01, rot=(math.radians(90), 0, 0))
    sphere("ClockDot", (2.75, 1.2, 1.6), 0.014, mats["ink"], prop, parent)
    # trailing plant on the upper shelf
    cyl("ShelfPot", (2.78, 0.75, 2.05), 0.07, 0.12, mats["pink_dk"], veg, parent, 0.012)
    sphere("ShelfLeafA", (2.76, 0.75, 2.16), 0.085, mats["leaf"], veg, parent, scale=(1, 1, 0.8))
    sphere("ShelfLeafB", (2.7, 0.68, 2.1), 0.06, mats["leaf_dk"], veg, parent)
    tube("ShelfVine", [(2.74, 0.8, 2.1), (2.7, 0.86, 1.9), (2.72, 0.9, 1.72)],
         0.012, mats["leaf_dk"], veg)
    sphere("ShelfLeafC", (2.72, 0.9, 1.7), 0.045, mats["leaf"], veg, parent)
    # tiny frame on upper shelf
    box("ShelfFrame", (2.8, 1.3, 2.12), (0.03, 0.18, 0.22), mats["gold"], prop, parent, 0.008)
    box("ShelfFrameIn", (2.78, 1.3, 2.12), (0.02, 0.13, 0.16), mats["blush"], prop, parent, 0.005)


def build_pendant(mats, prop, light_col, veg):
    # central flower pendant lamp, rod runs up out of frame
    px, py = 0.45, 0.35
    cyl("LampRod", (px, py, 2.6), 0.012, 1.5, mats["gold"], prop, bevel=0.003)
    # five petals around a glowing core
    core = sphere("LampCore", (px, py, 1.86), 0.075, mats["bulb"], light_col)
    for i in range(5):
        a = 2 * math.pi * i / 5
        dx, dy = math.cos(a) * 0.115, math.sin(a) * 0.115
        petal = sphere(f"LampPetal{i}", (px + dx, py + dy, 1.88), 0.085,
                       mats["pink"], prop, scale=(1.0, 1.0, 0.55))
    sphere("LampTop", (px, py, 1.95), 0.05, mats["pink_dk"], prop, scale=(1, 1, 0.6))
    # two hanging plants
    for i, (hx, hy, hz) in enumerate(((-1.9, 0.35, 2.3), (1.4, -0.2, 2.35))):
        cyl(f"HangCord{i}", (hx, hy, hz + 0.55), 0.006, 1.1, mats["wire"], prop, bevel=0.002)
        cone(f"HangPot{i}", (hx, hy, hz), 0.09, 0.065, 0.13,
             mats["cream" if i == 0 else "pink_dk"], veg, bevel=0.012)
        sphere(f"HangLeafA{i}", (hx, hy, hz + 0.09), 0.075, mats["leaf"], veg,
               scale=(1, 1, 0.7))
        for j in range(3):
            a = 2 * math.pi * j / 3 + i
            sphere(f"HangLeaf{i}{j}", (hx + math.cos(a) * 0.07, hy + math.sin(a) * 0.07,
                                       hz - 0.05 - j * 0.02),
                   0.042, mats["leaf_dk" if j % 2 else "leaf"], veg)
        # tiny blossoms
        for j in range(2):
            a = 2 * math.pi * j / 2 + i + 0.8
            sphere(f"HangBloom{i}{j}", (hx + math.cos(a) * 0.06, hy + math.sin(a) * 0.06,
                                        hz - 0.1 - j * 0.03),
                   0.02, mats["blush"], veg)


def build_bunting(mats, prop, light_col):
    pts = sag_line((-2.8, -1.55, 2.42), (2.8, -1.55, 2.42), 40, 0.34)
    tube("BuntingWire", pts, 0.006, mats["wire"], prop)
    light_string("LX_Bunting", sag_line((-2.8, -1.55, 2.42), (2.8, -1.55, 2.42), 15, 0.34),
                 light_col, mats["bulb"])
    flag_mats = (mats["pink_dk"], mats["cream"], mats["gold"], mats["pink"])
    for i in range(9):
        t = (i + 0.5) / 9
        x = -2.8 + 5.6 * t
        z = 2.42 - 0.34 * math.sin(math.pi * t) - 0.075
        cone(f"Flag{i}", (x, -1.55, z), 0.0, 0.06, 0.13, flag_mats[i % 4],
             prop, bevel=0.006, verts=3,
             rot=(0, 0, math.radians(30)), scale=(1.0, 0.4, 1.0))


def build_sheep(mats, prop):
    sx, sy = -2.3, -0.5
    parent = empty("ROOM_SHEEP", (sx, sy, 0), prop)
    body = sphere("SheepBody", (sx, sy, 0.34), 0.155, mats["cream"], prop, parent,
                  scale=(1.2, 0.95, 0.95))
    sphere("SheepHead", (sx + 0.16, sy - 0.02, 0.42), 0.09, mats["white"], prop, parent)
    sphere("SheepEarL", (sx + 0.18, sy - 0.085, 0.5), 0.035, mats["pink"], prop, parent,
           scale=(1, 0.6, 1.2))
    sphere("SheepEarR", (sx + 0.18, sy + 0.045, 0.5), 0.035, mats["pink"], prop, parent,
           scale=(1, 0.6, 1.2))
    for i, (lx, ly) in enumerate(((-0.07, -0.05), (0.07, -0.05), (-0.07, 0.05), (0.07, 0.05))):
        cyl(f"SheepLeg{i}", (sx + lx, sy + ly, 0.2), 0.024, 0.1, mats["white"], prop, parent, 0.008)
    sphere("SheepEyeL", (sx + 0.235, sy - 0.055, 0.44), 0.012, mats["ink"], prop, parent)
    sphere("SheepEyeR", (sx + 0.235, sy + 0.015, 0.44), 0.012, mats["ink"], prop, parent)
    sphere("SheepBlushL", (sx + 0.24, sy - 0.075, 0.40), 0.016, mats["blush"], prop, parent)
    sphere("SheepBlushR", (sx + 0.24, sy + 0.035, 0.40), 0.016, mats["blush"], prop, parent)
    sphere("SheepTail", (sx - 0.17, sy, 0.36), 0.04, mats["white"], prop, parent)


def build_cat(mats, prop):
    cx, cy = 0.95, -1.4
    parent = empty("ROOM_CAT", (cx, cy, 0), prop)
    sphere("CatBody", (cx, cy, 0.33), 0.17, mats["white"], prop, parent,
           scale=(1.0, 0.9, 1.2))
    sphere("CatHead", (cx, cy - 0.03, 0.60), 0.145, mats["white"], prop, parent)
    # ears
    cone("CatEarL", (cx - 0.085, cy - 0.02, 0.73), 0.055, 0.0, 0.1, mats["white"],
         prop, parent, 0.012, rot=(0, math.radians(-14), 0))
    cone("CatEarR", (cx + 0.085, cy - 0.02, 0.73), 0.055, 0.0, 0.1, mats["white"],
         prop, parent, 0.012, rot=(0, math.radians(14), 0))
    cone("CatEarInL", (cx - 0.082, cy - 0.045, 0.72), 0.028, 0.0, 0.06, mats["pink"],
         prop, parent, 0.006, rot=(math.radians(8), math.radians(-14), 0))
    cone("CatEarInR", (cx + 0.082, cy - 0.045, 0.72), 0.028, 0.0, 0.06, mats["pink"],
         prop, parent, 0.006, rot=(math.radians(8), math.radians(14), 0))
    # face (toward -Y / camera)
    sphere("CatEyeL", (cx - 0.055, cy - 0.155, 0.62), 0.016, mats["ink"], prop, parent)
    sphere("CatEyeR", (cx + 0.055, cy - 0.155, 0.62), 0.016, mats["ink"], prop, parent)
    sphere("CatNose", (cx, cy - 0.168, 0.585), 0.014, mats["pink_dk"], prop, parent)
    sphere("CatBlushL", (cx - 0.095, cy - 0.13, 0.575), 0.02, mats["blush"], prop, parent,
           scale=(1, 0.5, 0.7))
    sphere("CatBlushR", (cx + 0.095, cy - 0.13, 0.575), 0.02, mats["blush"], prop, parent,
           scale=(1, 0.5, 0.7))
    # front paws
    cyl("CatPawL", (cx - 0.06, cy - 0.1, 0.21), 0.032, 0.12, mats["white"], prop, parent, 0.01)
    cyl("CatPawR", (cx + 0.06, cy - 0.1, 0.21), 0.032, 0.12, mats["white"], prop, parent, 0.01)
    # curled tail
    tube("CatTail", [(cx + 0.14, cy + 0.05, 0.2), (cx + 0.26, cy + 0.02, 0.3),
                     (cx + 0.28, cy - 0.08, 0.45), (cx + 0.2, cy - 0.12, 0.55)],
         0.028, mats["white"], prop, parent)


def build_slippers(mats, prop):
    for i, (x, y, yaw) in enumerate(((-0.42, -1.62, -12), (-0.14, -1.55, 8))):
        sole = box(f"SlipSole{i}", (x, y, 0.18), (0.13, 0.27, 0.035),
                   mats["pink_dk"], prop, bevel=0.016)
        sole.rotation_euler = (0, 0, math.radians(yaw))
        band = sphere(f"SlipBand{i}", (x, y - 0.045, 0.215), 0.06, mats["pink"],
                      prop, scale=(1.05, 0.85, 0.5))
        band.rotation_euler = (0, 0, math.radians(yaw))


def build_wall_decor(mats, prop):
    # small framed print on the back wall between arch and vanity
    box("FrameA", (0.62, 2.055, 2.0), (0.3, 0.035, 0.38), mats["gold"], prop, bevel=0.01)
    box("FrameAIn", (0.62, 2.03, 2.0), (0.22, 0.025, 0.3), mats["blush"], prop, bevel=0.006)
    sphere("FrameAFlower", (0.62, 2.015, 2.02), 0.045, mats["pink_dk"], prop, scale=(1, 0.4, 1))
    # tiny heart-ish round print
    cyl("FrameB", (1.08, 2.05, 2.12), 0.1, 0.03, mats["cream"], prop,
        bevel=0.01, rot=(math.radians(90), 0, 0))
    sphere("FrameBDot", (1.08, 2.02, 2.12), 0.035, mats["pink_dk"], prop, scale=(1, 0.5, 1))


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
    room_bed = empty("ROOM_BED", (-0.95, 1.0, 0), prop)
    room_vanity = empty("ROOM_VANITY", (1.95, 1.5, 0), prop)
    room_shelf = empty("ROOM_SHELF", (2.79, 0.95, 0), prop)

    mats = {k: mat(f"M_{k}", v, 0.5) for k, v in PAL.items()}
    mats["sheer"] = mat("M_sheer", PAL["sheer"], 0.65, alpha=0.5)
    mats["sheer2"] = mat("M_sheer2", PAL["sheer"], 0.65, alpha=0.22)
    mats["bulb"] = mat("M_bulb", PAL["bulb"], 0.3, emit=5.0)
    mats["lamp"] = mat("M_lamp", (1.0, 0.9, 0.7, 1), 0.4, emit=2.2)
    mats["mirror"] = mat("M_mirror", PAL["mirror"], 0.08, metal=0.9)
    mats["gold"] = mat("M_gold", PAL["gold"], 0.35, metal=0.6)

    setup_camera_lights()
    build_shell(mats, geo)
    build_arch(mats, geo, light_col)
    build_curtains(mats, prop, light_col)
    build_bed(mats, prop, light_col, room_bed)
    build_rug(mats, prop)
    build_nightstand(mats, prop, room_bed)
    build_vanity(mats, prop, room_vanity)
    build_shelves(mats, prop, veg, room_shelf)
    build_pendant(mats, prop, light_col, veg)
    build_bunting(mats, prop, light_col)
    build_sheep(mats, prop)
    build_cat(mats, prop)
    build_slippers(mats, prop)
    build_wall_decor(mats, prop)

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND))
    export_glb()
    render_preview()
    print("saved", BLEND)
    print("glb", GLB, "bytes", GLB.stat().st_size if GLB.exists() else 0)
    print("png", PNG, "bytes", PNG.stat().st_size if PNG.exists() else 0)
    print("meshes", sum(1 for o in bpy.data.objects if o.type == "MESH"))


main()
