// D:\hospital-frontend\src\ai-control-center\App.jsx

import React, { useState, useEffect } from 'react';
import './styles.css';

const API_BASE = 'https://hospital-backend-production-f1b1.up.railway.app';

const ORG_STRUCTURE = {
  '🧠 CAIO "Athena"': {
    level: 0,
    agents: ['CEOAgent', 'StrategyAgent'],
    codeName: 'Athena + Oracle',
    role: 'Chief AI Officer + Chief Strategy Officer',
    reportsTo: 'Human CEO',
    color: '#ffd700'
  },
  '📢 CMO "BrandPilot"': {
    level: 1,
    agents: ['MarketingAgent'],
    codeName: 'BrandPilot',
    role: 'Chief Marketing Officer',
    reportsTo: 'CAIO Athena',
    color: '#ff6b6b',
    team: ['Content Generator', 'Campaign Manager', 'SEO Optimizer']
  },
  '💰 CFO "MoneyGuard"': {
    level: 1,
    agents: ['FinanceAgent', 'InsuranceAgent', 'CorporateHealthAgent'],
    codeName: 'MoneyGuard',
    role: 'Chief Financial Officer',
    reportsTo: 'CAIO Athena',
    color: '#4ecdc4',
    team: ['EMI Calculator', 'Loan Advisor', 'Insurance Desk', 'Corporate Accounts']
  },
  '🏗️ COO "OpsMaster"': {
    level: 1,
    agents: ['WorkflowAgent', 'HospitalAgent', 'DoctorAgent', 'DiagnosticsAgent', 'AmbulanceAgent', 'CaregiverAgent', 'WellnessAgent'],
    codeName: 'OpsMaster',
    role: 'Chief Operations Officer',
    reportsTo: 'CAIO Athena',
    color: '#45b7d1',
    team: ['MedSeek', 'DocFind', 'LabSmart', 'RescueAI', 'CareCom', 'HealWise']
  },
  '💻 CTO "TechBrain"': {
    level: 1,
    agents: ['SearchIntelligenceAgent', 'RecommendationAgent'],
    codeName: 'TechBrain',
    role: 'Chief Technology Officer',
    reportsTo: 'CAIO Athena',
    color: '#96ceb4',
    team: ['Search Engine', 'Recommendation Engine', 'Autocomplete']
  },
  '📊 CSO "DataSage"': {
    level: 1,
    agents: ['AnalyticsAgent'],
    codeName: 'DataSage',
    role: 'Chief Strategy Officer',
    reportsTo: 'CAIO Athena',
    color: '#ffeaa7',
    team: ['KPI Dashboard', 'Report Generator', 'Trend Predictor']
  },
  '🤝 CCO "TrustKeeper"': {
    level: 1,
    agents: ['CRMAgent', 'SupportAgent', 'NotificationAgent', 'MemoryAgent'],
    codeName: 'TrustKeeper',
    role: 'Chief Customer Officer',
    reportsTo: 'CAIO Athena',
    color: '#dfe6e9',
    team: ['HelpBot', 'NotifyMe', 'RecallAI', 'Lead Qualifier']
  }
};

