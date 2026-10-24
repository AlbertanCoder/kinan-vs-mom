# Blender -> Kinan vs. Mom: TARGET-QUALITY CONCEPT RENDERS.
# Renders "what the game should and could look like" at Super Mario Galaxy quality.
# Run: blender.exe --background --python blender-concept.py
import bpy, bmesh, math, random, os
from mathutils import Vector

OUTDIR = r"C:\Users\SHADHUNTER\Desktop\Kinan vs Mom backups\renders"
os.makedirs(OUTDIR, exist_ok=True)

def clean():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def mat(name, color, rough=0.55, emit=None, emit_str=0.0, metal=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_str
    return m

M_GRASS = mat('grass', (0.09, 0.42, 0.10), 0.7)
M_GRASS2 = mat('grass2', (0.13, 0.52, 0.13), 0.65)
M_DIRT = mat('dirt', (0.36, 0.20, 0.10), 0.8)
M_PATH = mat('path', (0.55, 0.38, 0.18), 0.85)
M_STONE = mat('stone', (0.62, 0.63, 0.66), 0.6)
M_WHITE = mat('white', (0.86, 0.87, 0.90), 0.5)
M_SKIN = mat('skin', (1.0, 0.80, 0.62), 0.55)
M_SHIRT = mat('shirt', (0.82, 0.10, 0.10), 0.6)
M_JEANS = mat('jeans', (0.16, 0.28, 0.58), 0.7)
M_HAIR = mat('hair', (0.23, 0.14, 0.08), 0.6)
M_SHOE = mat('shoe', (0.15, 0.13, 0.15), 0.5)
M_GOLD = mat('gold', (1.0, 0.72, 0.12), 0.35, emit=(1.0, 0.8, 0.3), emit_str=0.7, metal=0.2)
M_BIT = mat('bit', (0.55, 0.32, 1.0), 0.4, emit=(0.6, 0.42, 1.0), emit_str=0.9)
M_LEAF = mat('leaf', (0.11, 0.42, 0.09), 0.65)
M_FLOWY = mat('flowy', (1.0, 0.8, 0.1), 0.5)
M_FLOWP = mat('flowp', (0.55, 0.28, 0.92), 0.5)
M_FLOWW = mat('floww', (0.98, 0.96, 0.9), 0.5)
M_ROCK = mat('rock', (0.45, 0.40, 0.52), 0.75)
M_WATER = mat('water', (0.15, 0.55, 0.85), 0.15, emit=(0.2, 0.5, 0.9), emit_str=0.15)

def assign(ob, m):
    ob.data.materials.clear()
    ob.data.materials.append(m)

def cube(size, at=(0, 0, 0), bev=0.06, seg=2, m=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at, rotation=rot)
    ob = bpy.context.object
    ob.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bev > 0:
        md = ob.modifiers.new('b', 'BEVEL'); md.width = bev; md.segments = seg
        bpy.ops.object.modifier_apply(modifier='b')
    if m: assign(ob, m)
    return ob

def sph(rad, at=(0, 0, 0), m=None, seg=24, rings=16, squash=(1, 1, 1), smooth=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=rad, location=at)
    ob = bpy.context.object
    ob.scale = squash
    bpy.ops.object.transform_apply(scale=True)
    if smooth:
        bpy.ops.object.shade_smooth()
    if m: assign(ob, m)
    return ob

def cone(r1, r2, d, at=(0, 0, 0), m=None, verts=24, rot=(0, 0, 0), smooth=True):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=d, location=at, rotation=rot)
    ob = bpy.context.object
    if smooth:
        bpy.ops.object.shade_smooth()
    if m: assign(ob, m)
    return ob

def torus(rad, thick, at=(0, 0, 0), m=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=rad, minor_radius=thick, location=at, rotation=rot)
    ob = bpy.context.object
    bpy.ops.object.shade_smooth()
    if m: assign(ob, m)
    return ob

def star_mesh(outer, inner, thick, at=(0, 0, 0), m=None, rot=(0, 0, 0)):
    me = bpy.data.meshes.new('star')
    bm = bmesh.new()
    top, bot = [], []
    for k in range(10):
        a = math.pi / 2 + k * math.pi / 5
        r = outer if k % 2 == 0 else inner
        top.append(bm.verts.new((math.cos(a) * r, thick / 2, math.sin(a) * r)))
        bot.append(bm.verts.new((math.cos(a) * r, -thick / 2, math.sin(a) * r)))
    ct = bm.verts.new((0, thick / 2, 0)); cb = bm.verts.new((0, -thick / 2, 0))
    for k in range(10):
        bm.faces.new((ct, top[k], top[(k + 1) % 10]))
        bm.faces.new((cb, bot[(k + 1) % 10], bot[k]))
        bm.faces.new((top[k], bot[k], bot[(k + 1) % 10], top[(k + 1) % 10]))
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('star', me)
    bpy.context.collection.objects.link(ob)
    ob.location = at
    ob.rotation_euler = rot
    if m: assign(ob, m)
    return ob

