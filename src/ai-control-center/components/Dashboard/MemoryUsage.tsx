// D:\hospital-frontend\src\ai-control-center\components\Dashboard\MemoryUsage.tsx

import React from 'react';

interface MemoryData {
  type?: 'patient' | 'session' | 'conversation' | 'preference';
  totalEntries?: number;
  sizeMB?: number;
  indexedTerms?: number;
}

interface MemoryUsageProps {
  data: {
    agents?: Record<string, {
      memory?: MemoryData[];
    }>;
  } | null;
}

const MemoryUsage: React.FC<MemoryUsageProps> = ({ data }) => {
  if (!data || !data.agents) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading memory data...</p>
      </div>
    );
  }

  // Extract all memory data from all agents
  const allMemory: MemoryData[] = [];
  Object.values(data.agents).forEach((agent: any) => {
    if (agent.memory && Array.isArray(agent.memory)) {
      agent.memory.forEach((m: MemoryData) => {
        allMemory.push(m);
      });
    }
  });

  // If no memory data found
  if (allMemory.length === 0) {
    return (
      <div className="memory-usage">
        <div className="section-header">
          <h3>🧠 Memory Usage</h3>
          <span className="badge">0 MB</span>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <div className="empty-text">No memory data available</div>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalSizeMB = allMemory.reduce((sum, m) => sum + (m.sizeMB || 0), 0);
  const totalEntries = allMemory.reduce((sum, m) => sum + (m.totalEntries || 0), 0);
  const totalIndexedTerms = allMemory.reduce((sum, m) => sum + (m.indexedTerms || 0), 0);

  // Group by memory type
  const memoryByType: Record<string, { sizeMB: number; entries: number }> = {};
  allMemory.forEach(m => {
    const type = m.type || 'other';
    if (!memoryByType[type]) {
      memoryByType[type] = { sizeMB: 0, entries: 0 };
    }
    memoryByType[type].sizeMB += (m.sizeMB || 0);
    memoryByType[type].entries += (m.totalEntries || 0);
  });

  // Sort types by size (largest first)
  const sortedTypes = Object.entries(memoryByType)
    .sort((a, b) => b[1].sizeMB - a[1].sizeMB);

  // Get type icon
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'patient': '👤',
      'session': '🔄',
      'conversation': '💬',
      'preference': '⚙️',
      'other': '📦'
    };
    return icons[type] || '📦';
  };

  // Get type label
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'patient': 'Patient Memory',
      'session': 'Session Memory',
      'conversation': 'Conversation Memory',
      'preference': 'User Preferences',
      'other': 'Other Memory'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get memory status color
  const getMemoryStatus = (sizeMB: number): { color: string; status: string } => {
    if (sizeMB < 50) return { color: '#4caf50', status: 'Low' };
    if (sizeMB < 200) return { color: '#ff9800', status: 'Medium' };
    if (sizeMB < 500) return { color: '#ff5722', status: 'High' };
    return { color: '#f44336', status: 'Critical' };
  };

  // Format size
  const formatSize = (mb: number): string => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const memoryStatus = getMemoryStatus(totalSizeMB);

  return (
    <div className="memory-usage">
      <div className="section-header">
        <h3>🧠 Memory Usage</h3>
        <span className="badge">{formatSize(totalSizeMB)}</span>
      </div>

      {/* Memory Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '8px', 
        marginBottom: '12px' 
      }}>
        <div style={{ 
          padding: '8px 12px', 
          background: '#f5f7fb', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a237e' }}>
            {formatSize(totalSizeMB)}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Total Memory</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#e3f2fd', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#0d47a1' }}>
            {totalEntries.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Total Entries</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#e8f5e9', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#2e7d32' }}>
            {totalIndexedTerms.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Indexed Terms</div>
        </div>
      </div>

      {/* Memory by Type */}
      <div>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          color: '#555', 
          marginBottom: '8px' 
        }}>
          Memory by Type
        </div>
        <div className="memory-grid">
          {sortedTypes.map(([type, data]) => {
            const typeStatus = getMemoryStatus(data.sizeMB);
            return (
              <div className="memory-item" key={type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="memory-type">
                    {getTypeIcon(type)} {getTypeLabel(type)}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    color: typeStatus.color 
                  }}>
                    {typeStatus.status}
                  </span>
                </div>
                <div className="memory-value">{formatSize(data.sizeMB)}</div>
                <div className="memory-detail">{data.entries.toLocaleString()} entries</div>
                {/* Mini progress bar */}
                <div style={{ 
                  marginTop: '4px',
                  height: '4px',
                  background: '#e0e0e0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((data.sizeMB / totalSizeMB) * 100, 100)}%`,
                    backgroundColor: typeStatus.color,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Memory Health Status */}
      <div style={{ 
        marginTop: '12px',
        padding: '10px 14px',
        background: memoryStatus.color === '#4caf50' ? '#e8f5e9' : 
                   memoryStatus.color === '#ff9800' ? '#fff3e0' :
                   memoryStatus.color === '#ff5722' ? '#fbe9e7' : '#ffebee',
        borderRadius: '8px',
        fontSize: '13px',
        color: memoryStatus.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>
          {memoryStatus.status === 'Low' ? '✅' :
           memoryStatus.status === 'Medium' ? '⚠️' :
           memoryStatus.status === 'High' ? '⚡' : '🚨'}
          {' '}
          <strong>Memory Health:</strong> {memoryStatus.status}
        </span>
        <span style={{ fontSize: '12px' }}>
          {memoryStatus.status === 'Low' ? 'Good' :
           memoryStatus.status === 'Medium' ? 'Consider cleaning old entries' :
           memoryStatus.status === 'High' ? 'Cleanup recommended' : 'Immediate cleanup required'}
        </span>
      </div>
    </div>
  );
};

export default MemoryUsage;