const AGENT_CODENAMES = {
  'CEOAgent': { name: 'Athena', emoji: '🧠', role: 'Chief AI Officer', dept: 'Executive' },
  'StrategyAgent': { name: 'Oracle', emoji: '🔮', role: 'Chief Strategy Officer', dept: 'Executive' },
  'MarketingAgent': { name: 'BrandPilot', emoji: '📢', role: 'CMO - Marketing', dept: 'Marketing' },
  'FinanceAgent': { name: 'MoneyGuard', emoji: '💰', role: 'CFO - Finance', dept: 'Finance' },
  'InsuranceAgent': { name: 'PolicyPro', emoji: '🛡️', role: 'Insurance Director', dept: 'Finance' },
  'CorporateHealthAgent': { name: 'BizHealth', emoji: '🏢', role: 'Corporate Accounts Director', dept: 'Finance' },
  'WorkflowAgent': { name: 'OpsMaster', emoji: '🏗️', role: 'COO - Operations', dept: 'Operations' },
  'HospitalAgent': { name: 'MedSeek', emoji: '🏥', role: 'Hospital Operations', dept: 'Operations' },
  'DoctorAgent': { name: 'DocFind', emoji: '👨‍⚕️', role: 'Medical Operations', dept: 'Operations' },
  'DiagnosticsAgent': { name: 'LabSmart', emoji: '🔬', role: 'Lab Operations', dept: 'Operations' },
  'AmbulanceAgent': { name: 'RescueAI', emoji: '🚑', role: 'Emergency Operations', dept: 'Operations' },
  'CaregiverAgent': { name: 'CareCom', emoji: '🏠', role: 'Home Care Operations', dept: 'Operations' },
  'WellnessAgent': { name: 'HealWise', emoji: '🧘', role: 'Wellness Operations', dept: 'Operations' },
  'SearchIntelligenceAgent': { name: 'TechBrain', emoji: '💻', role: 'CTO - Technology', dept: 'Technology' },
  'RecommendationAgent': { name: 'SuggestAI', emoji: '🎯', role: 'Personalization Lead', dept: 'Technology' },
  'AnalyticsAgent': { name: 'DataSage', emoji: '📊', role: 'CSO - Analytics', dept: 'Analytics' },
  'CRMAgent': { name: 'TrustKeeper', emoji: '🤝', role: 'CCO - Customer Relations', dept: 'Customer Relations' },
  'SupportAgent': { name: 'HelpBot', emoji: '🎫', role: 'Support Manager', dept: 'Customer Relations' },
  'NotificationAgent': { name: 'NotifyMe', emoji: '🔔', role: 'Communications Manager', dept: 'Customer Relations' },
  'MemoryAgent': { name: 'RecallAI', emoji: '🧠', role: 'Data Manager', dept: 'Customer Relations' }
};

