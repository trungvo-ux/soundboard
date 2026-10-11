import bpy
import bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

scene = bpy.context.scene
for material in bpy.data.materials:
    if not material.use_nodes or not material.node_tree:
        continue
    tree = material.node_tree
    for shader in tree.nodes:
        if shader.type != 'BSDF_PRINCIPLED':
            continue
        for input_name in ('Base Color', 'Roughness'):
            socket = shader.inputs.get(input_name)
            link = next((edge for edge in tree.links if edge.to_socket == socket), None)
            if not link or link.from_node.type != 'GROUP':
                continue
            group = link.from_node.node_tree
            if not group:
                continue
            output = next((node for node in group.nodes if node.type == 'GROUP_OUTPUT' and node.is_active_output), None)
            if not output:
                continue
            value = output.inputs.get(link.from_socket.name)
            if not value or value.is_linked:
                continue
            tree.links.remove(link)
            socket.default_value = value.default_value

for obj in bpy.data.objects:
    if not any(c.name == 'switches' for c in obj.users_collection):
        continue
    for mod in obj.modifiers:
        if mod.type != 'NODES' or not mod.node_group:
            continue
        mod.node_group = mod.node_group.copy()
        tree = mod.node_group
        output = next((n for n in tree.nodes if n.type == 'GROUP_OUTPUT' and n.is_active_output), None)
        if not output:
            continue
        socket = output.inputs.get('Geometry')
        link = next((l for l in tree.links if l.to_socket == socket), None)
        if not link:
            continue
        from_socket = link.from_socket
        tree.links.remove(link)
        realize = tree.nodes.new('GeometryNodeRealizeInstances')
        tree.links.new(from_socket, realize.inputs['Geometry'])
        tree.links.new(realize.outputs['Geometry'], socket)
depsgraph = bpy.context.evaluated_depsgraph_get()
for obj in list(bpy.data.objects):
    if any(c.name == 'switches' for c in obj.users_collection):
        evaluated = obj.evaluated_get(depsgraph)
        mesh = bpy.data.meshes.new_from_object(evaluated, preserve_all_data_layers=True, depsgraph=depsgraph)
        if mesh:
            obj.modifiers.clear()
            obj.data = mesh
            if obj.name in {'eye.L', 'eye.R', 'mouth'}:
                layer = mesh.uv_layers.active
                values = [loop.uv.x for loop in layer.data]
                left, right = min(values), max(values)
                for loop in layer.data:
                    loop.uv.x = (loop.uv.x - left) / (right - left)
                image_name = 'eye' if obj.name.startswith('eye') else 'mouth'
                image = bpy.data.images.load(f'scripts/mii-assets/{image_name}.png', check_existing=True)
                material = bpy.data.materials.get(f'mii baked {image_name}')
                if not material:
                    material = bpy.data.materials.new(f'mii baked {image_name}')
                    material.use_nodes = True
                    material.blend_method = 'BLEND'
                    nodes = material.node_tree.nodes
                    shader = nodes.get('Principled BSDF')
                    texture = nodes.new('ShaderNodeTexImage')
                    texture.image = image
                    material.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])
                    material.node_tree.links.new(texture.outputs['Alpha'], shader.inputs['Alpha'])
                    shader.inputs['Roughness'].default_value = 0.8
                mesh.materials.clear()
                mesh.materials.append(material)
                if obj.name == 'mouth':
                    # The source mouth is a flat quad inside the curved face. Subdivide
                    # it and project it onto the head so it reads from every angle.
                    head = bpy.data.objects['head']
                    head_world = head.matrix_world
                    face = BVHTree.FromPolygons(
                        [head_world @ vertex.co for vertex in head.data.vertices],
                        [list(poly.vertices) for poly in head.data.polygons],
                    )
                    edit = bmesh.new()
                    edit.from_mesh(mesh)
                    bmesh.ops.subdivide_edges(edit, edges=list(edit.edges), cuts=16, use_grid_fill=True)
                    edit.to_mesh(mesh)
                    edit.free()
                    to_world = obj.matrix_world
                    to_local = to_world.inverted()
                    for vertex in mesh.vertices:
                        world = to_world @ vertex.co
                        hit, _, _, _ = face.ray_cast(Vector((world.x, -1.0, world.z)), Vector((0, 1, 0)), 3.0)
                        if hit:
                            world.y = hit.y - 0.03
                            vertex.co = to_local @ world

for obj in list(bpy.data.objects):
    if not any(c.name == 'switches' for c in obj.users_collection):
        bpy.data.objects.remove(obj, do_unlink=True)

for obj in bpy.data.objects:
    obj.hide_set(False)
    obj.hide_render = False
    obj.select_set(obj.type == 'MESH')

bpy.context.view_layer.objects.active = bpy.data.objects.get('head')
bpy.ops.export_scene.gltf(
    filepath='public/models/trung-mii.glb',
    export_format='GLB',
    use_selection=True,
    export_apply=True,
)
print('EXPORTED', [(o.name, len(o.data.vertices)) for o in bpy.data.objects])
