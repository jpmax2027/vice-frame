// Leonida Sunset Studio — collage layouts for the cover canvas.
// Each layout is a list of panels in normalised coordinates (0..1 of the
// cover). The renderer clips every photo into its panel, so one photo can
// fill a single hero frame or several photos can share a poster grid.

export const LAYOUTS = [
  {
    id: 'hero',
    name: 'Hero Solo',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  {
    id: 'duo',
    name: 'Duo Split',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  {
    id: 'trio',
    name: 'Trio Strip',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  {
    id: 'quad',
    name: 'Quad Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: 'hero-trio',
    name: 'Hero + Trio',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 1 / 3, h: 0.38 },
      { x: 1 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
      { x: 2 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
    ],
  },
  {
    id: 'mosaic',
    name: 'Mosaic Lead',
    panels: [
      { x: 0, y: 0, w: 0.58, h: 1 },
      { x: 0.58, y: 0, w: 0.42, h: 0.5 },
      { x: 0.58, y: 0.5, w: 0.42, h: 0.5 },
    ],
  },
];

/** Finds a layout by id, falling back to the quad grid. */
export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) ?? LAYOUTS[3];
}
