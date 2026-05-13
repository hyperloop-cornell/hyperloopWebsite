"""Resize and convert JPG/PNG images for the Hyperloop website.

The script preserves aspect ratio, skips upscaling, and can batch process
either individual files or whole directories.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageOps


INPUT_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Resize and convert JPG/PNG assets for the Hyperloop website."
    )
    parser.add_argument(
        "inputs",
        nargs="+",
        help="Input file(s) or directory(ies) to process.",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Directory where optimized images should be written.",
    )
    parser.add_argument(
        "--format",
        choices=("avif", "webp", "jpeg", "png"),
        default="avif",
        help="Output format to write for every processed image.",
    )
    parser.add_argument(
        "--max-side",
        type=int,
        default=1200,
        help="Maximum width or height in pixels. Images smaller than this are not enlarged.",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=80,
        help="Lossy quality setting used for JPEG, WebP, and AVIF outputs.",
    )
    parser.add_argument(
        "--background",
        default="#ffffff",
        help="Background color used when flattening transparent images to JPEG.",
    )
    return parser.parse_args()


def iter_sources(paths: Iterable[str]) -> Iterable[tuple[Path, Path]]:
    for raw in paths:
        source = Path(raw)
        if not source.exists():
            raise FileNotFoundError(f"Input path does not exist: {source}")

        if source.is_dir():
            for candidate in sorted(source.rglob("*")):
                if candidate.is_file() and candidate.suffix.lower() in INPUT_EXTENSIONS:
                    yield source, candidate
            continue

        if source.suffix.lower() not in INPUT_EXTENSIONS:
            raise ValueError(f"Unsupported input type: {source}")
        yield source.parent, source


def target_suffix(output_format: str) -> str:
    if output_format == "jpeg":
        return ".jpg"
    return f".{output_format}"


def resize_image(image: Image.Image, max_side: int) -> Image.Image:
    if max_side <= 0:
        return image.copy()

    width, height = image.size
    if max(width, height) <= max_side:
        return image.copy()

    return ImageOps.contain(image, (max_side, max_side), method=Image.Resampling.LANCZOS)


def flatten_for_jpeg(image: Image.Image, background: str) -> Image.Image:
    if image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info):
        rgba = image.convert("RGBA")
        matte = Image.new("RGBA", rgba.size, background)
        return Image.alpha_composite(matte, rgba).convert("RGB")
    return image.convert("RGB") if image.mode != "RGB" else image


def prepare_image(image: Image.Image, output_format: str, background: str) -> Image.Image:
    if output_format == "jpeg":
        return flatten_for_jpeg(image, background)

    if image.mode in {"P", "1"}:
        return image.convert("RGBA" if "transparency" in image.info else "RGB")

    return image


def save_image(image: Image.Image, destination: Path, output_format: str, quality: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)

    save_kwargs: dict[str, object] = {}
    if output_format == "jpeg":
        save_kwargs = {
            "format": "JPEG",
            "quality": quality,
            "optimize": True,
            "progressive": True,
        }
    elif output_format == "webp":
        save_kwargs = {
            "format": "WEBP",
            "quality": quality,
            "method": 6,
        }
    elif output_format == "avif":
        save_kwargs = {
            "format": "AVIF",
            "quality": quality,
        }
    elif output_format == "png":
        save_kwargs = {
            "format": "PNG",
            "optimize": True,
            "compress_level": 9,
        }

    image.save(destination, **save_kwargs)


def process_source(source_root: Path, source: Path, output_dir: Path, output_format: str, max_side: int, quality: int, background: str) -> None:
    relative = source.relative_to(source_root)
    destination = output_dir / relative.with_suffix(target_suffix(output_format))

    with Image.open(source) as opened:
        opened = ImageOps.exif_transpose(opened)
        resized = resize_image(opened, max_side)
        prepared = prepare_image(resized, output_format, background)
        save_image(prepared, destination, output_format, quality)

    source_size = source.stat().st_size
    destination_size = destination.stat().st_size
    print(f"{source.as_posix()} -> {destination.as_posix()} ({source_size} bytes -> {destination_size} bytes)")


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir)

    for source_root, source in iter_sources(args.inputs):
        process_source(
            source_root=source_root,
            source=source,
            output_dir=output_dir,
            output_format=args.format,
            max_side=args.max_side,
            quality=args.quality,
            background=args.background,
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())