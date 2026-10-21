# MOTO VAULT AI

Service tracker for a Yamaha XMAX 250. A static PWA with no build step: it works on GitHub Pages as is.

## Deploy
1. Upload these files to the root of a new GitHub repository.
2. Settings > Pages > Deploy from a branch > `main` / root.
3. Open the Pages URL on your phone and choose Add to Home screen.

## Data
- Stored in this browser's localStorage under `motovault_ai_v2`. Back up regularly: More > Back up (JSON).
- First load contains the 14 records from `xmax250.zip` (8 services, 3 fuel, 3 expenses) and 15 part rules, with original values and legacy IDs (`L-svc-1`...).
- The 4,200 km (15 Aug 2025) and 3,000 km (10 Sep 2025) services are out of order. They are kept as recorded, flagged, and excluded from date forecasts.
- Live data from the old site is not included. Export it with `export-legacy-localstorage.js`, then use More > Import. Re-importing never duplicates; conflicting IDs are reported and not overwritten.
- The odometer (17,183 km, 28 Jul 2026) is the last known reading, not confirmed. Tap Update on Home.

## Test
`node --test tests/logic.test.mjs`

## Not included yet
Firebase sync and sign-in, push notifications, receipt scanning and AI questions, and add/edit forms for fuel and other expenses.