const App = () => {
  const [agents, setAgents] = useState([]);
  const [health, setHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('org-chart');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [expandedDepts, setExpandedDepts] = useState({});

  const fetchData = async () => {
    try {
      const [agentsRes, healthRes] = await Promise.all([
        fetch(`${API_BASE}/api/ai/agents`),
        fetch(`${API_BASE}/api/ai/health`)
      ]);
      const agentsData = await agentsRes.json();
      const healthData = await healthRes.json();
      setAgents(agentsData.agents || []);
      setHealth(healthData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch: ' + err.message);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAgent = (agentName) => agents.find(a => a.name === agentName);
  const isOnline = (agent) => agent && (agent.status === 'idle' || agent.status === 'online');
  const onlineCount = agents.filter(a => isOnline(a)).length;

  const toggleDept = (dept) => {
    setExpandedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  if (loading) {
    return (
      <div className="ai-control-center">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading AI Organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-control-center">
      {/* HEADER */}
      <header className="ai-header">
        <div className="header-left">
          <h1>🤖 HospitalHub AI Organization</h1>
          <span className="subtitle">20 Agents · 7 Departments · 1 Mission</span>
        </div>
        <div className="header-right">
          <div className="status-badge">
            <span className={`status-dot ${error ? 'red' : 'green'}`}></span>
            {error ? '⚠️ Error' : `${onlineCount}/${agents.length} Online`}
          </div>
          <button className="refresh-btn" onClick={fetchData}>🔄 Refresh</button>
        </div>
      </header>

      {/* TABS */}
      <nav className="ai-tabs">
        <button className={activeTab === 'org-chart' ? 'active' : ''} onClick={() => setActiveTab('org-chart')}>🏢 Org Chart</button>
        <button className={activeTab === 'list' ? 'active' : ''} onClick={() => setActiveTab('list')}>📋 Agent List</button>
        <button className={activeTab === 'departments' ? 'active' : ''} onClick={() => setActiveTab('departments')}>📊 Departments</button>
        <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}>🩺 System</button>
      </nav>

      {error && <div className="error-banner">{error}</div>}

      {/* ORG CHART VIEW */}
      {activeTab === 'org-chart' && (
        <div className="org-chart">
          {/* CAIO - TOP LEVEL */}
          <div className="org-level ceo-level">
            <div className="org-node ceo-node">
              <div className="node-emoji">🧠</div>
              <div className="node-title">CAIO "Athena"</div>
              <div className="node-subtitle">Chief AI Officer</div>
              <div className="node-agents">
                {['CEOAgent', 'StrategyAgent'].map(name => {
                  const agent = getAgent(name);
                  return (
                    <span key={name} className={`node-agent ${isOnline(agent) ? 'online' : 'offline'}`}>
                      {AGENT_CODENAMES[name]?.emoji} {AGENT_CODENAMES[name]?.name}
                    </span>
                  );
                })}
              </div>
              <div className="node-reports">Reports to: Human CEO</div>
            </div>
          </div>

          {/* CONNECTOR LINE */}
          <div className="connector-vertical"></div>

          {/* DEPARTMENT HEADS - LEVEL 2 */}
          <div className="org-level dept-level">
            {Object.entries(ORG_STRUCTURE).filter(([key]) => ORG_STRUCTURE[key].level === 1).map(([deptName, dept]) => (
              <div key={deptName} className="org-node dept-node" style={{ borderColor: dept.color }}>
                <div className="node-emoji">{deptName.split(' ')[0]}</div>
                <div className="node-title">{deptName.split('"')[1] ? deptName.split('"')[1] : deptName}</div>
                <div className="node-subtitle">{dept.role}</div>
                <div className="node-agents">
                  {dept.agents.map(name => {
                    const agent = getAgent(name);
                    const cn = AGENT_CODENAMES[name];
                    return (
                      <span key={name} className={`node-agent small ${isOnline(agent) ? 'online' : 'offline'}`}>
                        {cn?.emoji} {cn?.name}
                      </span>
                    );
                  })}
                </div>
                <div className="node-team">
                  Team: {dept.team?.join(', ') || dept.agents.length + ' agents'}
                </div>
              </div>
            ))}
          </div>

          {/* LEGEND */}
          <div className="org-legend">
            <div className="legend-item"><span className="dot green"></span> Online</div>
            <div className="legend-item"><span className="dot gray"></span> Offline</div>
            <div className="legend-item">🏢 Department Head</div>
            <div className="legend-item">👤 Specialist Agent</div>
          </div>
        </div>
      )}

      {/* AGENT LIST VIEW */}
      {activeTab === 'list' && (
        <div className="agent-list">
          {Object.entries(ORG_STRUCTURE).map(([deptName, dept]) => (
            <div key={deptName} className="dept-group" style={{ borderLeft: `4px solid ${dept.color}` }}>
              <div className="dept-header" onClick={() => toggleDept(deptName)}>
                <h3>{deptName}</h3>
                <span className="dept-meta">{dept.role} · Reports to: {dept.reportsTo}</span>
                <span className="expand-icon">{expandedDepts[deptName] ? '▲' : '▼'}</span>
              </div>
              {expandedDepts[deptName] && (
                <div className="dept-agents">
                  {dept.agents.map(name => {
                    const agent = getAgent(name);
                    const cn = AGENT_CODENAMES[name];
                    return (
                      <div key={name} className={`agent-list-item ${isOnline(agent) ? 'online' : 'offline'}`}>
                        <span className="agent-emoji">{cn?.emoji}</span>
                        <div className="agent-info">
                          <strong>{cn?.name}</strong> <span className="agent-class">({name})</span>
                          <div className="agent-meta">{cn?.role} · {cn?.dept}</div>
                          <div className="agent-capabilities">
                            {agent?.capabilities?.map(c => (
                              <code key={c}>{c.replace(/_/g, ' ')}</code>
                            ))}
                          </div>
                        </div>
                        <span className={`status-indicator ${isOnline(agent) ? 'green' : 'gray'}`}></span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DEPARTMENTS VIEW */}
      {activeTab === 'departments' && (
        <div className="departments-view">
          <div className="dept-summary-grid">
            {Object.entries(ORG_STRUCTURE).map(([deptName, dept]) => {
              const onlineCount = dept.agents.filter(name => isOnline(getAgent(name))).length;
              return (
                <div key={deptName} className="dept-card" style={{ borderTop: `4px solid ${dept.color}` }}>
                  <div className="dept-card-header">
                    <span className="dept-icon">{deptName.split(' ')[0]}</span>
                    <div>
                      <h4>{deptName.split('"')[1] || deptName}</h4>
                      <p>{dept.role}</p>
                    </div>
                  </div>
                  <div className="dept-stats">
                    <div className="stat">
                      <span className="stat-value">{dept.agents.length}</span>
                      <span className="stat-label">Agents</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value green">{onlineCount}</span>
                      <span className="stat-label">Online</span>
                    </div>
                  </div>
                  <div className="dept-reports">
                    <small>Reports to: {dept.reportsTo}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HEALTH VIEW */}
      {activeTab === 'health' && health && (
        <div className="health-panel">
          <div className="health-stats">
            <div className="health-card">
              <h4>System Status</h4>
              <div className="big-number">{health?.status || 'Running'}</div>
            </div>
            <div className="health-card">
              <h4>Agents Online</h4>
              <div className="big-number green">{onlineCount}/{agents.length}</div>
            </div>
          </div>
          <pre>{JSON.stringify(health, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default App;