from PIL import Image
import sys

# White-range background colors to remove (R, G, B) — tweak as needed
BG_THRESHOLD = 30  # allows #ffffff down to ~#fdfdfd; increase to widen range

def is_background(r, g, b):
    return r >= (255 - BG_THRESHOLD) and g >= (255 - BG_THRESHOLD) and b >= (255 - BG_THRESHOLD)

def remove_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = pixels[x, y]
            if is_background(r, g, b):
                pixels[x, y] = (r, g, b, 0)

    img.save(output_path, "PNG")
    print(f"Saved: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python remove_bg.py input.png output.png")
        sys.exit(1)
    remove_bg(sys.argv[1], sys.argv[2])
