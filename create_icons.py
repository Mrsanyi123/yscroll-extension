#!/usr/bin/env python3
"""
Simple icon generator for YScroll extension
Creates placeholder PNG icons if PIL/Pillow is available
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    def create_icon(size, filename):
        # Create image with white background
        img = Image.new('RGB', (size, size), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw rounded rectangle background
        draw.rounded_rectangle([(0, 0), (size, size)], radius=size//5, fill='white')
        
        # Try to draw text "Y"
        try:
            # Try to use a system font
            font_size = int(size * 0.6)
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()
        
        # Draw "Y" in blue
        text = "Y"
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - bbox[1]
        
        # Draw text in blue (#3b82f6)
        draw.text((x, y), text, fill='#3b82f6', font=font)
        
        # Save
        img.save(filename)
        print(f"Created {filename}")
    
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Create icons
    create_icon(16, 'icons/icon16.png')
    create_icon(48, 'icons/icon48.png')
    create_icon(128, 'icons/icon128.png')
    
    print("\n✅ All icons created successfully!")
    print("You can now load the extension in Chrome.")
    
except ImportError:
    print("⚠️  PIL/Pillow not installed.")
    print("\nTo create icons automatically, install Pillow:")
    print("  pip install Pillow")
    print("\nOr create icons manually:")
    print("1. Use an online tool like favicon.io")
    print("2. Create 16x16, 48x48, and 128x128 PNG files")
    print("3. Save them as icon16.png, icon48.png, icon128.png in the icons/ folder")
