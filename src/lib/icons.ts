// The pictograms a diagram may put beside a label. The model picks one by name
// for each node; the page draws it. Each is line art on a 24-unit grid, drawn
// with a stroke and no fill, so it takes the colour of the text beside it.

export const ICONS = {
  code: 'M3 5h18v14H3z M3 9h18 M10 12.5l-2 2 2 2 M14 12.5l2 2-2 2',
  database: 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 2.5v3 M12 18.5v3 M2.5 12h3 M18.5 12h3 M5.3 5.3l2.1 2.1 M16.6 16.6l2.1 2.1 M5.3 18.7l2.1-2.1 M16.6 7.4l2.1-2.1',
  shield: 'M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z M9 12l2 2 4-4',
  lock: 'M5 11h14v10H5z M8 11V8a4 4 0 0 1 8 0v3 M12 15v2',
  cloud: 'M7 18a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 4.5 4.5 0 0 1 17.5 18z',
  server: 'M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01',
  person: 'M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7',
  people: 'M9 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 5.5a3 3 0 0 1 0 5.5 M17.5 13.3c2 .8 3.5 2.9 3.5 5.7',
  robot: 'M5 9h14v10H5z M12 5v4 M12 4h.01 M9 13h.01 M15 13h.01 M9.5 16.5h5 M2.5 13v2 M21.5 13v2',
  flow: 'M3 4h7v6H3z M14 14h7v6h-7z M6.5 10v4a2 2 0 0 0 2 2H14',
  chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  doc: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  check: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 12l3 3 5-6',
  warning: 'M12 4l9 16H3z M12 10v4 M12 17h.01',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M15.5 15.5L20 20',
  plug: 'M9 3v5 M15 3v5 M6 8h12v3a6 6 0 0 1-12 0z M12 17v4',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  money: 'M3 7h18v10H3z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z M6 10v4 M18 10v4',
  rocket: 'M12 3c3 2 5 5.5 5 9.5L15 16H9l-2-3.5C7 8.5 9 5 12 3z M12 9h.01 M9 16l-2 4 M15 16l2 4 M12 16v4',
  layers: 'M12 4l9 4.5-9 4.5-9-4.5z M3 13l9 4.5 9-4.5',
  mobile: 'M7 3h10v18H7z M11 18h2',
  test: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3 M7.5 15h9',
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as [IconName, ...IconName[]];
