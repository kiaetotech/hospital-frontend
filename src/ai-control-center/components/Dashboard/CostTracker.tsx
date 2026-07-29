// D:\hospital-frontend\src\ai-control-center\components\Dashboard\CostTracker.tsx

import React from 'react';

interface CostData {
  agentId?: string;
  provider?: string;
  costInr?: number;
  dailyCostInr?: number;
  weeklyCostInr?: number;
  monthlyCostInr?: number;
  budgetRemaining?: number;
  budgetPercentage?: number;
}

interface CostTrackerProps {
  data: {
    agents?: Record<string, {
      cost?: CostData;
    }>;
    totalCostToday?: number;
  } | null;
}

const CostTracker: React.FC<CostTrackerProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading cost data...</p>
      </div>
    );
  }

  // Extract all costs from all agents
  const allCosts: CostData[] = [];
  Object.values(data.agents || {}).forEach((agent: any) => {
    if (agent.cost) {
      allCosts.push(agent.cost);
    }
  });

  // Get total cost today
  const totalCostToday = data.totalCostToday || 
    allCosts.reduce((sum, c) => sum + (c.costInr || 0), 0);

  // Calculate weekly and monthly estimates (if not provided)
  const totalWeekly = allCosts.reduce((sum, c) => sum + (c.weeklyCostInr || (c.costInr || 0) * 7), 0);
  const totalMonthly = allCosts.reduce((sum, c) => sum + (c.monthlyCostInr || (c.costInr || 0) * 30), 0);

  // Calculate budget usage (assuming daily budget of ₹100)
  const dailyBudget = 100;
  const budgetPercent = Math.min((totalCostToday / dailyBudget) * 100, 100);

  // Get budget color
  const getBudgetColor = (percent: number): string => {
    if (percent < 80) return '#4caf50';
    if (percent < 90) return '#ff9800';
    if (percent < 95) return '#ff5722';
    return '#f44336';
  };

  // Get budget label
  const getBudgetLabel = (percent: number): string => {
    if (percent < 80) return 'Safe';
    if (percent < 90) return 'Warning';
    if (percent < 95) return 'Critical';
    return 'Emergency';
  };

  // Group costs by provider
  const providerCosts: Record<string, number> = {};
  allCosts.forEach(c => {
    if (c.provider) {
      providerCosts[c.provider] = (providerCosts[c.provider] || 0) + (c.costInr || 0);
    }
  });

  // Sort providers by cost (highest first)
  const sortedProviders = Object.entries(providerCosts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="cost-tracker">
      <div className="section-header">
        <h3>💰 Cost Tracker</h3>
        <span className="badge">Today: ₹{totalCostToday.toFixed(2)}</span>
      </div>

      {/* Cost Summary */}
      <div className="cost-summary">
        <div className="cost-item">
          <span className="cost-label">Today</span>
          <span className="cost-value">₹{totalCostToday.toFixed(2)}</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">This Week</span>
          <span className="cost-value">₹{totalWeekly.toFixed(2)}</span>
        </div>
        <div className="cost-item">
          <span className="cost-label">This Month</span>
          <span className="cost-value">₹{totalMonthly.toFixed(2)}</span>
        </div>
      </div>

      {/* Budget Bar */}
      <div className="budget-bar">
        <div className="budget-label">
          <span>Daily Budget Usage</span>
          <span style={{ fontWeight: '600', color: getBudgetColor(budgetPercent) }}>
            {budgetPercent.toFixed(1)}% ({getBudgetLabel(budgetPercent)})
          </span>
        </div>
        <div className="budget-track">
          <div 
            className={`budget-fill ${getBudgetLabel(budgetPercent).toLowerCase()}`}
            style={{ 
              width: `${Math.min(budgetPercent, 100)}%`,
              backgroundColor: getBudgetColor(budgetPercent)
            }}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '11px', 
          color: '#888',
          marginTop: '4px'
        }}>
          <span>₹0</span>
          <span>₹{dailyBudget}</span>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          color: '#555', 
          marginBottom: '8px' 
        }}>
          Cost by Provider
        </div>
        {sortedProviders.length === 0 ? (
          <div style={{ 
            padding: '12px', 
            background: '#f5f7fb', 
            borderRadius: '8px', 
            textAlign: 'center',
            fontSize: '13px',
            color: '#888'
          }}>
            No provider cost data available
          </div>
        ) : (
          <div className="provider-costs">
            {sortedProviders.map(([provider, cost]) => (
              <div className="provider-cost" key={provider}>
                <span className="provider-name" style={{ textTransform: 'capitalize' }}>
                  {provider}
                </span>
                <span className="provider-amount">₹{cost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-Agent Cost (if available) */}
      {allCosts.some(c => c.agentId) && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: '600', 
            color: '#555', 
            marginBottom: '8px' 
          }}>
            Cost by Agent
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '6px' 
          }}>
            {allCosts
              .filter(c => c.agentId)
              .sort((a, b) => (b.costInr || 0) - (a.costInr || 0))
              .slice(0, 6)
              .map((c, index) => {
                const agentName = c.agentId || 'Unknown';
                return (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '4px 10px',
                    background: '#f5f7fb',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#666' }}>{agentName}</span>
                    <span style={{ fontWeight: '600', color: '#1a237e' }}>
                      ₹{(c.costInr || 0).toFixed(2)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Alert if budget is high */}
      {budgetPercent > 80 && (
        <div style={{ 
          marginTop: '12px', 
          padding: '10px 14px', 
          background: budgetPercent > 90 ? '#ffebee' : '#fff3e0', 
          borderRadius: '8px', 
          fontSize: '13px',
          color: budgetPercent > 90 ? '#c62828' : '#e65100',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {budgetPercent > 90 ? '🚨' : '⚠️'} 
          <strong>Budget Alert:</strong> {budgetPercent.toFixed(1)}% of daily budget used.
          {budgetPercent > 90 && ' Non-critical requests may be throttled.'}
        </div>
      )}
    </div>
  );
};

export default CostTracker;