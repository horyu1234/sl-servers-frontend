import { describe, it, expect } from 'vitest';
import { parseFluxToSeries } from './flux';

const SAMPLE = [
  '#group,false,false,true,true,false,false,true,true,true',
  '#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string',
  '#default,_result,,,,,,,,',
  ',result,table,_start,_stop,_time,_value,_field,_measurement,iso_code',
  ',,0,2026-04-25T00:00:00Z,2026-04-25T01:00:00Z,2026-04-25T00:00:00Z,100,player_count,server_stats,KR',
  ',,0,2026-04-25T00:00:00Z,2026-04-25T01:00:00Z,2026-04-25T00:30:00Z,120,player_count,server_stats,KR',
  '',
  '#group,false,false,true,true,false,false,true,true,true',
  '#datatype,string,long,dateTime:RFC3339,dateTime:RFC3339,dateTime:RFC3339,long,string,string,string',
  '#default,_result,,,,,,,,',
  ',result,table,_start,_stop,_time,_value,_field,_measurement,iso_code',
  ',,1,2026-04-25T00:00:00Z,2026-04-25T01:00:00Z,2026-04-25T00:00:00Z,55,player_count,server_stats,JP',
  ',,1,2026-04-25T00:00:00Z,2026-04-25T01:00:00Z,2026-04-25T00:30:00Z,60,player_count,server_stats,JP',
  '',
].join('\n');

describe('parseFluxToSeries', () => {
  it('returns ordered rows merged by _time across iso_code series', () => {
    const result = parseFluxToSeries(SAMPLE, { groupBy: 'iso_code' });
    expect(result).toEqual([
      { time: '2026-04-25T00:00:00Z', KR: 100, JP: 55 },
      { time: '2026-04-25T00:30:00Z', KR: 120, JP: 60 },
    ]);
  });

  it('returns the set of group keys observed across the response', () => {
    const result = parseFluxToSeries(SAMPLE, { groupBy: 'iso_code' });
    expect(Object.keys(result[0]).filter((k) => k !== 'time').sort()).toEqual(['JP', 'KR']);
  });

  it('returns [] for an empty body', () => {
    expect(parseFluxToSeries('', { groupBy: 'iso_code' })).toEqual([]);
  });

  it('drops malformed rows without throwing', () => {
    const broken = ',result,table,_start,_stop,_time,_value,_field,_measurement,iso_code\n,,0,a,a,not-a-time,bad-value,player_count,server_stats,KR\n';
    expect(parseFluxToSeries(broken, { groupBy: 'iso_code' })).toEqual([]);
  });

  it('handles CRLF line endings (real InfluxDB serialization)', () => {
    const SAMPLE_CRLF = SAMPLE.replace(/\n/g, '\r\n');
    const result = parseFluxToSeries(SAMPLE_CRLF, { groupBy: 'iso_code' });
    expect(result).toEqual([
      { time: '2026-04-25T00:00:00Z', KR: 100, JP: 55 },
      { time: '2026-04-25T00:30:00Z', KR: 120, JP: 60 },
    ]);
  });
});