# ---------------- KINAN (hero pose, ~5 units tall) ----------------
def kinan(at=(0, 0, 0), rot_z=0.0, pose='stand'):
    root = []
    def P(x, y, z):   # build in local space then place
        return (at[0] + x * math.cos(rot_z) - z * math.sin(rot_z),
                at[1] + x * math.sin(rot_z) + z * math.cos(rot_z), at[2] + y)
    root.append(cube((1.62, 1.55, 1.02), P(0, 2.72, 0), bev=0.22, seg=3, m=M_SHIRT))
    root.append(cube((1.5, 0.36, 0.98), P(0, 2.02, 0), bev=0.1, m=M_JEANS))
    sw = 0.32 if pose == 'run' else 0.06
    for s in (-1, 1):
        root.append(cube((0.62, 1.62, 0.66), P(s * 0.38, 1.12, sw * s), bev=0.16, seg=3, m=M_JEANS, rot=(sw * s * 0.9, 0, 0)))
        root.append(cube((0.68, 0.46, 1.12), P(s * 0.38, 0.28, sw * s * 1.6 + 0.1), bev=0.18, seg=3, m=M_SHOE))
        arm = -0.5 if (pose == 'run') else 0.12
        root.append(cube((0.46, 1.26, 0.56), P(s * 0.92, 2.78, -sw * s * 1.2), bev=0.18, seg=3, m=M_SHIRT, rot=(-sw * s * 1.1, 0, s * arm)))
        root.append(sph(0.32, P(s * 1.06, 2.02, -sw * s * 1.6), m=M_SKIN, seg=12, rings=8))
    root.append(cube((2.12, 2.06, 1.98), P(0, 4.36, 0), bev=0.46, seg=4, m=M_SKIN))
    root.append(cube((2.24, 1.52, 2.1), P(0, 4.82, -0.1), bev=0.42, seg=4, m=M_HAIR))
    root.append(cube((2.04, 0.6, 0.55), P(0, 5.06, 0.92), bev=0.2, seg=2, m=M_HAIR))
    root.append(cube((0.76, 0.6, 0.76), P(0.16, 5.62, -0.1), bev=0.22, seg=2, m=M_HAIR))
    for s in (-1, 1):
        root.append(cube((0.36, 0.46, 0.18), P(s * 0.33, 4.46, 1.18), bev=0.08, m=M_FLOWW))
        root.append(cube((0.19, 0.24, 0.13), P(s * 0.35, 4.45, 1.32), bev=0.05, m=M_SHOE))
    root.append(cube((0.52, 0.13, 0.11), P(0, 3.98, 1.12), bev=0.05, m=mat('mouth', (0.55, 0.2, 0.18), 0.6)))
    sph(0.45, P(0, 0.06, 0), m=mat('blob', (0.02, 0.03, 0.08), 0.9), seg=16, rings=8, squash=(1.7, 0.12, 1.2))
    return root

# ---------------- the space sky ----------------
def space_world():
    w = bpy.data.worlds[0] if bpy.data.worlds else bpy.data.worlds.new('space')
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 60
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (1, 1, 1, 1)
    ramp.color_ramp.elements[1].position = 0.035; ramp.color_ramp.elements[1].color = (0.012, 0.02, 0.10, 1)
    neb = nt.nodes.new('ShaderNodeTexNoise'); neb.inputs['Scale'].default_value = 1.6
    nebRamp = nt.nodes.new('ShaderNodeValToRGB')
    nebRamp.color_ramp.elements[0].position = 0.42; nebRamp.color_ramp.elements[0].color = (0, 0, 0, 1)
    nebRamp.color_ramp.elements[1].position = 0.75; nebRamp.color_ramp.elements[1].color = (0.16, 0.05, 0.38, 1)
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'ADD'
    mix.inputs['Factor'].default_value = 1.0
    nt.links.new(tc.outputs['Generated'], vor.inputs['Vector'])
    nt.links.new(tc.outputs['Generated'], neb.inputs['Vector'])
    nt.links.new(vor.outputs['Distance'], ramp.inputs['Fac'])
    nt.links.new(neb.outputs['Fac'], nebRamp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], mix.inputs['A'])
    nt.links.new(nebRamp.outputs['Color'], mix.inputs['B'])
    nt.links.new(mix.outputs['Result'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = 1.0
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])

