"""
================================================================
洛阳桥 FBX 素材生成器 — Blender Python 脚本
Generates parametric 3D models of Luoyang Bridge components
================================================================
Usage: blender --background --python generate_models.py
Output: Assets/Models/Bridge/*.fbx
"""
import bpy
import bmesh
import math
import os
import sys

# Output directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_BRIDGE = os.path.join(SCRIPT_DIR, "Assets", "Models", "Bridge")
OUT_ENV = os.path.join(SCRIPT_DIR, "Assets", "Models", "Environment")
os.makedirs(OUT_BRIDGE, exist_ok=True)
os.makedirs(OUT_ENV, exist_ok=True)

def clear_scene():
    """Clear all objects in the scene."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    # Clear orphan data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)

def apply_stone_material(obj, name="Stone", color=(0.48, 0.44, 0.38, 1)):
    """Apply a stone-like material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = 0.85
    bsdf.inputs["Specular"].default_value = 0.1
    obj.data.materials.append(mat)

def export_fbx(filepath):
    """Export selected objects as FBX."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.fbx(
        filepath=filepath,
        use_selection=True,
        global_scale=1.0,
        apply_unit_scale=True,
        apply_scale_options='FBX_SCALE_ALL',
        axis_forward='-Z',
        axis_up='Y',
        use_mesh_modifiers=True,
        mesh_smooth_type='FACE',
        add_leaf_bones=False,
        path_mode='COPY'
    )
    print(f"  ✅ Exported: {filepath}")

def export_obj(filepath):
    """Export as OBJ fallback."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.obj(
        filepath=filepath,
        use_selection=True,
        use_materials=True,
        use_triangles=True
    )
    print(f"  ✅ Exported: {filepath}")

# ================================================================
# 1. 船形桥墩 (Boat-Shaped Pier)
# ================================================================
def create_boat_pier():
    """Create a boat-shaped bridge pier with tapered ends."""
    print("🔨 Creating 船形桥墩 (Boat-Shaped Pier)...")
    clear_scene()

    # Parameters (real-world approximate, in meters)
    pier_len = 10.0      # Length along bridge axis
    pier_width = 4.0     # Width
    pier_height = 6.0    # Height
    tip_len = 3.0        # Pointed tip extension
    bevel = 0.15

    # Create base mesh using bmesh
    bm = bmesh.new()

    # Bottom boat-shape profile (wider)
    hw = pier_width / 2
    hl = pier_len / 2
    # Points: tip_left, top_left, top_right, tip_right, bottom_right, bottom_left
    profile_bottom = [
        (-hl - tip_len, 0),
        (-hl, hw),
        (hl, hw),
        (hl + tip_len, 0),
        (hl, -hw),
        (-hl, -hw),
    ]
    # Top profile (slightly narrower for taper)
    taper = 0.85
    profile_top = [
        (-hl - tip_len * taper, 0),
        (-hl, hw * taper),
        (hl, hw * taper),
        (hl + tip_len * taper, 0),
        (hl, -hw * taper),
        (-hl, -hw * taper),
    ]

    # Create vertices
    verts_bottom = [bm.verts.new((x, 0, z)) for x, z in profile_bottom]
    verts_top = [bm.verts.new((x, pier_height, z)) for x, z in profile_top]

    # Bottom face
    bm.faces.new(verts_bottom)
    # Top face
    bm.faces.new(list(reversed(verts_top)))
    # Side faces
    n = len(profile_bottom)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new([verts_bottom[i], verts_bottom[j], verts_top[j], verts_top[i]])

    bm.normal_update()
    mesh = bpy.data.meshes.new("BoatPier")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("BoatPier", mesh)
    bpy.context.collection.objects.link(obj)

    # Add bevel modifier for smoother edges
    bpy.context.view_layer.objects.active = obj
    mod = obj.modifiers.new("Bevel", 'BEVEL')
    mod.width = bevel
    mod.segments = 2

    # Subdivision for smoothness
    sub = obj.modifiers.new("Subdivision", 'SUBSURF')
    sub.levels = 1
    sub.render_levels = 2

    # Apply modifiers
    bpy.ops.object.select_all(action='SELECT')
    for m in obj.modifiers:
        bpy.ops.object.modifier_apply(modifier=m.name)

    apply_stone_material(obj, "PierStone", (0.42, 0.48, 0.54, 1))

    # Pier cap (flat slab on top)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, pier_height + 0.2, 0))
    cap = bpy.context.active_object
    cap.scale = (pier_len + 1.5, 0.4, pier_width + 0.8)
    cap.name = "PierCap"
    bpy.ops.object.transform_apply(scale=True)
    apply_stone_material(cap, "CapStone", (0.52, 0.48, 0.42, 1))

    export_fbx(os.path.join(OUT_BRIDGE, "BoatPier.fbx"))
    print("  参数: 长=10m, 宽=4m, 高=6m, 尖端=3m")

