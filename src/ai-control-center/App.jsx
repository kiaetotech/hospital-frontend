// D:\hospital-frontend\src\ai-control-center\App.jsx

import React, { useState, useEffect } from 'react';
import './styles.css';

const API_BASE = 'https://hospital-backend-production-f1b1.up.railway.app';

const App = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ai/agents`);
      const data = await res.json();
      setAgents(data.agents || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch: ' + err.message);
    }
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 30000); return () => clearInterval(interval); }, []);

  const getAgent = (name) => agents.find(a => a.name === name);
  const ok = (a) => a && (a.status === 'idle' || a.status === 'online');
  const onlineCount = agents.filter(a => ok(a)).length;

  if (loading) return <div className="loading"><div className="spinner"></div>Loading Organization...</div>;

  return (
    <div className="org-container">
      <header className="org-header">
        <h1>🏢 HospitalHub AI Organization</h1>
        <span className="online-count">{onlineCount}/{agents.length} Online</span>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="org-tree">
        {/* ============ LEVEL 0: CAIO ============ */}
        <div className="tree-level">
          <AgentCard agent={getAgent('CEOAgent')} codeName="Athena" emoji="🧠" role="Chief AI Officer" color="#ffd700" isCEO />
        </div>

        <Connector width={7} />

        {/* ============ LEVEL 1: C-SUITE ============ */}
        <div className="tree-level seven-col">
          <AgentCard agent={getAgent('StrategyAgent')} codeName="Oracle" emoji="🔮" role="CSO" reportsTo="Athena" color="#a78bfa" />
          <AgentCard agent={getAgent('MarketingAgent')} codeName="BrandPilot" emoji="📢" role="CMO" reportsTo="Athena" color="#f87171" />
          <AgentCard agent={getAgent('FinanceAgent')} codeName="MoneyGuard" emoji="💰" role="CFO" reportsTo="Athena" color="#4ade80" />
          <AgentCard agent={getAgent('WorkflowAgent')} codeName="OpsMaster" emoji="⚙️" role="COO" reportsTo="Athena" color="#60a5fa" />
          <AgentCard agent={getAgent('SearchIntelligenceAgent')} codeName="TechBrain" emoji="💻" role="CTO" reportsTo="Athena" color="#c084fc" />
          <AgentCard agent={getAgent('AnalyticsAgent')} codeName="DataSage" emoji="📊" role="CSO" reportsTo="Athena" color="#fbbf24" />
          <AgentCard agent={getAgent('CRMAgent')} codeName="TrustKeeper" emoji="🤝" role="CCO" reportsTo="Athena" color="#94a3b8" />
        </div>

        <Connector width={7} />

        {/* ============ LEVEL 2: DIRECTORS & MANAGERS ============ */}
        <div className="tree-level seven-col">
          {/* Under CFO MoneyGuard */}
          <AgentCard agent={getAgent('InsuranceAgent')} codeName="PolicyPro" emoji="🛡️" role="Insurance Dir" reportsTo="MoneyGuard" color="#34d399" small />
          <AgentCard agent={getAgent('CorporateHealthAgent')} codeName="BizHealth" emoji="🏢" role="Corporate Dir" reportsTo="MoneyGuard" color="#34d399" small />
          
          {/* Under CTO TechBrain */}
          <AgentCard agent={getAgent('RecommendationAgent')} codeName="SuggestAI" emoji="🎯" role="Personalization Lead" reportsTo="TechBrain" color="#c084fc" small />
          
          {/* Under CCO TrustKeeper */}
          <AgentCard agent={getAgent('SupportAgent')} codeName="HelpBot" emoji="🎫" role="Support Mgr" reportsTo="TrustKeeper" color="#94a3b8" small />
          <AgentCard agent={getAgent('NotificationAgent')} codeName="NotifyMe" emoji="🔔" role="Comms Mgr" reportsTo="TrustKeeper" color="#94a3b8" small />
          <AgentCard agent={getAgent('MemoryAgent')} codeName="RecallAI" emoji="🧠" role="Data Mgr" reportsTo="TrustKeeper" color="#94a3b8" small />
          
          <div className="empty-slot"></div>
        </div>

        <Connector width={7} />

        {/* ============ LEVEL 3: FIELD OPERATIONS (Under COO) ============ */}
        <div className="tree-section-title">📋 Field Operations — Report to COO "OpsMaster"</div>
        <div className="tree-level six-col">
          <AgentCard agent={getAgent('HospitalAgent')} codeName="MedSeek" emoji="🏥" role="Hospital Ops" reportsTo="OpsMaster" color="#60a5fa" />
          <AgentCard agent={getAgent('DoctorAgent')} codeName="DocFind" emoji="👨‍⚕️" role="Doctor Ops" reportsTo="OpsMaster" color="#60a5fa" />
          <AgentCard agent={getAgent('DiagnosticsAgent')} codeName="LabSmart" emoji="🔬" role="Lab Ops" reportsTo="OpsMaster" color="#60a5fa" />
          <AgentCard agent={getAgent('AmbulanceAgent')} codeName="RescueAI" emoji="🚑" role="Emergency Ops" reportsTo="OpsMaster" color="#60a5fa" />
          <AgentCard agent={getAgent('CaregiverAgent')} codeName="CareCom" emoji="🏠" role="Home Care Ops" reportsTo="OpsMaster" color="#60a5fa" />
          <AgentCard agent={getAgent('WellnessAgent')} codeName="HealWise" emoji="🧘" role="Wellness Ops" reportsTo="OpsMaster" color="#60a5fa" />
        </div>
      </div>

      <div className="summary-bar">
        <span>🏢 7 Departments</span>
        <span>👔 8 C-Suite</span>
        <span>👤 6 Directors</span>
        <span>🏥 6 Field Agents</span>
        <span>📊 20 Total Agents</span>
      </div>
    </div>
  );
};

/* Agent Card Component */
const AgentCard = ({ agent, codeName, emoji, role, reportsTo, color, isCEO, small }) => {
  const isOnline = agent && (agent.status === 'idle' || agent.status === 'online');
  return (
    <div className={`agent-card ${isCEO ? 'ceo' : ''} ${small ? 'small' : ''} ${isOnline ? 'online' : 'offline'}`} style={{ borderColor: color }}>
      <div className="card-emoji">{emoji}</div>
      <div className="card-name">{codeName}</div>
      <div className="card-role">{role}</div>
      {reportsTo && <div className="card-reports">Reports to: {reportsTo}</div>}
      <div className="card-status">
        <span className={`dot ${isOnline ? 'green' : 'gray'}`}></span>
        {agent?.name || codeName}
      </div>
      {agent?.capabilities && (
        <div className="card-caps">
          {agent.capabilities.slice(0, 3).map(c => (
            <code key={c}>{c.replace(/_/g, ' ')}</code>
          ))}
        </div>
      )}
    </div>
  );
};

/* Connector Line */
const Connector = ({ width }) => (
  <div className="connector-row">
    {Array.from({ length: width }).map((_, i) => (
      <div key={i} className="connector-col">
        <div className="connector-down"></div>
        {i < width - 1 && <div className="connector-horizontal"></div>}
      </div>
    ))}
  </div>
);

export default App;