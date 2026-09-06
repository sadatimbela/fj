import os
from PIL import Image, ImageFilter, ImageOps, ImageEnhance, ImageDraw

out_dir = r"c:\3D\fj-landing\assets\services"

for i in range(1, 6):
    render_path = os.path.join(out_dir, f"service{i}_render.jpg")
    render_img = Image.open(render_path).convert("RGB")
    w, h = render_img.size
    
    gray = render_img.convert("L")
    
    # Bilateral-like smoothing to preserve edges while smoothing flat surfaces
    blurred = gray.filter(ImageFilter.GaussianBlur(radius=1.0))
    edges = blurred.filter(ImageFilter.FIND_EDGES)
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(edges)
    edges_contrasted = enhancer.enhance(3.8)
    
    # Invert so lines are dark and background is light
    wireframe_mono = ImageOps.invert(edges_contrasted)
    
    # Colorize: background is crisp architectural drafting paper, lines are precision navy/charcoal
    wireframe_colored = ImageOps.colorize(wireframe_mono, black="#1A2D42", white="#F5F6F8").convert("RGB")
    
    # Overlay subtle architectural CAD grid & drafting markings
    draw = ImageDraw.Draw(wireframe_colored, "RGBA")
    grid_spacing = 32
    grid_color = (49, 76, 105, 22) # very faint blueprint grid
    
    for x in range(0, w, grid_spacing):
        draw.line([(x, 0), (x, h)], fill=grid_color, width=1)
    for y in range(0, h, grid_spacing):
        draw.line([(0, y), (w, y)], fill=grid_color, width=1)
        
    # Add subtle corner architectural registration marks (+)
    reg_color = (214, 161, 80, 140) # FJ Gold accent mark
    m_len = 12
    margin = 16
    # Top-left mark
    draw.line([(margin, margin - m_len//2), (margin, margin + m_len//2)], fill=reg_color, width=1)
    draw.line([(margin - m_len//2, margin), (margin + m_len//2, margin)], fill=reg_color, width=1)
    # Top-right mark
    draw.line([(w - margin, margin - m_len//2), (w - margin, margin + m_len//2)], fill=reg_color, width=1)
    draw.line([(w - margin - m_len//2, margin), (w - margin + m_len//2, margin)], fill=reg_color, width=1)
    
    wireframe_out_path = os.path.join(out_dir, f"service{i}_wireframe.jpg")
    wireframe_colored.save(wireframe_out_path, quality=95)
    print(f"Updated with CAD grid: {wireframe_out_path}")

print("CAD wireframes updated!")