def lights():
    bpy.ops.object.light_add(type='SUN', location=(30, -40, 50))
    sun = bpy.context.object
    sun.data.energy = 4.5
    sun.data.color = (1.0, 0.96, 0.88)
    sun.data.angle = 0.09
    sun.rotation_euler = (math.radians(38), math.radians(-18), math.radians(35))
    bpy.ops.object.light_add(type='AREA', location=(-28, -22, 24))
    fill = bpy.context.object
    fill.data.energy = 3800
    fill.data.size = 40
    fill.data.color = (0.6, 0.72, 1.0)
    fill.rotation_euler = (math.radians(58), 0, math.radians(-52))
    bpy.ops.object.light_add(type='SUN', location=(-20, 40, 30))
    rim = bpy.context.object
    rim.data.energy = 3.2
    rim.data.color = (0.65, 0.8, 1.0)
    rim.rotation_euler = (math.radians(-55), math.radians(10), math.radians(-150))

def ground_z(x, y, R=40.0, cz=-39.5):
    d = R * R - x * x - y * y
    return (math.sqrt(d) if d > 0 else 0) + cz

# ---------------- the Galaxy scatter kit ----------------
def flower_cluster(at, rnd, scale=1.0):
    for k in range(6):
        a = rnd.random() * 6.28; r = rnd.random() * 1.6 * scale
        x, y, z = at[0] + math.cos(a) * r, at[1], at[2] + math.sin(a) * r
        h = (0.7 + rnd.random() * 0.8) * scale
        cone(0.06 * scale, 0.05 * scale, h, (x, y + h / 2, z), M_LEAF, verts=6)
        m = (M_FLOWY, M_FLOWP, M_FLOWW)[int(rnd.random() * 3) % 3]
        sph(0.36 * scale, (x, y + h, z), m, seg=8, rings=6, squash=(1, 0.55, 1))

def leaf_bush(at, rnd, scale=1.0):
    sph(0.32 * scale, (at[0], at[1] + 0.3 * scale, at[2]), M_LEAF, seg=10, rings=7)
    for k in range(9):
        a = k / 9 * 6.28 + rnd.random() * 0.4
        t = 0.5 + rnd.random() * 0.4
        cube((1.5 * scale, 0.22 * scale, 0.7 * scale),
             (at[0] + math.cos(a) * 0.9 * scale, at[1] + (0.5 + t * 0.5) * scale, at[2] + math.sin(a) * 0.9 * scale),
             bev=0.09, m=M_LEAF, rot=(math.radians(-10 - t * 18), 0, -a + math.pi / 2))

def tree(at, scale=1.0):
    cone(0.5 * scale, 0.32 * scale, 4.2 * scale, (at[0], at[1] + 2.1 * scale, at[2]), M_DIRT, verts=10)
    for dx, dy, dz, r in ((0, 5.4, 0, 2.3), (-1.4, 4.6, 0.9, 1.6), (1.5, 4.8, -0.8, 1.5)):
        sph(r * scale, (at[0] + dx * scale, at[1] + dy * scale, at[2] + dz * scale), M_GRASS2, seg=12, rings=9)

def pebble(at, rnd, scale=1.0):
    sph((0.3 + rnd.random() * 0.5) * scale, at, M_STONE, seg=8, rings=6, squash=(1, 0.6, 1))

# ---------------- shared set pieces ----------------
def planet(r, at, top_faces=True):
    ob = sph(r, at, M_GRASS, seg=48, rings=32)
    ob.data.materials.append(M_DIRT)
    for p in ob.data.polygons:
        wc = ob.matrix_world @ p.center
        if wc.z < at[2] + r * 0.12:
            p.material_index = 1
    return ob

def launch_star(at, scale=1.0, rot=(0, 0, 0)):
    torus(3.1 * scale, 0.5 * scale, (at[0], at[1], at[2] + 0.2), M_GOLD)
    star_mesh(2.2 * scale, 1.05 * scale, 0.7 * scale, (at[0], at[1], at[2] + 3.4 * scale), M_GOLD, rot=rot)
    bpy.ops.object.light_add(type='POINT', location=(at[0], at[1], at[2] + 3.4 * scale))
    lt = bpy.context.object
    lt.data.energy = 900 * scale
    lt.data.color = (1.0, 0.85, 0.4)
    lt.data.shadow_soft_size = 2.5

