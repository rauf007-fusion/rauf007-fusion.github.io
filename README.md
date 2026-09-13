# Mohammed Rauf — portfolio

Senior Project Planner · Primavera P6 · NEC4 · Project Controls.

Live at **https://rauf007-fusion.github.io**

A static site — plain HTML, CSS and JavaScript, no build step.

- `index.html`, `css/`, `js/` — the site. `js/career.js` holds the career data
  that drives both the Gantt-style timeline and its phone-width list.
- `assets/` — screenshots. The Power BI screens come from an anonymised copy of
  the report; the web-app screens from the demo's sample project.
- `demo/` — a self-contained build of the P6 Schedule Analytics dashboard. It
  replays answers the analysis engine computed for a sample fit-out project, so
  it needs no server. The engine itself is not included.

## Designs

The site has three designs over the same content: **Current** (`css/site.css`),
**Blueprint** (`css/theme-blueprint.css`) and **Control room**
(`css/theme-control.css`). `site-theme.js` names the one visitors see; any page
can preview another with `?theme=blueprint` or `?theme=control` without
changing it.

`admin.html` switches the published design. It signs in with a GitHub token,
accepts only the `rauf007-fusion` account, and commits `site-theme.js` through
the GitHub API — so the check is GitHub's own write permission on this
repository, not a password in the page. Use a fine-grained token limited to this
repository with **Contents: Read and write**.
