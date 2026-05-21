#!/usr/bin/env python3
"""Convert JPG/PNG images to AVIF with high quality defaults."""
from __future__ import annotations

import argparse
import io
import json
from pathlib import Path
from typing import Iterable
from urllib.request import urlopen

from PIL import Image  # type: ignore
import pillow_avif  # noqa: F401


EXTS = {".jpg", ".jpeg", ".png"}


def is_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


def collect_sources(inputs: Iterable[str], recursive: bool) -> list[str]:
    sources: list[str] = []
    for entry in inputs:
        if is_url(entry):
            sources.append(entry)
            continue
        path = Path(entry)
        if path.is_dir():
            iterator = path.rglob("*") if recursive else path.glob("*")
            for candidate in iterator:
                if candidate.is_file() and candidate.suffix.lower() in EXTS:
                    sources.append(str(candidate))
            continue
        if path.is_file() and path.suffix.lower() in EXTS:
            sources.append(str(path))
    return sources


def open_image(source: str) -> Image.Image:
    if is_url(source):
        with urlopen(source) as response:
            data = response.read()
        return Image.open(io.BytesIO(data))
    return Image.open(source)


def compute_output_path(source: str, output: str | None) -> Path:
    if output:
        return Path(output)
    if is_url(source):
        raise ValueError("Output path is required when source is a URL.")
    src_path = Path(source)
    return src_path.with_suffix(".avif")


def resize_if_needed(image: Image.Image, max_size: int | None) -> Image.Image:
    if not max_size:
        return image
    width, height = image.size
    if max(width, height) <= max_size:
        return image
    image = image.copy()
    image.thumbnail((max_size, max_size), Image.LANCZOS)
    return image


def save_image(image: Image.Image, output_path: Path, fmt: str, quality: int, speed: int) -> None:
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    if fmt.lower() == "avif":
        image.save(
            output_path,
            format="AVIF",
            quality=quality,
            speed=speed,
        )
        return
    if fmt.lower() == "png":
        image.save(output_path, format="PNG", optimize=True)
        return
    image.save(output_path, format=fmt.upper())


def update_member_photos(json_path: Path) -> int:
    data = json.loads(json_path.read_text(encoding="utf-8"))

    def update(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if key == "photo" and isinstance(value, str):
                    lower = value.lower()
                    if lower.endswith(".jpg") or lower.endswith(".jpeg") or lower.endswith(".png"):
                        obj[key] = Path(value).with_suffix(".avif").name
                else:
                    update(value)
        elif isinstance(obj, list):
            for item in obj:
                update(item)

    update(data)
    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 1


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert JPG/PNG images to AVIF.")
    parser.add_argument("inputs", nargs="*", help="Files, directories, or URLs to convert")
    parser.add_argument("--output", help="Explicit output path for a single input")
    parser.add_argument("--recursive", action="store_true", help="Process directories recursively")
    parser.add_argument("--format", default="avif", help="Output format (avif, png, webp, ...) ")
    parser.add_argument("--quality", type=int, default=92, help="AVIF quality (1-100)")
    parser.add_argument("--speed", type=int, default=6, help="AVIF speed (0-10, lower is slower/better)")
    parser.add_argument("--max-size", type=int, help="Resize so max dimension does not exceed this size")
    parser.add_argument("--update-members", help="Path to members.json to update .jpg/.png to .avif")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing output files")
    args = parser.parse_args()

    if args.update_members:
        update_member_photos(Path(args.update_members))

    if not args.inputs:
        return

    if args.output:
        sources = args.inputs
    else:
        sources = collect_sources(args.inputs, recursive=args.recursive)
    if args.output and len(sources) != 1:
        raise SystemExit("--output requires exactly one input source")

    for source in sources:
        output_path = compute_output_path(source, args.output)
        if not args.output:
            output_path = output_path.with_suffix(f".{args.format}")
        if output_path.exists() and not args.overwrite:
            continue
        image = open_image(source)
        image = resize_if_needed(image, args.max_size)
        save_image(image, output_path, fmt=args.format, quality=args.quality, speed=args.speed)
        print(f"{source} -> {output_path}")


if __name__ == "__main__":
    main()