def bit_trail(a, b, n=18, arc=6.0):
    for k in range(n):
        t = k / max(1, n - 1)
        p = [a[i] + (b[i] - a[i]) * t for i in range(3)]
        p[2] += math.sin(t * math.pi) * arc
        star_mesh(0.55, 0.26, 0.2, p, M_BIT, rot=(0, k * 0.7, k * 0.5))

def ringed_planet(at, r, tilt=0.35):
    sph(r, at, mat('bigplanet', (0.32, 0.38, 0.85), 0.7), seg=32, rings=20)
    torus(r * 1.6, r * 0.12, at, mat('bigring', (0.85, 0.72, 0.4), 0.6), rot=(math.radians(72), tilt, 0))

def floating_island(at, s=1.0, rnd=None):
    sph(6 * s, at, M_GRASS, seg=20, rings=14, squash=(1, 1, 0.85))
    sph(5.2 * s, (at[0], at[1], at[2] - 3.2 * s), M_DIRT, seg=16, rings=12, squash=(1, 1, 1.15))
    if rnd:
        for k in range(3):
            a = k / 3 * 6.28 + rnd.random()
            flower_cluster((at[0] + math.cos(a) * 3.2 * s, at[1] + math.sin(a) * 3.2 * s, at[2] + 4.2 * s), rnd, 0.8 * s)

def camera(at, look, lens=32, fstop=None):
    bpy.ops.object.camera_add(location=at)
    cam = bpy.context.object
    d = Vector(look) - Vector(at)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = lens
    if fstop:
        cam.data.dof.use_dof = True
        cam.data.dof.focus_distance = d.length
        cam.data.dof.aperture_fstop = fstop
    bpy.context.scene.camera = cam

# ---------------- SHOT 1: the hero shot ----------------
def shot_hero():
    clean(); space_world(); lights()
    rnd = random.Random(42)
    planet(40, (0, 0, -39.5))
    G = ground_z
    # the winding path over the curve
    for k in range(16):
        t = k / 15
        x = -14 + t * 26 + math.sin(t * 3.4) * 4
        y = -4 + t * 22
        sph(2.6, (x, y, G(x, y) + 0.35), M_PATH, seg=12, rings=8, squash=(1.35, 1.35, 0.12))
    # the smooth white tower
    tx, ty = -19, 24
    cone(3.8, 3.8, 30, (tx, ty, G(tx, ty) + 14), M_WHITE, verts=28)
    torus(4.1, 0.5, (tx, ty, G(tx, ty) + 27), M_STONE)
    cone(4.4, 0.2, 5, (tx, ty, G(tx, ty) + 31), M_STONE, verts=28)
    cube((2.2, 0.4, 4.4), (tx + 2.8, ty, G(tx, ty) + 13), bev=0.3, m=mat('window', (0.3, 0.4, 0.62), 0.3))
    # life everywhere
    for k in range(26):
        a = rnd.random() * 6.28; r = 6 + rnd.random() * 24
        x, y = math.cos(a) * r, math.sin(a) * r
        flower_cluster((x, y, G(x, y) + 0.15), rnd, 0.9 + rnd.random() * 0.7)
    for k in range(12):
        a = rnd.random() * 6.28; r = 8 + rnd.random() * 22
        x, y = math.cos(a) * r, math.sin(a) * r
        leaf_bush((x, y, G(x, y) + 0.1), rnd, 0.9 + rnd.random() * 0.5)
    for k in range(20):
        a = rnd.random() * 6.28; r = 6 + rnd.random() * 25
        x, y = math.cos(a) * r, math.sin(a) * r
        pebble((x, y, G(x, y) + 0.2), rnd)
    for tx2, ty2, s in ((11, 13, 1.1), (-3, 17, 0.9), (20, -6, 1.0)):
        tree((tx2, ty2, G(tx2, ty2)), s)
    lx, ly = 13, -7
    launch_star((lx, ly, G(lx, ly) + 0.2), 1.1, rot=(0, 0.5, 0))
    bit_trail((1, -1, G(1, -1) + 3), (12, -6, G(12, -6) + 5), 16, 5.5)
    ringed_planet((46, 60, -95), 13)
    floating_island((-46, 38, -58), 1.2, rnd)
    floating_island((32, 62, -82), 0.9, rnd)
    kinan((0, 0, G(0, 0) + 0.2), rot_z=3.55)   # facing the camera
    camera((8, -17, G(0, 0) + 8.6), (0.5, 0.5, G(0, 0) + 3.6), lens=30, fstop=3.5)