# ================================================================
# 2. 石板梁 (Stone Beam Slab)
# ================================================================
def create_stone_beam():
    """Create a single stone beam slab."""
    print("🔨 Creating 石板梁 (Stone Beam)...")
    clear_scene()

    # Single beam: 11m x 1m x 0.5m (real world)
    length = 11.0
    width = 1.0
    height = 0.5

    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, height/2, 0))
    beam = bpy.context.active_object
    beam.scale = (length, height, width)
    beam.name = "StoneBeam"
    bpy.ops.object.transform_apply(scale=True)

    # Slight bevel
    mod = beam.modifiers.new("Bevel", 'BEVEL')
    mod.width = 0.02
    mod.segments = 2
    bpy.ops.object.modifier_apply(modifier="Bevel")

    apply_stone_material(beam, "BeamStone", (0.52, 0.5, 0.44, 1))
    export_fbx(os.path.join(OUT_BRIDGE, "StoneBeam.fbx"))

# ================================================================
# 3. 栏杆柱 (Railing Post with Stone Lion)
# ================================================================
def create_railing_post():
    """Create a railing post with optional stone lion on top."""
    print("🔨 Creating 栏杆柱 (Railing Post + Stone Lion)...")
    clear_scene()

    # Post: 0.25m x 1.2m x 0.25m
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.6, 0))
    post = bpy.context.active_object
    post.scale = (0.25, 1.2, 0.25)
    post.name = "RailingPost"
    bpy.ops.object.transform_apply(scale=True)

    mod = post.modifiers.new("Bevel", 'BEVEL')
    mod.width = 0.01
    mod.segments = 1
    bpy.ops.object.modifier_apply(modifier="Bevel")

    apply_stone_material(post, "PostStone", (0.55, 0.52, 0.46, 1))

    # Stone lion (simplified — sphere + scaled body)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, segments=16, ring_count=12, location=(0, 1.4, 0))
    head = bpy.context.active_object
    head.name = "LionHead"
    head.scale = (1, 1.2, 0.9)
    bpy.ops.object.transform_apply(scale=True)

    # Body
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.15, 0))
    body = bpy.context.active_object
    body.scale = (0.22, 0.3, 0.18)
    body.name = "LionBody"
    bpy.ops.object.transform_apply(scale=True)
    mod = body.modifiers.new("Bevel", 'BEVEL')
    mod.width = 0.02
    mod.segments = 2
    bpy.ops.object.modifier_apply(modifier="Bevel")

    # Base
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.02, 0))
    base = bpy.context.active_object
    base.scale = (0.3, 0.08, 0.3)
    base.name = "LionBase"
    bpy.ops.object.transform_apply(scale=True)

    for obj in [head, body, base]:
        apply_stone_material(obj, "LionStone", (0.58, 0.54, 0.48, 1))

    export_fbx(os.path.join(OUT_BRIDGE, "RailingPostWithLion.fbx"))

