import React from 'react';
import { TeamsCardPayload } from '../../types';
import { ExternalLink } from 'lucide-react';

interface Props {
  payload: TeamsCardPayload;
  onAction?: (url: string) => void;
}

export default function TeamsCard({ payload, onAction }: Props) {
  const accent = payload.accentColor || '#6264A7';
  return (
    <div style={{
      background: '#1e1e1e', borderRadius: 8, overflow: 'hidden',
      border: '1px solid #333', fontFamily: 'Segoe UI, sans-serif', maxWidth: 420,
    }}>
      <div style={{ height: 4, background: accent }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{payload.title}</div>
        {payload.subtitle && <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>{payload.subtitle}</div>}
        <div style={{ fontSize: 13, color: '#ccc', marginBottom: 12 }}>{payload.body}</div>
        {payload.facts && payload.facts.length > 0 && (
          <div style={{ background: '#2a2a2a', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
            {payload.facts.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: i < payload.facts!.length - 1 ? 4 : 0 }}>
                <span style={{ color: '#888', minWidth: 110 }}>{f.label}</span>
                <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{f.value}</span>
              </div>
            ))}
          </div>
        )}
        {payload.actions && payload.actions.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {payload.actions.map((a, i) => (
              <button key={i}
                onClick={() => a.url && onAction?.(a.url)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 4, border: 'none',
                  background: i === 0 ? accent : '#3a3a3a',
                  color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500,
                }}>
                {a.title}{a.url && <ExternalLink size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
