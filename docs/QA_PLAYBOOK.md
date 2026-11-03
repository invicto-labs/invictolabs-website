# Invicto QA playbook

Run `npm run build` first. Use a distinct local output directory for each production candidate. In PowerShell, set `$env:QA_OUTPUT = 'qa/after-phase5'` and run the checks below from the repository root.

| Script | Evidence |
| --- | --- |
| `npm run test:all` | Full browser and audit campaign under `runs/` |
| `npm run test:nav:regression` | Header scroll-spy, route highlighting, history, and zoom |
| `npm run test:menu:regression` | Scrolled menu viewport, scroll lock, focus trap, outside click, and restoration |
| `npm run test:a11y` | Axe scans by route, engine, and state |
| `npm run test:perf` | Lighthouse JSON and HTML, mobile medians, desktop samples |
| `npm run test:links` | Internal links, anchors, and external responses |

Treat runner failures and verified product failures separately. Retest failed cases on the same build. Use the SHA guard when resuming a full campaign and retain first-run evidence. Review zero document overflow, zero serious or critical axe findings, and the performance budgets in `tests/performance-budgets.json`.
