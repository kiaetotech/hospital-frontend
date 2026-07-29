// D:\hospital-frontend\src\ai-control-center\components\Dashboard\LiveAgents.tsx

import React from 'react';

interface AgentData {
  id: string;
  name?: string;
  role?: string;
  status?: string;
  currentTask?: string;
  health?: {
    status: string;
    responseTime: number;
  };
  cost?: {
    costInr: number;
  };
}

interface LiveAgentsProps {
  data: {
    agents?: Record<string, AgentData>;
    activeAgentsCount?: number;
  } | null;
}

const LiveAgents: React.FC<LiveAgentsProps> = ({ data }) => {
  if (!data || !data.agents) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading agents...</p>
      </div>
    );
  }

  const agents = data.agents;
  const agentList = Object.values(agents);
  const activeCount = data.activeAgentsCount || agentList.length;

  // Status color mapping
  const getStatusColor = (status: string = 'idle'): string => {
    const colors: Record<string, string> = {
      'online': '#4caf50',
      'busy': '#ff9800',
      'idle': '#2196f3',
      'degraded': '#ff5722',
      'offline': '#f44336',
      'stopped': '#9e9e9e'
    };
    return colors[status] || '#9e9e9e';
  };

  // Status emoji mapping
  const getStatusEmoji = (status: string = 'idle'): string => {
    const emojis: Record<string, string> = {
      'online': '🟢',
      'busy': '🟡',
      'idle': '🔵',
      'degraded': '🟠',
      'offline': '🔴',
      'stopped': '⚫'
    };
    return emojis[status] || '⚪';
  };

  // Role icon mapping
  const getRoleIcon = (role: string = ''): string => {
    const icons: Record<string, string> = {
      'hospital': '🏥',
      'doctor': '👨‍⚕️',
      'diagnostics': '🔬',
      'ambulance': '🚑',
      'insurance': '📋',
      'pharmacy': '💊',
      'caregiver': '👩‍⚕️',
      'wellness': '🧘',
      'finance': '💰',
      'crm': '🤝',
      'marketing': '📢',
      'support': '💬',
      'analytics': '📊',
      'search_intelligence': '🔍',
      'recommendation': '🎯',
      'workflow': '⚙️',
      'memory': '🧠',
      'notification': '🔔',
      'ceo': '👔',
      'strategy': '📈',
      'corporate': '🏢'
    };
    return icons[role] || '🤖';
  };

  // Get status label
  const getStatusLabel = (status: string = 'idle'): string => {
    const labels: Record<string, string> = {
      'online': 'Online',
      'busy': 'Busy',
      'idle': 'Idle',
      'degraded': 'Degraded',
      'offline': 'Offline',
      'stopped': 'Stopped'
    };
    return labels[status] || status;
  };

  // Format role name
  const formatRole = (role: string = ''): string => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="live-agents">
      <div className="section-header">
        <h3>🤖 Live Agents</h3>
        <span className="badge">{activeCount} Active</span>
      </div>

      <div className="agent-grid">
        {agentList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🤖</div>
            <div className="empty-text">No agents available</div>
          </div>
        ) : (
          agentList.map((agent, index) => {
            const status = agent.status || 'idle';
            const statusColor = getStatusColor(status);
            
            return (
              <div 
                key={agent.id || index} 
                className={`agent-card status-${status}`}
                style={{ borderLeftColor: statusColor }}
              >
                <div className="agent-header">
                  <span className="agent-name">
                    {getRoleIcon(agent.role)} {agent.name || agent.role || 'Unknown Agent'}
                  </span>
                  <span className="agent-status" title={getStatusLabel(status)}>
                    {getStatusEmoji(status)}
                  </span>
                </div>
                
                <div className="agent-role">
                  {agent.role ? formatRole(agent.role) : 'Unknown'}
                </div>
                
                <div className="agent-details">
                  <span>
                    ⏱️ {agent.health?.responseTime || 0}ms
                  </span>
                  <span>
                    💰 ₹{agent.cost?.costInr?.toFixed(2) || '0'}
                  </span>
                </div>
                
                {agent.currentTask && (
                  <div className="agent-task" title={agent.currentTask}>
                    📋 {agent.currentTask}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LiveAgents;