# ================================================================
# 4. 栏杆面板 (Railing Panel)
# ================================================================
def create_railing_panel():
    """Create a railing panel section between posts."""
    print("🔨 Creating 栏杆面板 (Railing Panel)...")
    clear_scene()

    # Panel: 3m x 0.8m x 0.1m
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.45, 0))
    panel = bpy.context.active_object
    panel.scale = (3.0, 0.8, 0.1)
    panel.name = "RailingPanel"
    bpy.ops.object.transform_apply(scale=True)

    mod = panel.modifiers.new("Bevel", 'BEVEL')
    mod.width = 0.01
    mod.segments = 1
    bpy.ops.object.modifier_apply(modifier="Bevel")

    apply_stone_material(panel, "PanelStone", (0.56, 0.53, 0.47, 1))

    # Top rail bar
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.2, 0))
    bar = bpy.context.active_object
    bar.scale = (3.2, 0.12, 0.14)
    bar.name = "TopRail"
    bpy.ops.object.transform_apply(scale=True)
    apply_stone_material(bar, "RailStone", (0.54, 0.51, 0.45, 1))

    export_fbx(os.path.join(OUT_BRIDGE, "RailingPanel.fbx"))

# ================================================================
# 5. 筏型基础 (Raft Foundation Block)
# ================================================================
def create_foundation():
    """Create a raft foundation section with irregular stones."""
    print("🔨 Creating 筏型基础 (Raft Foundation)...")
    clear_scene()

    # Main slab
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.5, 0))
    slab = bpy.context.active_object
    slab.scale = (14, 2, 12)
    slab.name = "FoundationSlab"
    bpy.ops.object.transform_apply(scale=True)

    #  Add some random displacement for rough surface
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=4)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Displace top vertices slightly for rough look
    mesh = slab.data
    import random
    random.seed(42)
    for v in mesh.vertices:
        if v.co.y > 0.4:
            v.co.y += random.uniform(-0.1, 0.15)
            v.co.x += random.uniform(-0.05, 0.05)
            v.co.z += random.uniform(-0.05, 0.05)

    apply_stone_material(slab, "FoundationStone", (0.3, 0.3, 0.28, 1))

    # Scattered rocks on top
    for i in range(8):
        sz = random.uniform(0.3, 0.8)
        px = random.uniform(-6, 6)
        pz = random.uniform(-5, 5)
        bpy.ops.mesh.primitive_ico_sphere_add(radius=sz, subdivisions=2,
            location=(px, sz * 0.3, pz))
        rock = bpy.context.active_object
        rock.scale = (random.uniform(0.8, 1.5), random.uniform(0.4, 0.8), random.uniform(0.8, 1.3))
        rock.name = f"Rock_{i}"
        bpy.ops.object.transform_apply(scale=True)
        apply_stone_material(rock, f"RockMat_{i}", (0.32, 0.3 + random.uniform(0, 0.05), 0.28, 1))

    export_fbx(os.path.join(OUT_BRIDGE, "RaftFoundation.fbx"))

# ================================================================
# 6. 牡蛎固基层 (Oyster Cementation Layer)
# ================================================================
def create_oyster_layer():
    """Create the oyster cementation layer."""
    print("🔨 Creating 种蛎固基层 (Oyster Layer)...")
    clear_scene()

    # Base layer
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    layer = bpy.context.active_object
    layer.scale = (14, 0.6, 11)
    layer.name = "OysterBase"
    bpy.ops.object.transform_apply(scale=True)
    apply_stone_material(layer, "OysterBaseMat", (0.35, 0.42, 0.35, 1))

    # Oyster clusters
    import random
    random.seed(99)
    for i in range(25):
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=random.uniform(0.15, 0.35),
            segments=8, ring_count=6,
            location=(
                random.uniform(-6.5, 6.5),
                0.3 + random.uniform(0, 0.15),
                random.uniform(-5, 5)
            )
        )
        oyster = bpy.context.active_object
        oyster.scale = (
            random.uniform(0.8, 1.5),
            random.uniform(0.3, 0.6),
            random.uniform(0.8, 1.3)
        )
        oyster.rotation_euler = (
            random.uniform(0, 0.3),
            random.uniform(0, 6.28),
            random.uniform(0, 0.3)
        )
        oyster.name = f"Oyster_{i}"
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        g = random.uniform(0.4, 0.55)
        apply_stone_material(oyster, f"OysterMat_{i}", (0.3, g, 0.3, 1))

    export_fbx(os.path.join(OUT_BRIDGE, "OysterLayer.fbx"))

