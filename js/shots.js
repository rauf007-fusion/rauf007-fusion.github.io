/*
 * Power BI screens shown in the Work section. Each is a page of an ANONYMISED
 * copy of the report: it reads a programme with the client, site, contract and
 * plot codes replaced, and its route-map data emptied. Only list screens
 * captured from that copy - never from a report reading a live programme.
 */
window.PBI_SHOTS = [
  {
    name: 'Summary', src: 'assets/pbi-executive.webp', w: 1800, h: 1013,
    cap: 'The executive summary — progress, critical and negative-float counts, forecast finish, the activity S-curve and the milestone register.',
  },
  {
    name: 'Overview', src: 'assets/pbi-overview.webp', w: 1800, h: 1013,
    cap: 'Programme overview — activity counts by WBS and activity type, with the WBS breakdown behind them.',
  },
  {
    name: 'Critical path', src: 'assets/pbi-critical.webp', w: 1800, h: 1013,
    cap: 'Critical path — the work driving completion by WBS and activity code, with an adjustable near-critical threshold.',
  },
  {
    name: 'Float', src: 'assets/pbi-float.webp', w: 1800, h: 1013,
    cap: 'Float analysis — the total-float distribution, its trend by month, and the activities carrying the least float.',
  },
  {
    name: 'Schedule health', src: 'assets/pbi-health.webp', w: 1800, h: 1013,
    cap: 'Schedule health — the DCMA 14-point assessment, each check with its threshold and result.',
  },
];
