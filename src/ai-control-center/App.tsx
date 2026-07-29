// D:\hospital-frontend\src\ai-control-center\App.tsx

import React, { useState, useEffect } from 'react';
import './styles.css';

const API_BASE = 'https://hospital-backend-production-f1b1.up.railway.app';

type TabType = 'dashboard' | 'agents' | 'health';

const App: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/agents`);
      const data = await res.json();
      setAgents(data.agents || []);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch agents: ' + err.message);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/health`);
      const data = await res.json();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch health: ' + err.message);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchAgents(), fetchHealth()]);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="ai-control-center">
        <div className="loading">🔄 Loading AI Control Center...</div>
      </div>
    );
  }

  return (
    <div className="ai-control-center">
      <header className="ai-header">
        <h1>🤖 HospitalHub AI Control Center</h1>
        <div className="connection-status">
          <span className={`status-dot ${error ? 'red' : 'green'}`}></span>
          {error ? '⚠️ Error' : '✅ Connected'} to Railway
        </div>
      </header>

      <nav className="ai-tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>🤖 Agents ({agents.length})</button>
        <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}>🩺 Health</button>
      </nav>

      {error && <div className="error-banner">{error}</div>}

      {activeTab === 'dashboard' && (
        <div className="dashboard-grid">
          <div className="card">
            <h3>🤖 Active Agents</h3>
            <div className="big-number">{agents.length}</div>
          </div>
          <div className="card">
            <h3>🩺 System Status</h3>
            <div className="big-number">{health?.status || 'Unknown'}</div>
          </div>
          <div className="card">
            <h3>📋 API Base</h3>
            <div className="small-text">{API_BASE}</div>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="agents-grid">
          {agents.map((agent: any) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <span className={`agent-status ${agent.status === 'online' ? 'online' : 'offline'}`}></span>
                <h4>{agent.name}</h4>
              </div>
              <p className="agent-role">Role: {agent.role}</p>
              <p className="agent-capabilities">
                Capabilities: {agent.capabilities?.map((c: any) => c.name).join(', ') || 'None'}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'health' && health && (
        <div className="health-panel">
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;