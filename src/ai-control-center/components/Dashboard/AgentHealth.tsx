// D:\hospital-frontend\src\ai-control-center\components\Dashboard\AgentHealth.tsx

import React from 'react';

interface HealthData {
  agentId?: string;
  status?: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  errorRate?: number;
  uptime?: number;
  details?: Record<string, any>;
}

interface AgentHealthData {
  id?: string;
  name?: string;
  health?: HealthData;
  status?: string;
}

interface AgentHealthProps {
  data: {
    agents?: Record<string, AgentHealthData>;
    systemHealth?: {
      mongodb: 'healthy' | 'degraded' | 'unhealthy';
      redis: 'healthy' | 'degraded' | 'unhealthy';
      providers: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    };
  } | null;
}

const AgentHealth: React.FC<AgentHealthProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading health data...</p>
      </div>
    );
  }

  // Get system health status
  const systemHealth = data.systemHealth || {
    mongodb: 'healthy',
    redis: 'healthy',
    providers: {}
  };

  // Get agent health statuses
  const agentHealthStatuses: Record<string, string> = {};
  if (data.agents) {
    Object.values(data.agents).forEach((agent: AgentHealthData) => {
      if (agent.id && agent.health) {
        agentHealthStatuses[agent.id] = agent.health.status || 'unknown';
      }
    });
  }

  // Get health dot color
  const getHealthDotColor = (status: string = 'unknown'): string => {
    const colors: Record<string, string> = {
      'healthy': '#4caf50',
      'degraded': '#ff9800',
      'unhealthy': '#f44336',
      'unknown': '#9e9e9e'
    };
    return colors[status] || '#9e9e9e';
  };

  // Get health label
  const getHealthLabel = (status: string = 'unknown'): string => {
    const labels: Record<string, string> = {
      'healthy': 'Healthy',
      'degraded': 'Degraded',
      'unhealthy': 'Unhealthy',
      'unknown': 'Unknown'
    };
    return labels[status] || status;
  };

  // Get overall health status
  const getOverallHealth = (): 'healthy' | 'degraded' | 'unhealthy' => {
    const healthValues = Object.values(agentHealthStatuses);
    
    if (healthValues.some(s => s === 'unhealthy')) {
      return 'unhealthy';
    }
    if (healthValues.some(s => s === 'degraded')) {
      return 'degraded';
    }
    return 'healthy';
  };

  // Get health count
  const getHealthCount = (status: string): number => {
    return Object.values(agentHealthStatuses).filter(s => s === status).length;
  };

  const overallHealth = getOverallHealth();
  const totalAgents = Object.keys(agentHealthStatuses).length;
  const healthyCount = getHealthCount('healthy');
  const degradedCount = getHealthCount('degraded');
  const unhealthyCount = getHealthCount('unhealthy');

  return (
    <div className="agent-health">
      <div className="section-header">
        <h3>🩺 Health Monitor</h3>
        <span className={`badge ${overallHealth === 'healthy' ? 'active' : overallHealth === 'degraded' ? 'warning' : 'critical'}`}>
          {getHealthLabel(overallHealth)}
        </span>
      </div>

      {/* Overall Health Summary */}
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
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a237e' }}>
            {totalAgents}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Total Agents</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#e8f5e9', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#2e7d32' }}>
            {healthyCount}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Healthy</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#fff3e0', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#e65100' }}>
            {degradedCount}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Degraded</div>
        </div>
        <div style={{ 
          padding: '8px 12px', 
          background: '#ffebee', 
          borderRadius: '8px', 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#c62828' }}>
            {unhealthyCount}
          </div>
          <div style={{ fontSize: '11px', color: '#888' }}>Unhealthy</div>
        </div>
      </div>

      {/* System Health */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
          System Services
        </div>
        <div className="health-grid">
          <div className="health-item">
            <span 
              className={`health-dot ${systemHealth.mongodb || 'healthy'}`}
              style={{ backgroundColor: getHealthDotColor(systemHealth.mongodb || 'healthy') }}
            />
            <span className="health-name">MongoDB</span>
            <span className="health-status" style={{ color: getHealthDotColor(systemHealth.mongodb || 'healthy') }}>
              {getHealthLabel(systemHealth.mongodb || 'healthy')}
            </span>
          </div>
          <div className="health-item">
            <span 
              className={`health-dot ${systemHealth.redis || 'healthy'}`}
              style={{ backgroundColor: getHealthDotColor(systemHealth.redis || 'healthy') }}
            />
            <span className="health-name">Redis</span>
            <span className="health-status" style={{ color: getHealthDotColor(systemHealth.redis || 'healthy') }}>
              {getHealthLabel(systemHealth.redis || 'healthy')}
            </span>
          </div>
          {systemHealth.providers && Object.entries(systemHealth.providers).map(([name, status]) => (
            <div className="health-item" key={name}>
              <span 
                className={`health-dot ${status}`}
                style={{ backgroundColor: getHealthDotColor(status) }}
              />
              <span className="health-name" style={{ textTransform: 'capitalize' }}>{name}</span>
              <span className="health-status" style={{ color: getHealthDotColor(status) }}>
                {getHealthLabel(status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Health Status */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px' }}>
          Agent Health
        </div>
        <div className="health-grid">
          {Object.entries(agentHealthStatuses).map(([agentId, status]) => {
            const agentName = data.agents?.[agentId]?.name || agentId;
            return (
              <div className="health-item" key={agentId}>
                <span 
                  className={`health-dot ${status}`}
                  style={{ backgroundColor: getHealthDotColor(status) }}
                />
                <span className="health-name">{agentName}</span>
                <span className="health-status" style={{ color: getHealthDotColor(status) }}>
                  {getHealthLabel(status)}
                </span>
              </div>
            );
          })}
          {Object.keys(agentHealthStatuses).length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-text">No agent health data available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentHealth;