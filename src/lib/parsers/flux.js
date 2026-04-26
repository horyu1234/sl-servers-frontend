// Parse a Flux CSV body (the format InfluxDB returns for /api/v2/query) into
// a recharts-friendly array of { time, [groupKey]: value } rows.
//
// The body consists of one or more "tables" separated by blank lines. Each
// table starts with optional #group / #datatype / #default annotations,
// followed by a header row beginning with `,result,table,…` and then data
// rows. We only care about three columns per data row: _time, _value, and
// the user-supplied groupBy column (e.g. iso_code).
export function parseFluxToSeries(body, { groupBy }) {
  if (!body || typeof body !== 'string') return [];
  const tables = body.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
  const merged = new Map();

  for (const table of tables) {
    const lines = table.split('\n').filter((l) => l && !l.startsWith('#'));
    if (lines.length === 0) continue;
    const headerLine = lines.shift();
    const header = headerLine.split(',');
    const timeIdx = header.indexOf('_time');
    const valueIdx = header.indexOf('_value');
    const groupIdx = header.indexOf(groupBy);
    if (timeIdx < 0 || valueIdx < 0 || groupIdx < 0) continue;

    for (const line of lines) {
      const cells = line.split(',');
      const time = cells[timeIdx];
      const valueStr = cells[valueIdx];
      const group = cells[groupIdx];
      if (!time || !group) continue;
      const value = Number.parseFloat(valueStr);
      if (Number.isNaN(value)) continue;
      if (Number.isNaN(Date.parse(time))) continue;

      const row = merged.get(time) ?? { time };
      row[group] = value;
      merged.set(time, row);
    }
  }

  return Array.from(merged.values()).sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}