# ================================================================
# 7. 桥面板 (Bridge Deck)
# ================================================================
def create_bridge_deck():
    """Create a bridge deck section."""
    print("🔨 Creating 桥面板 (Bridge Deck Section)...")
    clear_scene()

    # Deck: covers one span (14m long x 7m wide x 0.15m thick)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.075, 0))
    deck = bpy.context.active_object
    deck.scale = (14, 0.15, 7)
    deck.name = "BridgeDeck"
    bpy.ops.object.transform_apply(scale=True)

    mod = deck.modifiers.new("Bevel", 'BEVEL')
    mod.width = 0.01
    mod.segments = 1
    bpy.ops.object.modifier_apply(modifier="Bevel")

    apply_stone_material(deck, "DeckStone", (0.55, 0.52, 0.46, 1))
    export_fbx(os.path.join(OUT_BRIDGE, "BridgeDeck.fbx"))

# ================================================================
# 8. 水面平面 (Water Plane)
# ================================================================
def create_water_plane():
    """Create a large water plane for the environment."""
    print("🔨 Creating 水面 (Water Plane)...")
    clear_scene()

    bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
    water = bpy.context.active_object
    water.name = "WaterPlane"

    # Subdivide for wave animation
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=30)
    bpy.ops.object.mode_set(mode='OBJECT')

    mat = bpy.data.materials.new(name="Water")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.1, 0.35, 0.5, 1)
    bsdf.inputs["Roughness"].default_value = 0.15
    bsdf.inputs["Specular"].default_value = 0.8
    bsdf.inputs["Alpha"].default_value = 0.75
    try:
        mat.blend_method = 'BLEND'
    except:
        pass
    water.data.materials.append(mat)

    export_fbx(os.path.join(OUT_ENV, "WaterPlane.fbx"))

