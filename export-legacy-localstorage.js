/* READ-ONLY export of MotoVault legacy data.
 * Run in the browser console on https://xmax250.netlify.app/ (same device/browser you normally use).
 * It only READS localStorage and downloads a JSON file. It never writes, clears or modifies anything. */
(() => {
  const KEY = 'motovault_xmax_v1_data';
  const raw = localStorage.getItem(KEY);
  if (raw === null) { console.warn('No data under key', KEY, '- wrong browser/profile/origin?'); return; }
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { console.error('Stored value is not valid JSON', e); return; }
  const payload = {
    _export: { source: location.origin, key: KEY, exportedAt: new Date().toISOString(), tool: 'legacy-readonly-export/1' },
    data: parsed
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'motovault-legacy-export-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  console.log('Exported. services:', parsed.services?.length, 'fuel:', parsed.fuel?.length, 'expenses:', parsed.expenses?.length);
})();
