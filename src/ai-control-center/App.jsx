// D:\hospital-frontend\src\ai-control-center\App.jsx

import React, { useState, useEffect } from 'react';
import './styles.css';

const API_BASE = 'https://hospital-backend-production-f1b1.up.railway.app';

const AGENT_DETAILS = {
  'HospitalAgent': {
    description: 'Hospital Search & Booking',
    capabilities: {
      search_hospitals: 'Search hospitals by location, specialty',
      compare_hospitals: 'Compare hospitals by ratings, cost',
      check_beds: 'Check bed availability',
      estimate_cost: 'Estimate treatment cost'
    }
  },
  'DoctorAgent': {
    description: 'Doctor Consultation & Booking',
    capabilities: {
      find_doctor: 'Find doctors by specialty, location',
      book_consultation: 'Book online/in-person consultation',
      check_availability: 'Check doctor availability',
      get_doctor_profile: 'Get doctor profile details'
    }
  },
  'DiagnosticsAgent': {
    description: 'Lab Tests & Diagnostics',
    capabilities: {
      find_lab: 'Find diagnostic labs',
      compare_packages: 'Compare lab test packages',
      book_test: 'Book lab tests',
      interpret_results: 'Interpret test results using AI'
    }
  },
  'AmbulanceAgent': {
    description: 'Ambulance Dispatch & Tracking',
    capabilities: {
      dispatch_ambulance: 'Dispatch nearest ambulance',
      track_ambulance: 'Track ambulance in real-time',
      check_availability: 'Check ambulance availability',
      calculate_eta: 'Calculate ETA'
    }
  },
  'InsuranceAgent': {
    description: 'Health Insurance Comparison',
    capabilities: {
      compare_policies: 'Compare insurance policies',
      check_claim: 'Check claim eligibility',
      find_cashless_hospitals: 'Find cashless hospitals',
      estimate_premium: 'Estimate premium'
    }
  },
  'CaregiverAgent': {
    description: 'Home Care & Caregiver Booking',
    capabilities: {
      find_caregiver: 'Find caregivers by type',
      book_caregiver: 'Book caregiver services',
      create_care_plan: 'Create care plan',
      check_availability: 'Check caregiver availability'
    }
  },
  'WellnessAgent': {
    description: 'Ayurveda, Homeopathy, Mental Wellness',
    capabilities: {
      find_practitioner: 'Find wellness practitioners',
      book_consultation: 'Book consultation',
      get_packages: 'Get wellness packages',
      check_availability: 'Check availability'
    }
  },
  'FinanceAgent': {
    description: 'EMI, Loans, Payments',
    capabilities: {
      calculate_emi: 'Calculate EMI',
      compare_emi_partners: 'Compare EMI partners',
      apply_loan: 'Apply for health loan',
      check_eligibility: 'Check loan eligibility'
    }
  },
  'CRMAgent': {
    description: 'Customer Relationship Management',
    capabilities: {
      track_customer: 'Track customer activity',
      score_lead: 'Score and qualify leads',
      segment_customers: 'Segment customers',
      predict_churn: 'Predict churn risk'
    }
  },
  'MarketingAgent': {
    description: 'Content, Campaigns, SEO',
    capabilities: {
      generate_content: 'Generate SEO blogs, social posts',
      create_campaign: 'Create marketing campaigns',
      analyze_campaign: 'Analyze campaign performance',
      suggest_optimizations: 'Suggest SEO optimizations'
    }
  },
  'SupportAgent': {
    description: 'Support Tickets, FAQs',
    capabilities: {
      classify_ticket: 'Classify support tickets',
      answer_faq: 'Answer FAQs',
      chat_support: 'Provide chat support',
      route_ticket: 'Route tickets to departments'
    }
  },
  'AnalyticsAgent': {
    description: 'KPIs, Reports, Trends',
    capabilities: {
      generate_kpi: 'Generate KPIs',
      generate_report: 'Generate reports',
      predict_trend: 'Predict trends',
      analyze_business: 'Analyze business health'
    }
  },
  'CorporateHealthAgent': {
    description: 'Corporate Health Plans',
    capabilities: {
      get_corporate_plans: 'Get corporate health plans',
      compare_corporate_plans: 'Compare plans',
      enroll_employees: 'Enroll employees',
      get_enrollment_status: 'Get enrollment status'
    }
  },
  'SearchIntelligenceAgent': {
    description: 'Semantic Search, Autocomplete',
    capabilities: {
      semantic_search: 'Perform semantic search',
      understand_query: 'Understand user queries',
      rank_results: 'Rank search results',
      autocomplete: 'Provide autocomplete suggestions'
    }
  },
  'RecommendationAgent': {
    description: 'Personalized Recommendations',
    capabilities: {
      personalize_recommendations: 'Generate personalized recommendations',
      suggest_hospitals: 'Suggest hospitals',
      suggest_doctors: 'Suggest doctors',
      suggest_packages: 'Suggest packages'
    }
  },
  'WorkflowAgent': {
    description: 'Multi-step Workflow Orchestration',
    capabilities: {
      create_workflow: 'Create workflows',
      execute_workflow: 'Execute workflows',
      get_workflow_status: 'Get workflow status',
      pause_workflow: 'Pause workflows'
    }
  },
  'MemoryAgent': {
    description: 'Memory Storage & Retrieval',
    capabilities: {
      store_memory: 'Store user memories',
      retrieve_memory: 'Retrieve memories',
      conversation_memory: 'Manage conversation context',
      forget_memory: 'Remove/expire memories'
    }
  },
  'NotificationAgent': {
    description: 'Multi-channel Notifications',
    capabilities: {
      send_notification: 'Send notifications',
      get_preferences: 'Get user preferences',
      update_preferences: 'Update preferences',
      get_history: 'Get notification history'
    }
  },
  'CEOAgent': {
    description: 'Strategic Coordination',
    capabilities: {
      create_strategic_plan: 'Create strategic plans',
      coordinate_workflows: 'Coordinate multi-agent workflows',
      generate_report: 'Generate reports',
      allocate_resources: 'Allocate resources'
    }
  },
  'StrategyAgent': {
    description: 'Business Strategy Analysis',
    capabilities: {
      analyze_market: 'Analyze market trends',
      competitive_analysis: 'Perform competitive analysis',
      generate_insights: 'Generate strategic insights',
      strategic_forecast: 'Forecast business trends'
    }
  }
};

