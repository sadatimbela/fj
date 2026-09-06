import os
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

# Input paths
artifacts_dir = r"C:\Users\admin\.gemini\antigravity-ide\brain\47d9993f-cc65-4446-ae4c-f56586dddd41"
cards = [
    {
        "id": 1,
        "src": os.path.join(artifacts_dir, "arch_design_card_1788686974554.jpg"),
        "name": "architectural_design"
    },
    {
        "id": 2,
        "src": os.path.join(artifacts_dir, "house_villa_card_1788686998234.jpg"),
        "name": "house_villa_design"
    },
    {
        "id": 3,
        "src": os.path.join(artifacts_dir, "vis_3d_card_1788687029237.jpg"),
        "name": "3d_visualization"
    },
    {
        "id": 4,
        "src": os.path.join(artifacts_dir, "tech_drawings_card_1788687062444.jpg"),
        "name": "technical_drawings"
    },
    {
        "id": 5,
        "src": os.path.join(artifacts_dir, "site_planning_card_1788687117867.jpg"),
        "name": "site_planning"
    }
]

out_dir = r"c:\3D\fj-landing\assets\services"
os.makedirs(out_dir, exist_ok=True)

TARGET_WIDTH = 640
TARGET_HEIGHT = 440

for card in cards:
    cid = card["id"]
    src_path = card["src"]
    
    if not os.path.exists(src_path):
        print(f"Error: missing {src_path}")
        continue

    img = Image.open(src_path).convert("RGB")
    
    # Center crop and resize to exactly TARGET_WIDTH x TARGET_HEIGHT
    w, h = img.size
    target_ratio = TARGET_WIDTH / TARGET_HEIGHT
    current_ratio = w / h
    
    if current_ratio > target_ratio:
        # Image is wider than needed
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img_cropped = img.crop((left, 0, left + new_w, h))
    else:
        # Image is taller than needed
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        img_cropped = img.crop((0, top, w, top + new_h))
        
    render_img = img_cropped.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
    render_out_path = os.path.join(out_dir, f"service{cid}_render.jpg")
    render_img.save(render_out_path, quality=94)
    print(f"Saved: {render_out_path}")
    
    # Generate Architectural CAD Wireframe Line Art
    # Convert to grayscale
    gray = render_img.convert("L")
    
    # Apply edge detection filter
    # To get clean, crisp architectural CAD lines:
    edges1 = gray.filter(ImageFilter.FIND_EDGES)
    edges2 = gray.filter(ImageFilter.EDGE_ENHANCE_MORE)
    
    # Smooth slightly to reduce photo noise, then find edges
    blurred = gray.filter(ImageFilter.GaussianBlur(radius=1.2))
    edges = blurred.filter(ImageFilter.FIND_EDGES)
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(edges)
    edges_contrasted = enhancer.enhance(3.5)
    
    # Invert so background is clean architectural white/ivory and lines are dark charcoal / navy
    # Or authentic blueprint style (dark architectural navy background with white/cyan/gold lines)
    # Let's create an elegant architectural CAD sketch style:
    # Crisp dark charcoal lines on a soft drafting paper tone (#F5F4F0) with faint grid or pencil tone
    wireframe_mono = ImageOps.invert(edges_contrasted)
    
    # Boost brightness slightly and adjust threshold so only structural lines stand out
    fn = lambda x : 255 if x > 190 else (int(x * 1.1) if x > 80 else 30)
    wireframe_art = wireframe_mono.point(fn, mode='1').convert('L')
    wireframe_art = wireframe_art.filter(ImageFilter.SMOOTH)
    
    # Tint the wireframe with an architectural paper / CAD tone:
    # Background: soft ivory/white #FAF9F6, Lines: deep architectural navy #243950
    wireframe_rgb = Image.new("RGB", (TARGET_WIDTH, TARGET_HEIGHT), (247, 248, 250))
    # Paste with color tint
    tint_navy = Image.new("RGB", (TARGET_WIDTH, TARGET_HEIGHT), (41, 62, 85))
    tint_lines = ImageOps.colorize(wireframe_mono, black="#22354a", white="#f4f5f8")
    
    wireframe_out_path = os.path.join(out_dir, f"service{cid}_wireframe.jpg")
    tint_lines.save(wireframe_out_path, quality=94)
    print(f"Saved: {wireframe_out_path}")

print("All reveal pairs processed successfully!")
