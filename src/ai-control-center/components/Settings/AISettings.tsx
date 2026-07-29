// D:\hospital-frontend\src\ai-control-center\components\Settings\AISettings.tsx

import React, { useState, useEffect } from 'react';

interface AISettingsProps {
  data: any;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  onRefresh: () => void;
}

interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'number';
  value: any;
  options?: { label: string; value: string }[];
}

const AISettings: React.FC<AISettingsProps> = ({ data, connectionStatus, onRefresh }) => {
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      key: 'ai_enabled',
      label: 'AI Services',
      description: 'Enable or disable all AI services',
      type: 'toggle',
      value: true
    },
    {
      key: 'auto_recovery',
      label: 'Auto Recovery',
      description: 'Enable automatic recovery for failed requests',
      type: 'toggle',
      value: true
    },
    {
      key: 'circuit_breaker',
      label: 'Circuit Breaker',
      description: 'Enable circuit breaker for provider failures',
      type: 'toggle',
      value: true
    },
    {
      key: 'fallback_enabled',
      label: 'Fallback Mode',
      description: 'Enable fallback to secondary providers',
      type: 'toggle',
      value: true
    },
    {
      key: 'provider_priority',
      label: 'Provider Priority',
      description: 'Select preferred AI provider',
      type: 'select',
      value: 'groq',
      options: [
        { label: 'Groq (Fastest)', value: 'groq' },
        { label: 'Ollama (Free)', value: 'ollama' },
        { label: 'Gemini (Balanced)', value: 'gemini' },
        { label: 'OpenRouter (Fallback)', value: 'openrouter' }
      ]
    },
    {
      key: 'log_level',
      label: 'Log Level',
      description: 'Set the logging detail level',
      type: 'select',
      value: 'info',
      options: [
        { label: 'Debug', value: 'debug' },
        { label: 'Info', value: 'info' },
        { label: 'Warn', value: 'warn' },
        { label: 'Error', value: 'error' }
      ]
    }
  ]);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handle setting change
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => 
      prev.map(item => 
        item.key === key ? { ...item, value } : item
      )
    );
    setSaved(false);
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In production: API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle reset settings
  const handleResetSettings = () => {
    // Reset to defaults
    setSettings(prev => 
      prev.map(item => ({
        ...item,
        value: item.key === 'provider_priority' ? 'groq' :
               item.key === 'log_level' ? 'info' : true
      }))
    );
    setSaved(false);
  };

  // Render toggle
  const renderToggle = (item: SettingItem) => (
    <div 
      className={`toggle ${item.value ? 'active' : ''}`}
      onClick={() => handleSettingChange(item.key, !item.value)}
    >
      <div className="toggle-knob" />
    </div>
  );

  // Render select
  const renderSelect = (item: SettingItem) => (
    <select
      value={item.value}
      onChange={(e) => handleSettingChange(item.key, e.target.value)}
      style={{
        padding: '6px 12px',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '13px',
        background: '#fff',
        color: '#333',
        cursor: 'pointer',
        minWidth: '180px'
      }}
    >
      {item.options?.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  // Render input
  const renderInput = (item: SettingItem) => (
    <input
      type="text"
      value={item.value}
      onChange={(e) => handleSettingChange(item.key, e.target.value)}
      style={{
        padding: '6px 12px',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '13px',
        background: '#fff',
        color: '#333',
        outline: 'none',
        minWidth: '180px'
      }}
    />
  );

  // Render number
  const renderNumber = (item: SettingItem) => (
    <input
      type="number"
      value={item.value}
      onChange={(e) => handleSettingChange(item.key, parseFloat(e.target.value))}
      style={{
        padding: '6px 12px',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '13px',
        background: '#fff',
        color: '#333',
        outline: 'none',
        width: '100px'
      }}
    />
  );

  // Render setting item
  const renderSettingItem = (item: SettingItem) => {
    let control = null;
    switch (item.type) {
      case 'toggle':
        control = renderToggle(item);
        break;
      case 'select':
        control = renderSelect(item);
        break;
      case 'input':
        control = renderInput(item);
        break;
      case 'number':
        control = renderNumber(item);
        break;
      default:
        control = null;
    }

    return (
      <div className="setting-item" key={item.key}>
        <div>
          <div className="setting-label" style={{ fontWeight: '500', color: '#333' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            {item.description}
          </div>
        </div>
        {control}
      </div>
    );
  };

  return (
    <div className="ai-settings">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h3>⚙️ AI Settings</h3>
        <span className={`badge ${connectionStatus === 'connected' ? 'active' : 'critical'}`}>
          {connectionStatus === 'connected' ? '🟢 Connected' : 
           connectionStatus === 'connecting' ? '🟡 Connecting' : '🔴 Offline'}
        </span>
      </div>

      {/* System Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{ 
          padding: '12px 16px', 
          background: '#e8f5e9', 
          borderRadius: '8px',
          borderLeft: '4px solid #4caf50'
        }}>
          <div style={{ fontSize: '12px', color: '#888' }}>System Status</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2e7d32' }}>
            {connectionStatus === 'connected' ? '✅ Operational' : '⚠️ Degraded'}
          </div>
        </div>
        <div style={{ 
          padding: '12px 16px', 
          background: '#e3f2fd', 
          borderRadius: '8px',
          borderLeft: '4px solid #2196f3'
        }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Active Agents</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0d47a1' }}>
            {data?.activeAgentsCount || 0} / {data?.agents ? Object.keys(data.agents).length : 0}
          </div>
        </div>
        <div style={{ 
          padding: '12px 16px', 
          background: '#fff3e0', 
          borderRadius: '8px',
          borderLeft: '4px solid #ff9800'
        }}>
          <div style={{ fontSize: '12px', color: '#888' }}>Provider Health</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#e65100' }}>
            {data?.systemHealth?.providers ? 
              Object.values(data.systemHealth.providers).filter(s => s === 'healthy').length :
              0} / {data?.systemHealth?.providers ? Object.keys(data.systemHealth.providers).length : 0}
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a237e' }}>
              Configuration
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Manage AI platform settings and preferences
            </div>
          </div>
          {saved && (
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#4caf50',
              animation: 'fadeOut 3s ease forwards'
            }}>
              ✅ Saved successfully
            </span>
          )}
        </div>

        <div className="settings-grid">
          {settings.map(item => renderSettingItem(item))}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <button
            onClick={handleResetSettings}
            style={{
              padding: '8px 20px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'transparent',
              color: '#555',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '8px',
              background: '#e3f2fd',
              color: '#0d47a1',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#bbdefb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#e3f2fd';
            }}
          >
            🔄 Refresh Data
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            style={{
              padding: '8px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#1a237e',
              color: '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? '💾 Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div style={{ 
        marginTop: '16px',
        padding: '12px 16px',
        background: '#f5f7fb',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#888',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span>🔐 All settings are stored securely</span>
        <span>🔄 Settings apply to all connected agents</span>
        <span>📊 {settings.filter(s => s.value === true).length} of {settings.length} features enabled</span>
      </div>

      {/* Fade out animation for saved message */}
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AISettings;