const CATEGORIES = {
  'Business Agents (Level 1)': ['HospitalAgent', 'DoctorAgent', 'DiagnosticsAgent', 'AmbulanceAgent', 'InsuranceAgent', 'CaregiverAgent', 'WellnessAgent'],
  'Operations Agents (Level 2)': ['FinanceAgent', 'CRMAgent', 'MarketingAgent', 'SupportAgent', 'AnalyticsAgent', 'CorporateHealthAgent'],
  'Intelligence Agents (Level 3)': ['SearchIntelligenceAgent', 'RecommendationAgent', 'WorkflowAgent', 'MemoryAgent', 'NotificationAgent'],
  'Executive Agents (Level 4)': ['CEOAgent', 'StrategyAgent']
};

const App = () => {
  const [agents, setAgents] = useState([]);
  const [health, setHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAgents, setExpandedAgents] = useState({});

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

  const toggleAgent = (agentName) => {
    setExpandedAgents(prev => ({
      ...prev,
      [agentName]: !prev[agentName]
    }));
  };

  const getAgentFromAPI = (agentName) => {
    return agents.find(a => a.name === agentName);
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
          {error ? '⚠️ Error' : '✅ Connected'} | {agents.length} Agents Online
        </div>
      </header>

      <nav className="ai-tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>📋 Agent Directory</button>
        <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}>🩺 System Health</button>
      </nav>

      {error && <div className="error-banner">{error}</div>}

      {activeTab === 'dashboard' && (
        <div>
          <div className="dashboard-grid">
            <div className="card">
              <h3>🤖 Total Agents</h3>
              <div className="big-number">{agents.length}</div>
            </div>
            <div className="card">
              <h3>🟢 Online</h3>
              <div className="big-number green">{agents.filter(a => a.status === 'idle' || a.status === 'online').length}</div>
            </div>
            <div className="card">
              <h3>🩺 System</h3>
              <div className="big-number">{health?.status || 'Running'}</div>
            </div>
          </div>
          <div className="summary-table">
            <h2>📋 AGENTS SUMMARY</h2>
            <table>
              <thead>
                <tr><th>#</th><th>Agent Name</th><th>Role</th><th>Status</th></tr>
              </thead>
              <tbody>
                {Object.entries(CATEGORIES).map(([category, agentNames]) => (
                  <React.Fragment key={category}>
                    <tr className="category-header"><td colSpan="4"><strong>{category}</strong></td></tr>
                    {agentNames.map((name, idx) => {
                      const agent = getAgentFromAPI(name);
                      return (
                        <tr key={name} className="agent-row" onClick={() => toggleAgent(name)}>
                          <td>{idx + 1}</td>
                          <td>{name}</td>
                          <td>{AGENT_DETAILS[name]?.description || 'Unknown'}</td>
                          <td><span className={`badge ${agent?.status === 'idle' ? 'green' : 'yellow'}`}>{agent?.status || 'offline'}</span></td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div>
          {Object.entries(CATEGORIES).map(([category, agentNames]) => (
            <div key={category} className="category-section">
              <h2 className="category-title">{category}</h2>
              <table className="agent-detail-table">
                <thead>
                  <tr><th>#</th><th>Agent</th><th>Description</th><th>Capabilities</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {agentNames.map((name, idx) => {
                    const agent = getAgentFromAPI(name);
                    const details = AGENT_DETAILS[name];
                    const isExpanded = expandedAgents[name];
                    return (
                      <React.Fragment key={name}>
                        <tr className="agent-row" onClick={() => toggleAgent(name)}>
                          <td>{idx + 1}</td>
                          <td><strong>{name}</strong></td>
                          <td>{details?.description || 'Unknown'}</td>
                          <td>
                            <span className="cap-count">{agent?.capabilities?.length || 0} capabilities</span>
                            <span className="expand-icon">{isExpanded ? '▲' : '▼'}</span>
                          </td>
                          <td><span className={`badge ${agent?.status === 'idle' ? 'green' : 'yellow'}`}>{agent?.status || 'offline'}</span></td>
                        </tr>
                        {isExpanded && details?.capabilities && (
                          <tr className="capability-row">
                            <td colSpan="5">
                              <div className="capability-list">
                                <strong>Capabilities:</strong>
                                <table className="capability-table">
                                  <thead>
                                    <tr><th>Capability</th><th>Description</th></tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(details.capabilities).map(([cap, desc]) => (
                                      <tr key={cap}>
                                        <td><code>{cap}</code></td>
                                        <td>{desc}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
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