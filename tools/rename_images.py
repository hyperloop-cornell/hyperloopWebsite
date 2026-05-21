#!/usr/bin/env python3
"""Rename image assets to lowercase alphanumeric filenames and update references."""
from __future__ import annotations

import argparse
import re
import uuid
from collections import defaultdict
from pathlib import Path
from typing import Iterable
from urllib.parse import quote


IMAGE_EXTS = {".avif", ".webp", ".png", ".jpg", ".jpeg"}
TEXT_EXTS = {".html", ".js", ".css", ".json", ".md", ".xml"}
SKIP_DIRS = {".git", ".venv", "node_modules"}
SKIP_FILES = {"tailwind.min.js"}


def is_image(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTS


def is_text(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTS


def safe_stem(stem: str) -> str:
    sanitized = re.sub(r"[^a-zA-Z0-9]+", "", stem).lower()
    return sanitized or "image"


def iter_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.is_file():
            yield path


def build_targets(images: list[Path]) -> dict[Path, Path]:
    used = defaultdict(set)
    targets: dict[Path, Path] = {}

    for path in images:
        ext = path.suffix.lower()
        base = safe_stem(path.stem)
        candidate = f"{base}{ext}"

        directory = path.parent
        if candidate in used[directory] or (
            (directory / candidate).exists() and (directory / candidate) != path
        ):
            suffix = 2
            while True:
                alt = f"{base}{suffix}{ext}"
                if alt not in used[directory] and not (directory / alt).exists():
                    candidate = alt
                    break
                suffix += 1

        used[directory].add(candidate)
        targets[path] = directory / candidate

    return targets


def rename_files(targets: dict[Path, Path]) -> dict[str, str]:
    temp_map: dict[Path, Path] = {}
    name_map: dict[str, str] = {}

    for old, new in targets.items():
        if old.name == new.name:
            continue
        tmp_name = f"__tmp__{uuid.uuid4().hex}{old.suffix.lower()}"
        tmp_path = old.with_name(tmp_name)
        old.rename(tmp_path)
        temp_map[tmp_path] = new
        name_map[old.name] = new.name

    for tmp, final in temp_map.items():
        tmp.rename(final)

    return name_map


def update_references(root: Path, replacements: dict[str, str]) -> list[Path]:
    if not replacements:
        return []

    keys = sorted(replacements.keys(), key=len, reverse=True)
    updated: list[Path] = []

    for path in iter_files(root):
        if not is_text(path):
            continue
        if path.name in SKIP_FILES:
            continue

        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        new_content = content
        for key in keys:
            new_content = new_content.replace(key, replacements[key])

        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            updated.append(path)

    return updated


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Rename image files to lowercase alphanumeric filenames and update references."
    )
    parser.add_argument("--root", default=".", help="Root directory to scan")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    images = [path for path in iter_files(root) if is_image(path)]

    targets = build_targets(images)
    name_map = rename_files(targets)

    replacements: dict[str, str] = {}
    for old_name, new_name in name_map.items():
        replacements[old_name] = new_name
        encoded = quote(old_name)
        if encoded != old_name:
            replacements[encoded] = new_name

    updated_files = update_references(root, replacements)

    print(f"Renamed {len(name_map)} images")
    print(f"Updated {len(updated_files)} files")


if __name__ == "__main__":
    main()
