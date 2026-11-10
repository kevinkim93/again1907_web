# Event artwork

The 2027 event artwork is typeset in SVG. The palette uses warm paper
(`#f7f2e7`), deep navy (`#142b45`) and one muted red (`#96483e`). Solid fills,
thin rules and generous spacing replace the earlier clouds and light effects.

Edit the text, sizes and positions in `scripts/generate-event-artwork.py`, then run:

```sh
python -m pip install fonttools
python scripts/generate-event-artwork.py
```

The script writes these versioned assets under `public/images/`:

- `again1907-6th-poster.svg`: 1086 × 1448 printable/downloadable event poster.
- `again1907-theme.svg`: 1200 × 630 theme artwork.
- `again1907-6th-share.svg`: 1200 × 630 source for the social preview.

To also rebuild `again1907-6th-share.png` for Open Graph and Twitter previews,
install the optional Pillow dependency and pass `--png`:

```sh
python -m pip install fonttools pillow
python scripts/generate-event-artwork.py --png
```

The PNG renderer uses the SVG's element positions and the original bundled
fonts. No browser or network access is needed during generation. When changing
the artwork, regenerate and commit both the SVG sources and social PNG.

The SVGs contain editable text and embedded WOFF font subsets. They therefore
retain their typography when displayed through an image element or downloaded,
without requesting a font from another site. The fonts come from this repository's
`public/fonts/` directory; provenance and SIL Open Font License notices are in
`public/fonts/SOURCES.txt`, `NanumMyeongjo-OFL.txt`, and `PlayfairDisplay-OFL.txt`.
Each subset also preserves the font attribution and license metadata.

Python, fontTools and Pillow are only authoring tools. The Next.js app serves the
finished assets directly and needs none of them to build or run. The social
preview uses PNG because many preview crawlers do not accept SVG images.

The homepage offers the standalone theme artwork alongside the poster at
`/images/again1907-theme.svg`, labeled `주제 아트워크 다운로드`.
