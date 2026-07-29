// D:\hospital-frontend\src\ai-control-center\components\Logs\AILogs.tsx

import React, { useState, useMemo } from 'react';

interface LogEntry {
  id?: string;
  timestamp?: string | Date;
  level?: 'info' | 'warn' | 'error' | 'debug';
  message?: string;
  agent?: string;
  source?: string;
  details?: Record<string, any>;
}

interface AILogsProps {
  data: {
    agents?: Record<string, any>;
    logs?: LogEntry[];
  } | null;
}

type LogLevel = 'all' | 'info' | 'warn' | 'error' | 'debug';

const AILogs: React.FC<AILogsProps> = ({ data }) => {
  const [filterLevel, setFilterLevel] = useState<LogLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');

  // Extract logs from data or use empty array
  const logs = data?.logs || [];

  // Get all unique agent names from logs
  const agentNames = useMemo(() => {
    const names = new Set<string>();
    logs.forEach(log => {
      if (log.agent) names.add(log.agent);
      if (log.source) names.add(log.source);
    });
    return Array.from(names).sort();
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // Filter by agent
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(log => 
        log.agent === selectedAgent || log.source === selectedAgent
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(log => 
        log.message?.toLowerCase().includes(query) ||
        log.agent?.toLowerCase().includes(query) ||
        log.source?.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [logs, filterLevel, searchQuery, selectedAgent]);

  // Get log level icon
  const getLevelIcon = (level: string = 'info'): string => {
    const icons: Record<string, string> = {
      'info': 'ℹ️',
      'warn': '⚠️',
      'error': '❌',
      'debug': '🐛'
    };
    return icons[level] || '📝';
  };

  // Get log level color
  const getLevelColor = (level: string = 'info'): string => {
    const colors: Record<string, string> = {
      'info': '#4fc3f7',
      'warn': '#ffb74d',
      'error': '#ef5350',
      'debug': '#81c784'
    };
    return colors[level] || '#e0e0e0';
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string | Date | undefined): string => {
    if (!timestamp) return '--:--:--';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-IN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get level count
  const getLevelCount = (level: LogLevel): number => {
    if (level === 'all') return logs.length;
    return logs.filter(log => log.level === level).length;
  };

  // Handle clear logs
  const handleClearLogs = () => {
    // In a real implementation, this would clear logs via API
    console.log('Clear logs requested');
  };

  // Handle export logs
  const handleExportLogs = () => {
    // In a real implementation, this would export logs as CSV/JSON
    console.log('Export logs requested');
  };

  return (
    <div className="ai-logs">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h3>📋 AI Logs</h3>
        <span className="badge">{filteredLogs.length} entries</span>
      </div>

      {/* Filter Controls */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px', 
        marginBottom: '16px',
        padding: '12px 16px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        {/* Level Filter */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#888', marginRight: '4px' }}>Level:</span>
          {(['all', 'info', 'warn', 'error', 'debug'] as LogLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              style={{
                padding: '4px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                background: filterLevel === level ? '#1a237e' : '#f5f7fb',
                color: filterLevel === level ? '#fff' : '#555',
                transition: 'all 0.2s ease'
              }}
            >
              {level === 'all' ? 'All' : level}
              <span style={{ 
                marginLeft: '4px',
                fontSize: '10px',
                opacity: 0.7,
                background: filterLevel === level ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                padding: '0 4px',
                borderRadius: '2px'
              }}>
                {getLevelCount(level)}
              </span>
            </button>
          ))}
        </div>

        {/* Agent Filter */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#888', marginRight: '4px' }}>Agent:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            style={{
              padding: '4px 8px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '12px',
              background: '#fff',
              color: '#333',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Agents</option>
            {agentNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: '1', minWidth: '150px' }}>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1',
              padding: '4px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              minWidth: '100px'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                background: '#ffebee',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          <button
            onClick={handleExportLogs}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: '4px',
              background: '#e3f2fd',
              color: '#0d47a1',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            📥 Export
          </button>
          <button
            onClick={handleClearLogs}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: '4px',
              background: '#ffebee',
              color: '#c62828',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Logs Display */}
      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px',
            color: '#666'
          }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>📭</span>
            <p>No logs found</p>
            {searchQuery && <p style={{ fontSize: '12px', color: '#888' }}>Try adjusting your filters</p>}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const level = log.level || 'info';
            const color = getLevelColor(level);
            
            return (
              <div className="log-entry" key={log.id || index}>
                <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                <span className={`log-level ${level}`}>
                  {getLevelIcon(level)} {level.toUpperCase()}
                </span>
                <span className="log-message">
                  {log.agent && <span style={{ color: '#4fc3f7' }}>[{log.agent}]</span>}
                  {' '}
                  {log.message || 'No message'}
                  {log.details && (
                    <span style={{ 
                      color: '#888', 
                      fontSize: '11px', 
                      marginLeft: '8px',
                      cursor: 'pointer'
                    }}>
                      [Details]
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Log Stats Footer */}
      <div style={{ 
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#888',
        padding: '0 4px'
      }}>
        <span>
          Showing {filteredLogs.length} of {logs.length} entries
        </span>
        <span>
          {filterLevel !== 'all' && `Filter: ${filterLevel}`}
          {selectedAgent !== 'all' && ` | Agent: ${selectedAgent}`}
          {searchQuery && ` | Search: "${searchQuery}"`}
        </span>
      </div>
    </div>
  );
};

export default AILogs;