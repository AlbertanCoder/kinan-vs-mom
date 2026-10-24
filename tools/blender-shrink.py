# downscale the concept renders into chat-friendly JPEGs
import bpy, os
SRC = r"C:\Users\SHADHUNTER\Desktop\Kinan vs Mom backups\renders"
for name in ('concept-1-hero', 'concept-2-boss', 'concept-3-vista'):
    img = bpy.data.images.load(os.path.join(SRC, name + '.png'))
    sc = bpy.context.scene
    sc.render.resolution_x = 1280
    sc.render.resolution_y = 720
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 88
    sc.render.filepath = os.path.join(SRC, name + '-small.jpg')
    img.save_render(sc.render.filepath, scene=sc)
    print('SMALL %s' % name)
print('SMALLS DONE')