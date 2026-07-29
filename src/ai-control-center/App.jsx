// D:\hospital-frontend\src\ai-control-center\App.jsx

import React, { useState, useEffect } from 'react';
import './styles.css';

const API_BASE = 'https://hospital-backend-production-f1b1.up.railway.app';

const AGENT_CATEGORIES = {
  'Business': ['hospital', 'doctor', 'diagnostics', 'ambulance', 'insurance', 'caregiver', 'wellness'],
  'Operations': ['finance', 'crm', 'marketing', 'support', 'analytics', 'corporate'],
  'Intelligence': ['search_intelligence', 'recommendation', 'workflow', 'memory', 'notification'],
  'Executive': ['ceo', 'strategy']
};

const CATEGORY_ICONS = {
  'Business': '🏥',
  'Operations': '⚙️',
  'Intelligence': '🧠',
  'Executive': '👔'
};

const App = () => {
  const [agents, setAgents] = useState([]);
  const [health, setHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/agents`);
      const data = await res.json();
      setAgents(data.agents || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents: ' + err.message);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/health`);
      const data = await res.json();
      setHealth(data);
      setError(null);
    } catch (err) {
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
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const getAgentCategory = (role) => {
    for (const [category, roles] of Object.entries(AGENT_CATEGORIES)) {
      if (roles.includes(role)) return category;
    }
    return 'Other';
  };

  const getAgentsByCategory = () => {
    const grouped = {};
    for (const category of Object.keys(AGENT_CATEGORIES)) {
      grouped[category] = agents.filter(a => AGENT_CATEGORIES[category].includes(a.role));
    }
    return grouped;
  };

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
            <div className="big-number">{health?.status || 'Running'}</div>
          </div>
          <div className="card">
            <h3>📋 API Base</h3>
            <div className="small-text">{API_BASE}</div>
          </div>
          {Object.entries(getAgentsByCategory()).map(([category, categoryAgents]) => (
            <div className="card" key={category}>
              <h3>{CATEGORY_ICONS[category]} {category}</h3>
              <div className="big-number">{categoryAgents.length}</div>
              <div className="small-text">agents</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'agents' && (
        <div>
          {Object.entries(getAgentsByCategory()).map(([category, categoryAgents]) => (
            <div key={category} className="category-section">
              <h2 className="category-title">{CATEGORY_ICONS[category]} {category} Layer ({categoryAgents.length} agents)</h2>
              <div className="agents-grid">
                {categoryAgents.map((agent) => (
                  <div key={agent.id} className="agent-card" onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}>
                    <div className="agent-header">
                      <span className={`agent-status ${agent.status === 'idle' ? 'online' : 'offline'}`}></span>
                      <h4>{agent.name}</h4>
                    </div>
                    <p className="agent-role">Role: <strong>{agent.role}</strong></p>
                    {selectedAgent?.id === agent.id && (
                      <div className="agent-capabilities">
                        <strong>Capabilities:</strong>
                        <ul>
                          {agent.capabilities.map((cap) => (
                            <li key={cap}>{cap.replace(/_/g, ' ')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="agent-hint">Click to {selectedAgent?.id === agent.id ? 'hide' : 'view'} capabilities</p>
                  </div>
                ))}
              </div>
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