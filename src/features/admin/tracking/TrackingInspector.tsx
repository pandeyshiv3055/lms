import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  RefreshCw,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  Send,
  Eye,
} from 'lucide-react';
import { trackingService } from '../../../services/tracking.service';
import { XApiStatement, ScormDataModel } from '../../../types';

export const TrackingInspector: React.FC = () => {
  const [statements, setStatements] = useState<XApiStatement[]>([]);
  const [scormData, setScormData] = useState<ScormDataModel>(trackingService.getScormData());
  const [selectedStatement, setSelectedStatement] = useState<XApiStatement | null>(null);
  const [filterVerb, setFilterVerb] = useState<string>('all');

  const refreshData = () => {
    const list = trackingService.getXApiStatements();
    setStatements(list);
    setScormData(trackingService.getScormData());
    if (list.length > 0 && !selectedStatement) {
      setSelectedStatement(list[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear all recorded xAPI statements and reset SCORM state?')) {
      trackingService.clearTracking();
      refreshData();
      setSelectedStatement(null);
    }
  };

  const filtered = statements.filter((s) => {
    if (filterVerb === 'all') return true;
    const v = s.verb?.display || s.verb?.id || '';
    return v.toLowerCase().includes(filterVerb.toLowerCase());
  });

  const getVerbBadge = (verbStr: string) => {
    const v = verbStr.toLowerCase();
    if (v.includes('passed') || v.includes('completed')) {
      return { bg: 'rgba(47, 125, 90, 0.12)', color: '#2F7D5A' };
    }
    if (v.includes('failed')) {
      return { bg: 'rgba(185, 77, 70, 0.12)', color: '#B94D46' };
    }
    if (v.includes('answered') || v.includes('interacted')) {
      return { bg: 'rgba(196, 124, 82, 0.12)', color: '#C47C52' };
    }
    return { bg: 'rgba(23, 59, 58, 0.12)', color: '#173B3A' };
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-evergreen">SCORM & xAPI Integration Boundary</span>
          <span style={{ fontSize: '12px', color: '#68716D' }}>Learning Record Store (LRS) & CMI Inspector</span>
        </div>
        <h1 style={{ fontSize: '26px', color: '#173B3A', margin: '0 0 8px 0' }}>
          Learning Records & Standards Tracking Inspector
        </h1>
        <p style={{ color: '#68716D', fontSize: '14px', margin: 0 }}>
          Inspect live xAPI activity streams and SCORM 1.2/2004 CMI data model values generated across Level 1 Video checkpoints, Level 2 Scenarios, and Level 3 Role-Plays.
        </p>
      </div>

      {/* Top SCORM CMI Data Model Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#68716D', fontWeight: 600, marginBottom: '4px' }}>
            cmi.core.lesson_status
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: scormData['cmi.core.lesson_status'] === 'completed' || scormData['cmi.core.lesson_status'] === 'passed' ? '#2F7D5A' : '#C47C52',
            }}
          >
            {scormData['cmi.core.lesson_status']?.toUpperCase() || 'INCOMPLETE'}
          </div>
          <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '4px' }}>
            SCORM 1.2 / 2004 Completion State
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#68716D', fontWeight: 600, marginBottom: '4px' }}>
            cmi.core.score.raw
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#173B3A' }}>
            {scormData['cmi.core.score.raw'] ?? 'N/A'}%
          </div>
          <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '4px' }}>
            Range: [{scormData['cmi.core.score.min'] ?? 0}–{scormData['cmi.core.score.max'] ?? 100}]
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#68716D', fontWeight: 600, marginBottom: '4px' }}>
            xAPI Statements Emitted
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#173B3A' }}>
            {statements.length}
          </div>
          <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '4px' }}>
            Client-Side Statement Store
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#68716D', fontWeight: 600, marginBottom: '4px' }}>
            cmi.suspend_data Payload
          </div>
          <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#173B3A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {scormData['cmi.suspend_data'] ? `${scormData['cmi.suspend_data'].slice(0, 32)}...` : 'empty'}
          </div>
          <div style={{ fontSize: '11px', color: '#8E9995', marginTop: '4px' }}>
            Serialized bookmarking state
          </div>
        </div>
      </div>

      {/* Main xAPI Statement Feed & JSON Viewer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left: Statement Stream List */}
        <div className="card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#173B3A" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#173B3A' }}>xAPI Activity Stream</h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={filterVerb}
                onChange={(e) => setFilterVerb(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #D6CFBF', fontSize: '12px' }}
              >
                <option value="all">All Verbs</option>
                <option value="experienced">experienced</option>
                <option value="interacted">interacted</option>
                <option value="answered">answered</option>
                <option value="completed">completed</option>
                <option value="passed">passed</option>
                <option value="failed">failed</option>
              </select>

              <button
                onClick={refreshData}
                className="btn btn-sm btn-ghost"
                title="Refresh statements"
                style={{ padding: '4px 8px' }}
              >
                <RefreshCw size={14} />
              </button>

              <button
                onClick={handleClear}
                className="btn btn-sm btn-ghost"
                title="Clear tracking data"
                style={{ padding: '4px 8px', color: '#B94D46' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#8E9995', fontSize: '13px' }}>
              No statements recorded yet. Complete an interactive video checkpoint, branching choice, or role-play conversation to generate events.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
              {filtered.map((st) => {
                const isSelected = selectedStatement?.id === st.id;
                const verbStyle = getVerbBadge(st.verb?.display || st.verb?.id || 'interacted');
                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStatement(st)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#ECE7DE' : '#FFFFFF',
                      border: `1px solid ${isSelected ? '#B87955' : '#E5E0D5'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Verb & Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: verbStyle.bg,
                          color: verbStyle.color,
                        }}
                      >
                        {(st.verb?.display || 'interacted').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8E9995' }}>
                        {new Date(st.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#173B3A', marginBottom: '2px' }}>
                      {st.object?.definition?.name || st.object?.id}
                    </div>

                    <div style={{ fontSize: '11px', color: '#68716D' }}>
                      Actor: <strong>{st.actor.name}</strong> • Type: {st.object?.definition?.type ? st.object.definition.type.split('/').pop() : 'activity'}
                      {st.result?.score?.raw !== undefined && ` • Score: ${st.result.score.raw}%`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Statement JSON Inspector */}
        <div className="card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCode size={18} color="#173B3A" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#173B3A' }}>Statement Details (JSON)</h3>
            </div>
            {selectedStatement && (
              <span style={{ fontSize: '11px', color: '#68716D' }}>
                ID: {selectedStatement.id.slice(0, 18)}...
              </span>
            )}
          </div>

          {selectedStatement ? (
            <pre
              style={{
                backgroundColor: '#172321',
                color: '#A7F3D0',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: 1.5,
                maxHeight: '480px',
                overflow: 'auto',
                fontFamily: 'monospace',
                margin: 0,
              }}
            >
              {JSON.stringify(selectedStatement, null, 2)}
            </pre>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8E9995', fontSize: '13px' }}>
              Select a statement on the left to inspect its complete xAPI object schema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