# ---------------- SHOT 2: Meteor Mike ----------------
def shot_boss():
    clean(); space_world(); lights()
    rnd = random.Random(7)
    planet(26, (0, 0, -25))
    def G(x, y):
        d = 676 - x * x - y * y
        return (math.sqrt(d) if d > 0 else 0) - 25
    # rocky arena details
    for k in range(10):
        a = rnd.random() * 6.28; r = 6 + rnd.random() * 15
        x, y = math.cos(a) * r, math.sin(a) * r
        pebble((x, y, G(x, y) + 0.3), rnd, 1.4)
    for k in range(6):
        a = rnd.random() * 6.28; r = 8 + rnd.random() * 12
        x, y = math.cos(a) * r, math.sin(a) * r
        cone(0.5, 0.05, 1.6, (x, y, G(x, y) + 0.8), M_FLOWP, verts=6)
        sph(1.5, (x, y, G(x, y) + 1.9), mat('mcap', (0.55, 0.3, 0.85), 0.5), seg=10, rings=7, squash=(1, 0.55, 1))
    # MIKE: a real rocky meteor giant, face toward the camera
    mz = G(0, 2) + 4.4
    mike = sph(4.6, (0, 2, mz), M_ROCK, seg=28, rings=18)
    rnd2 = random.Random(99)
    for v in mike.data.vertices:
        n = v.co.normalized()
        v.co += n * (rnd2.random() - 0.5) * 0.9
    for k in range(7):
        a = k / 7 * 6.28
        sph(1.15, (math.cos(a) * 3.6, 2 + math.sin(a) * 3.6, mz + math.sin(k * 2.3) * 1.8), M_ROCK, seg=8, rings=6)
    fx, fy = 0.37, -0.93   # facing the camera
    px, py = 0.93, 0.37
    for s in (-1, 1):
        ex, ey = fx * 4.2 + px * 1.35 * s, 2 + fy * 4.2 + py * 1.35 * s
        cube((0.95, 1.1, 0.4), (ex, ey, mz + 1.25), bev=0.16, m=M_FLOWW, rot=(0, 0, math.atan2(fy, fx) + math.pi / 2))
        cube((0.5, 0.55, 0.35), (ex + fx * 0.35, ey + fy * 0.35, mz + 1.2), bev=0.1, m=mat('redeye', (0.8, 0.12, 0.12), 0.4), rot=(0, 0, math.atan2(fy, fx) + math.pi / 2))
        bx, by = fx * 3.9 + px * 1.5 * s, 2 + fy * 3.9 + py * 1.5 * s
        cube((1.35, 0.42, 0.4), (bx, by, mz + 2.7), bev=0.1, m=M_SHOE, rot=(0, 0, math.atan2(fy, fx) + math.pi / 2 - s * 0.5))
    mx, my = fx * 4.35, 2 + fy * 4.35
    cube((2.4, 0.8, 0.4), (mx, my, mz - 1.4), bev=0.12, m=M_SHOE, rot=(0, 0, math.atan2(fy, fx) + math.pi / 2))
    # the gold shockwave rings mid-expansion, flat on the ground
    torus(8.5, 0.55, (0, 2, G(0, 2) + 0.7), M_GOLD)
    torus(11.5, 0.35, (0, 2, G(0, 2) + 0.7), mat('ring2', (1, 0.85, 0.4), 0.4, emit=(1, 0.85, 0.4), emit_str=1.2))
    kinan((3.2, -4, G(3.2, -4) + 9), rot_z=0.7, pose='run')
    bit_trail((-11, -9, G(-11, -9) + 3), (13, 10, G(13, 10) + 12), 14, 8)
    ringed_planet((-55, 70, -110), 16)
    floating_island((42, 55, -80), 1.0, rnd)
    camera((9.5, -22, G(0, 2) + 13), (0, 1, mz + 3), lens=30, fstop=3.5)

