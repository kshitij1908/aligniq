import React from 'react';
import { HeatmapCell, ThrustArea, Quarter } from '../../types';

interface Props { data: HeatmapCell[] }

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const DEPTS: ThrustArea[] = ['Sales', 'Operations', 'HR', 'Marketing', 'IT', 'Other'];

function rateToColor(rate: number): string {
  if (rate === 0) return '#1e293b';
  if (rate >= 80) return `hsl(142,${40 + rate * 0.5}%,${25 + rate * 0.1}%)`;
  if (rate >= 50) return `hsl(${38 + rate},${ 60}%,30%)`;
  return `hsl(${rate * 0.5},60%,28%)`;
}

export default function HeatmapChart({ data }: Props) {
  const getCell = (dept: ThrustArea, q: Quarter) =>
    data.find(c => c.department === dept && c.quarter === q);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(4, 1fr)`, gap: 4 }}>
        {/* Header row */}
        <div />
        {QUARTERS.map(q => (
          <div key={q} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700,
            color: 'var(--text-secondary)', padding: '4px 0' }}>{q}</div>
        ))}

        {/* Data rows */}
        {DEPTS.map(dept => (
          <React.Fragment key={dept}>
            <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center',
              color: 'var(--text-primary)', paddingRight: 8 }}>{dept}</div>
            {QUARTERS.map(q => {
              const cell = getCell(dept, q);
              const rate = cell?.completionRate ?? 0;
              const count = cell?.goalCount ?? 0;
              return (
                <div key={q}
                  title={`${dept} · ${q}: ${rate}% (${count} goals)`}
                  style={{
                    height: 52, borderRadius: 6, background: rateToColor(rate),
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', cursor: 'default', transition: 'transform 0.15s',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {count > 0 ? (
                    <>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{rate}%</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{count} goals</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>—</div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completion Rate:</span>
        {[0, 25, 50, 75, 100].map(v => (
          <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 14, borderRadius: 3, background: rateToColor(v) }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
