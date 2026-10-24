# Blender -> Kinan vs. Mom: model the game's characters and props, export game-ready meshes.
# Run: blender.exe --background --python blender-models.py
# Output: C:\Users\SHADHUNTER\Desktop\Kinan vs. Mom\galaxy3d-models.js  (window.G3_MODELS)
import bpy, bmesh, math, random, json, os

OUT = r"C:\Users\SHADHUNTER\Desktop\Kinan vs. Mom\galaxy3d-models.js"
PARTS = {}

def clean():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def active():
    return bpy.context.object

def cube(size, bevel=0.08, seg=2, at=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at)
    ob = active()
    ob.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        m = ob.modifiers.new('b', 'BEVEL')
        m.width = bevel
        m.segments = seg
        bpy.ops.object.modifier_apply(modifier='b')
    return ob

def sphere(rad, seg=14, rings=10, at=(0, 0, 0), squash=(1, 1, 1), noise=0.0, seed=1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=rad, location=at)
    ob = active()
    ob.scale = squash
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if noise > 0:
        rnd = random.Random(seed)
        me = ob.data
        for v in me.vertices:
            n = v.co.normalized()
            v.co += n * (rnd.random() - 0.5) * noise
    return ob

def cyl(r1, r2, depth, at=(0, 0, 0), verts=12):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=depth, location=at)
    return active()

def export(name, objects):
    """merge objects into one game mesh: [px,py,pz, nx,ny,nz, u,v, r,g,b] per vertex + indices"""
    verts, idx = [], []
    seen = {}
    for ob in objects:
        me = ob.data
        me.calc_loop_triangles()
        acc = {}
        for v in me.vertices:
            key = (round(v.co.x, 4), round(v.co.y, 4), round(v.co.z, 4))
            a = acc.setdefault(key, [0.0, 0.0, 0.0])
            a[0] += v.normal.x; a[1] += v.normal.y; a[2] += v.normal.z
        for lt in me.loop_triangles:
            face = []
            for li in lt.loops:
                v = me.vertices[me.loops[li].vertex_index]
                p = (round(v.co.x, 3), round(v.co.y, 3), round(v.co.z, 3))
                a = acc[(round(v.co.x, 4), round(v.co.y, 4), round(v.co.z, 4))]
                l = math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) or 1
                n = (round(a[0] / l, 2), round(a[1] / l, 2), round(a[2] / l, 2))
                u = round(math.atan2(v.co.z, v.co.x) / (2 * math.pi) + 0.5, 3)
                w = round(0.5 - v.co.y * 0.25, 3)
                light = 0.86 + 0.14 * max(0.0, min(1.0, n[1] * 0.5 + 0.5))
                key = (p, n, u, w, round(light, 2))
                if key not in seen:
                    seen[key] = len(verts) // 11
                    verts += [p[0], p[1], p[2], n[0], n[1], n[2], u, w, light, light, light]
                face.append(seen[key])
            if len(face) == 3:
                idx += face
    PARTS[name] = {'v': verts, 'i': idx}

# ---------------- KINAN (sized to the engine rig's part boxes) ----------------
clean()
head = cube((1.95, 1.9, 1.85), bevel=0.42, seg=3)
export('head', [head])
hair = cube((2.06, 1.42, 1.98), bevel=0.4, seg=3, at=(0, 0.42, -0.1))
fringe = cube((1.9, 0.55, 0.5), bevel=0.18, seg=2, at=(0, 0.62, 0.85))
tuft = cube((0.7, 0.55, 0.7), bevel=0.2, seg=2, at=(0.15, 1.15, -0.1))
export('hair', [hair, fringe, tuft])
clean()
export('torso', [cube((1.5, 1.45, 0.95), bevel=0.2, seg=3)])
export('belt', [cube((1.42, 0.32, 0.9), bevel=0.1, seg=2)])
export('arm', [cube((0.42, 1.15, 0.5), bevel=0.16, seg=3)])
export('hand', [cube((0.5, 0.5, 0.55), bevel=0.18, seg=3)])
export('leg', [cube((0.55, 1.5, 0.6), bevel=0.14, seg=3)])
shoe = cube((0.62, 0.42, 1.0), bevel=0.16, seg=3)
toe = cube((0.56, 0.3, 0.5), bevel=0.14, seg=2, at=(0, -0.06, 0.32))
export('shoe', [shoe, toe])
export('mouth', [cube((0.5, 0.12, 0.1), bevel=0.04, seg=1)])
export('eyeWhite', [cube((0.34, 0.42, 0.16), bevel=0.07, seg=2)])
export('eyePupil', [cube((0.18, 0.22, 0.12), bevel=0.05, seg=2)])

# ---------------- METEOR MIKE ----------------
clean()
export('mikeBody', [sphere(3.3, seg=18, rings=12, squash=(1, 0.96, 1), noise=0.34, seed=7)])
clean()
export('rockSpike', [sphere(0.85, seg=8, rings=6, noise=0.3, seed=3)])
clean()
export('sproutBody', [sphere(1.05, seg=12, rings=9, squash=(1.05, 0.95, 1.05), noise=0.12, seed=11)])
export('leaf', [cube((0.9, 0.22, 0.5), bevel=0.08, seg=2)])

# ---------------- NATURE ----------------
clean()
canopy = sphere(1.0, seg=12, rings=9, noise=0.16, seed=5)
lobe1 = sphere(0.72, seg=10, rings=7, at=(0.55, 0.18, 0.28), noise=0.12, seed=6)
lobe2 = sphere(0.65, seg=10, rings=7, at=(-0.5, 0.22, -0.3), noise=0.12, seed=8)
export('canopy', [canopy, lobe1, lobe2])
clean()
trunk = cyl(0.95, 0.62, 7, at=(0, 0, 0), verts=10)
root1 = cyl(0.55, 0.2, 1.6, at=(0.55, -3.1, 0.3), verts=8)
root2 = cyl(0.5, 0.18, 1.4, at=(-0.5, -3.15, -0.25), verts=8)
export('trunk', [trunk, root1, root2])
clean()
export('mushCap', [sphere(1.0, seg=12, rings=8, squash=(1, 0.6, 1), noise=0.06, seed=9)])
clean()
export('boulder', [sphere(1.0, seg=9, rings=7, squash=(1.1, 0.85, 0.95), noise=0.32, seed=13)])
clean()
petals = []
for k in range(5):
    a = k / 5 * 2 * math.pi
    petals.append(cube((0.62, 0.16, 0.34), bevel=0.07, seg=2,
                       at=(math.cos(a) * 0.42, 0, math.sin(a) * 0.42)))
    petals[-1].rotation_euler = (0, -a, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
petals.append(sphere(0.3, seg=8, rings=6, squash=(1, 0.6, 1)))
export('flowerHead', petals)

# ---------------- write the game file ----------------
def r3(x):
    return round(x, 3)
lines = ['/* generated by blender-models.py — real models for the 3D galaxy (do not hand-edit) */',
         'window.G3_MODELS = {']
for name in sorted(PARTS):
    p = PARTS[name]
    lines.append('  %s: {' % json.dumps(name))
    lines.append('    v: [' + ','.join(str(r3(x)) for x in p['v']) + '],')
    lines.append('    i: [' + ','.join(str(x) for x in p['i']) + ']')
    lines.append('  },')
lines.append('};')
with open(OUT, 'w') as f:
    f.write('\n'.join(lines))
print('WROTE %s parts, %d bytes' % (len(PARTS), os.path.getsize(OUT)))