# ---------------- SHOT 3: the vista ----------------
def shot_vista():
    clean(); space_world(); lights()
    rnd = random.Random(123)
    planet(95, (0, 0, -95))
    def G(x, y):
        d = 9025 - x * x - y * y
        return (math.sqrt(d) if d > 0 else 0) - 95
    for k in range(16):
        a = -1.5 + k / 15 * 3.0
        x, y = math.sin(a) * 44, -26 + math.cos(a) * 14
        flower_cluster((x, y, G(x, y) + 0.2), rnd, 1.3)
    for k in range(9):
        a = -1.3 + k / 8 * 2.6
        x, y = math.sin(a) * 34, -32 + math.cos(a) * 11
        leaf_bush((x, y, G(x, y) + 0.15), rnd, 1.3)
    for tx2, ty2, s in ((-28, -16, 1.4), (25, -18, 1.3), (2, -30, 1.5), (38, -28, 1.1)):
        tree((tx2, ty2, G(tx2, ty2)), s)
    # tower + arch + pond
    tx, ty = -16, -34
    cone(3.8, 3.8, 30, (tx, ty, G(tx, ty) + 14), M_WHITE, verts=28)
    cone(4.4, 0.2, 5, (tx, ty, G(tx, ty) + 31), M_STONE, verts=28)
    for s in (-1, 1):
        x2, y2 = s * 9, -14
        cone(1.5, 1.2, 11, (x2, y2, G(x2, y2) + 5.2), M_STONE, verts=14)
    ax, ay = 0, -14
    cube((19, 1.8, 1.8), (ax, ay, G(ax, ay) + 11.2), bev=0.4, m=M_STONE)
    px2, py2 = 18, -8
    sph(7, (px2, py2, G(px2, py2) + 0.4), M_WATER, seg=20, rings=12, squash=(1, 1, 0.16))
    torus(7.6, 0.8, (px2, py2, G(px2, py2) + 1.0), M_STONE)
    for lx, ly, ls in ((-36, -22, 1.2), (34, -10, 1.0)):
        launch_star((lx, ly, G(lx, ly) + 0.2), ls, rot=(0, 0.4, 0))
    bit_trail((-36, -22, G(-36, -22) + 5), (34, -10, G(34, -10) + 5), 22, 9)
    bit_trail((2, -30, G(2, -30) + 5), (48, 40, -20), 16, 14)
    floating_island((-62, 28, -22), 1.7, rnd)
    floating_island((58, 38, -30), 1.4, rnd)
    floating_island((6, 62, -52), 1.1, rnd)
    ringed_planet((70, 110, -170), 22)
    sph(9, (-80, 70, -140), mat('moonlet', (0.85, 0.6, 0.45), 0.7), seg=20, rings=14)
    kinan((0, -22, G(0, -22) + 0.2), rot_z=math.pi, pose='run')
    camera((0, -58, G(0, -40) + 26), (0, -16, G(0, -16) + 6), lens=28, fstop=11)

# ---------------- render ----------------
def setup_render():
    sc = bpy.context.scene
    for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'CYCLES'):
        try:
            sc.render.engine = eng
            break
        except TypeError:
            continue
    if sc.render.engine == 'CYCLES':
        sc.cycles.samples = 48
        sc.cycles.use_denoising = True
    sc.render.resolution_x = 1920
    sc.render.resolution_y = 1080
    sc.render.image_settings.file_format = 'PNG'
    sc.render.film_transparent = False
    sc.view_settings.view_transform = 'Standard'   # punchy, saturated — the Nintendo look
    sc.view_settings.exposure = -0.25
    try:   # bloom + gentle glow, the Galaxy shine
        sc.use_nodes = True
        nt = sc.node_tree
        nt.nodes.clear()
        rl = nt.nodes.new('CompositorNodeRLayers')
        glare = nt.nodes.new('CompositorNodeGlare')
        glare.glare_type = 'FOG_GLOW'
        try:
            glare.threshold = 1.0
        except AttributeError:
            pass
        comp = nt.nodes.new('CompositorNodeComposite')
        nt.links.new(rl.outputs['Image'], glare.inputs['Image'])
        nt.links.new(glare.outputs['Image'], comp.inputs['Image'])
    except Exception:
        pass

def render_shot(fn, name):
    fn()
    setup_render()
    bpy.context.scene.render.filepath = os.path.join(OUTDIR, name)
    bpy.ops.render.render(write_still=True)
    print('RENDERED %s' % name)

render_shot(shot_hero, 'concept-1-hero.png')
render_shot(shot_boss, 'concept-2-boss.png')
render_shot(shot_vista, 'concept-3-vista.png')
print('ALL RENDERS DONE')