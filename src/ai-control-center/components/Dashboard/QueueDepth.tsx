// D:\hospital-frontend\src\ai-control-center\components\Dashboard\QueueDepth.tsx

import React from 'react';

interface QueueData {
  queueName?: string;
  depth?: number;
  processingPerMinute?: number;
  delayed?: number;
  failed?: number;
  deadLetter?: number;
}

interface QueueDepthProps {
  data: {
    agents?: Record<string, {
      queues?: QueueData[];
    }>;
  } | null;
}

const QueueDepth: React.FC<QueueDepthProps> = ({ data }) => {
  if (!data || !data.agents) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading queue data...</p>
      </div>
    );
  }

  // Extract all queues from all agents
  const allQueues: QueueData[] = [];
  Object.values(data.agents).forEach((agent: any) => {
    if (agent.queues && Array.isArray(agent.queues)) {
      agent.queues.forEach((q: QueueData) => {
        allQueues.push({
          ...q,
          queueName: q.queueName || 'unknown'
        });
      });
    }
  });

  // If no queues found, show empty state
  if (allQueues.length === 0) {
    return (
      <div className="queue-depth">
        <div className="section-header">
          <h3>📊 Queue Depth</h3>
          <span className="badge">0 Queues</span>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">No queue data available</div>
        </div>
      </div>
    );
  }

  // Sort queues by depth (highest first)
  const sortedQueues = [...allQueues].sort((a, b) => (b.depth || 0) - (a.depth || 0));

  // Calculate total statistics
  const totalDepth = sortedQueues.reduce((sum, q) => sum + (q.depth || 0), 0);
  const totalProcessing = sortedQueues.reduce((sum, q) => sum + (q.processingPerMinute || 0), 0);
  const totalFailed = sortedQueues.reduce((sum, q) => sum + (q.failed || 0), 0);
  const totalDelayed = sortedQueues.reduce((sum, q) => sum + (q.delayed || 0), 0);
  const totalDeadLetter = sortedQueues.reduce((sum, q) => sum + (q.deadLetter || 0), 0);

  // Get queue depth status
  const getQueueStatus = (depth: number = 0): 'low' | 'medium' | 'high' => {
    if (depth === 0) return 'low';
    if (depth < 50) return 'low';
    if (depth < 200) return 'medium';
    return 'high';
  };

  // Get queue depth label
  const getDepthLabel = (depth: number = 0): string => {
    if (depth === 0) return 'Empty';
    if (depth < 50) return 'Low';
    if (depth < 200) return 'Medium';
    return 'High';
  };

  // Format queue name
  const formatQueueName = (name: string = ''): string => {
    return name
      .replace(/-queue$/i, '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="queue-depth">
      <div className="section-header">
        <h3>📊 Queue Depth</h3>
        <span className="badge">{sortedQueues.length} Queues</span>
      </div>

      {/* Queue Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
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
            {totalDepth}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Total Waiting</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#e3f2fd', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#0d47a1' }}>
            {totalProcessing}/min
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Processing</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#fff3e0', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#e65100' }}>
            {totalFailed}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Failed</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#ffebee', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#c62828' }}>
            {totalDeadLetter}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Dead Letter</div>
        </div>
      </div>

      {/* Queue List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {sortedQueues.map((queue, index) => {
          const depth = queue.depth || 0;
          const status = getQueueStatus(depth);
          
          return (
            <div className="queue-item" key={index}>
              <span className="queue-name">
                {formatQueueName(queue.queueName)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {queue.processingPerMinute !== undefined && queue.processingPerMinute > 0 && (
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    ⚡ {queue.processingPerMinute}/min
                  </span>
                )}
                {queue.failed !== undefined && queue.failed > 0 && (
                  <span style={{ fontSize: '12px', color: '#f44336' }}>
                    ❌ {queue.failed}
                  </span>
                )}
                {queue.delayed !== undefined && queue.delayed > 0 && (
                  <span style={{ fontSize: '12px', color: '#ff9800' }}>
                    ⏳ {queue.delayed}
                  </span>
                )}
                <span className={`queue-depth ${status}`}>
                  {depth}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dead Letter Queue Warning */}
      {totalDeadLetter > 0 && (
        <div style={{ 
          marginTop: '12px', 
          padding: '10px 14px', 
          background: '#ffebee', 
          borderRadius: '8px', 
          fontSize: '13px',
          color: '#c62828',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ <strong>{totalDeadLetter}</strong> jobs in Dead Letter Queue. 
          <a href="#" style={{ color: '#c62828', fontWeight: '600' }}>View Details →</a>
        </div>
      )}

      {/* High Queue Warning */}
      {sortedQueues.some(q => getQueueStatus(q.depth || 0) === 'high') && (
        <div style={{ 
          marginTop: '8px', 
          padding: '8px 14px', 
          background: '#fff3e0', 
          borderRadius: '8px', 
          fontSize: '12px',
          color: '#e65100',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Some queues have high depth. Consider scaling up workers.
        </div>
      )}
    </div>
  );
};

export default QueueDepth;