# ================================================================
# 9. 完整桥梁组装 (Full Bridge Assembly)
# ================================================================
def create_full_bridge():
    """Assemble a complete 5-span bridge section."""
    print("🔨 Creating 完整桥梁 (Full Bridge Assembly)...")
    clear_scene()

    pier_spacing = 14.0
    pier_count = 6
    total_len = (pier_count - 1) * pier_spacing
    start_x = -total_len / 2

    import random
    random.seed(42)

    # Foundation
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -8.5, 0))
    found = bpy.context.active_object
    found.scale = (total_len + 15, 2, 14)
    found.name = "Foundation"
    bpy.ops.object.transform_apply(scale=True)
    apply_stone_material(found, "FoundStone", (0.3, 0.3, 0.28, 1))

    # Oyster layer
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -6.8, 0))
    oy = bpy.context.active_object
    oy.scale = (total_len + 10, 0.6, 13)
    oy.name = "OysterLayer"
    bpy.ops.object.transform_apply(scale=True)
    apply_stone_material(oy, "OysterMat", (0.32, 0.42, 0.32, 1))

    # Piers
    for i in range(pier_count):
        px = start_x + i * pier_spacing
        # Boat shape via bmesh
        bm = bmesh.new()
        pier_h = 6.0
        hw, hl, tip = 2.0, 5.0, 3.0
        profile = [
            (-hl - tip, 0), (-hl, hw), (hl, hw),
            (hl + tip, 0), (hl, -hw), (-hl, -hw),
        ]
        taper = 0.88
        prof_top = [(-hl - tip*taper, 0), (-hl, hw*taper), (hl, hw*taper),
                     (hl + tip*taper, 0), (hl, -hw*taper), (-hl, -hw*taper)]
        vb = [bm.verts.new((x + px, -pier_h, z)) for x, z in profile]
        vt = [bm.verts.new((x + px, 0, z)) for x, z in prof_top]
        bm.faces.new(vb)
        bm.faces.new(list(reversed(vt)))
        n = len(profile)
        for j in range(n):
            k = (j + 1) % n
            bm.faces.new([vb[j], vb[k], vt[k], vt[j]])
        bm.normal_update()
        mesh = bpy.data.meshes.new(f"Pier_{i}")
        bm.to_mesh(mesh)
        bm.free()
        obj = bpy.data.objects.new(f"Pier_{i}", mesh)
        bpy.context.collection.objects.link(obj)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        mod = obj.modifiers.new("Bevel", 'BEVEL')
        mod.width = 0.1
        mod.segments = 2
        bpy.ops.object.modifier_apply(modifier="Bevel")
        apply_stone_material(obj, f"PierStone_{i}", (0.42, 0.48, 0.54, 1))
        obj.select_set(False)

        # Cap
        bpy.ops.mesh.primitive_cube_add(size=1, location=(px, 0.2, 0))
        cap = bpy.context.active_object
        cap.scale = (11, 0.4, 4.5)
        cap.name = f"PierCap_{i}"
        bpy.ops.object.transform_apply(scale=True)
        apply_stone_material(cap, f"CapStone_{i}", (0.5, 0.48, 0.42, 1))

    # Beams (5 per span)
    for i in range(pier_count - 1):
        span_x = start_x + i * pier_spacing + pier_spacing / 2
        for b in range(5):
            bz = -3.5 / 2 + (3.5 / 5) * b + (3.5 / 10)
            bpy.ops.mesh.primitive_cube_add(size=1, location=(span_x, 0.65, bz))
            beam = bpy.context.active_object
            beam.scale = (pier_spacing - 1, 0.5, 3.5 / 5 - 0.05)
            beam.name = f"Beam_{i}_{b}"
            bpy.ops.object.transform_apply(scale=True)
            apply_stone_material(beam, f"BeamMat_{i}_{b}", (0.52, 0.5, 0.44, 1))

    # Deck
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 1.0, 0))
    deck = bpy.context.active_object
    deck.scale = (total_len - 2, 0.12, 3.7)
    deck.name = "Deck"
    bpy.ops.object.transform_apply(scale=True)
    apply_stone_material(deck, "DeckMat", (0.55, 0.52, 0.46, 1))

    # Railings (both sides)
    post_spacing = 3.0
    for side in [-1, 1]:
        z = side * (3.5 / 2 + 0.15)
        # Top rail
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 2.3, z))
        rail = bpy.context.active_object
        rail.scale = (total_len - 4, 0.12, 0.12)
        rail.name = f"Rail_{side}"
        bpy.ops.object.transform_apply(scale=True)
        apply_stone_material(rail, f"RailMat_{side}", (0.54, 0.51, 0.45, 1))

        # Posts
        half = (total_len - 4) / 2
        cnt = int((total_len - 4) / post_spacing)
        for p in range(cnt + 1):
            ppx = -half + p * post_spacing
            bpy.ops.mesh.primitive_cube_add(size=1, location=(ppx, 1.7, z))
            post = bpy.context.active_object
            post.scale = (0.2, 1.2, 0.2)
            post.name = f"Post_{side}_{p}"
            bpy.ops.object.transform_apply(scale=True)
            apply_stone_material(post, f"PostMat_{side}_{p}", (0.55, 0.52, 0.46, 1))

            # Stone lion every 4 posts
            if p % 4 == 0:
                bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, segments=12, ring_count=8,
                    location=(ppx, 2.5, z))
                lion = bpy.context.active_object
                lion.scale = (1, 1.2, 0.8)
                lion.name = f"Lion_{side}_{p}"
                bpy.ops.object.transform_apply(scale=True)
                apply_stone_material(lion, f"LionMat_{side}_{p}", (0.56, 0.53, 0.47, 1))

    export_fbx(os.path.join(OUT_BRIDGE, "FullBridge_5Span.fbx"))
    print(f"  完整桥梁: {pier_count}墩 {pier_count-1}跨, 总长约{total_len}m")

# ================================================================
# MAIN — Run all generators
# ================================================================
if __name__ == "__main__":
    print("=" * 60)
    print("  洛阳桥 FBX 素材生成器")
    print("  Luoyang Bridge FBX Asset Generator")
    print("=" * 60)

    create_boat_pier()
    create_stone_beam()
    create_railing_post()
    create_railing_panel()
    create_foundation()
    create_oyster_layer()
    create_bridge_deck()
    create_water_plane()
    create_full_bridge()

    print("\n" + "=" * 60)
    print("  🎉 All FBX models generated!")
    print(f"  Bridge: {OUT_BRIDGE}")
    print(f"  Environment: {OUT_ENV}")
    print("=" * 60)
