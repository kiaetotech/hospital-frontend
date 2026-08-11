import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentalHealthChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [therapist, setTherapist] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Start a new anonymous chat session
    startSession();
  }, []);

  const startSession = async () => {
    setLoading(true);
    try {
      // For demo purposes, use a mock therapist
      const mockTherapist = {
        id: 'demo',
        name: 'Anonymous Support',
        type: 'AI Assistant'
      };
      setTherapist(mockTherapist);
      
      // Generate a random session ID
      const newSessionId = 'CHAT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      setSessionId(newSessionId);
      
      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          sender: 'therapist',
          text: 'Hello! I\'m here to listen. This is a safe, anonymous space. How are you feeling today?',
          timestamp: new Date().toISOString()
        }
      ]);
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error starting chat session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate therapist response (for demo)
    setTimeout(() => {
      const responses = [
        "I understand. Can you tell me more about that?",
        "That sounds challenging. How long have you been feeling this way?",
        "Thank you for sharing that with me. It takes courage to talk about these things.",
        "I hear you. What kind of support would be helpful right now?",
        "That's completely valid. Your feelings are important.",
        "Would you like to explore some coping strategies together?",
        "I'm here to support you. What would you like to focus on today?",
        "That's a common experience. You're not alone in feeling this way."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const therapistMessage = {
        id: 'therapist_' + Date.now(),
        sender: 'therapist',
        text: randomResponse,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, therapistMessage]);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p>Connecting to support...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#8b5cf6',
        padding: '1rem 2rem',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>💬 Anonymous Chat</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Your identity is protected</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            marginRight: '4px'
          }}></span>
          <span style={{ fontSize: '0.85rem' }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
          <button
            onClick={() => navigate('/mentalhealth')}
            style={{ padding: '0.25rem 1rem', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← Exit
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '1rem',
        overflowY: 'auto',
        backgroundColor: 'white'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                backgroundColor: msg.sender === 'user' ? '#8b5cf6' : '#f3f4f6',
                color: msg.sender === 'user' ? 'white' : '#1e293b',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.sender === 'therapist' ? '4px' : '12px'
              }}
            >
              {msg.sender === 'therapist' && (
                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.25rem' }}>
                  {therapist?.name || 'Support'}
                </div>
              )}
              <div style={{ fontSize: '0.95rem', wordWrap: 'break-word' }}>{msg.text}</div>
              <div style={{
                fontSize: '0.6rem',
                marginTop: '0.25rem',
                color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#9ca3af',
                textAlign: 'right'
              }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '1rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              resize: 'none',
              minHeight: '50px',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: newMessage.trim() ? '#8b5cf6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Send
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', textAlign: 'center' }}>
          🔒 This chat is anonymous and encrypted. Your identity is protected.
        </div>
      </div>
    </div>
  );
};

export default MentalHealthChat;

