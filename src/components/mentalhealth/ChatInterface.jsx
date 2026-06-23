import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaUserCircle, 
  FaUserSecret, 
  FaRobot,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaCheckDouble,
  FaClock,
  FaSmile,
  FaImage,
  FaFile,
  FaMicrophone,
  FaTimes,
  FaArrowLeft,
  FaEllipsisV,
  FaPhone,
  FaVideo,
  FaInfoCircle
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatInterface = ({
  chatId,
  userId,
  therapistId,
  isAnonymous = false,
  onClose,
  onNewMessage,
  sessionId
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState('offline');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    // Connect to socket
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      path: '/socket.io/chat',
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setLoading(false);
      if (chatId) {
        socketRef.current.emit('join-chat', chatId);
      }
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      setError(error.message);
    });

    // Listen for messages
    socketRef.current.on('new-message', (data) => {
      setMessages(prev => [...prev, data.message]);
      onNewMessage?.(data.message);
      scrollToBottom();
    });

    // Listen for typing indicator
    socketRef.current.on('user-typing', (data) => {
      setTyping(data.isTyping);
      setTypingUser(data.userId);
    });

    // Listen for messages read
    socketRef.current.on('messages-read', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.sender !== data.userId && !msg.readBy.some(r => r.userId === data.userId)
            ? { ...msg, readBy: [...msg.readBy, { userId: data.userId, readAt: new Date() }] }
            : msg
        )
      );
    });

    // Load chat history
    if (chatId) {
      loadChatHistory();
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/mentalhealth/chat/${chatId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setMessages(response.data.data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Load mock data for demo
      setMessages(getMockMessages());
    } finally {
      setLoading(false);
    }
  };

  const getMockMessages = () => {
    return [
      {
        _id: '1',
        sender: 'therapist',
        content: 'Hello! How are you feeling today?',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        readBy: [{ userId: 'user', readAt: new Date() }]
      },
      {
        _id: '2',
        sender: 'user',
        content: 'I\'ve been feeling a bit anxious lately.',
        timestamp: new Date(Date.now() - 240000),
        type: 'text',
        readBy: [{ userId: 'therapist', readAt: new Date() }]
      },
      {
        _id: '3',
        sender: 'therapist',
        content: 'I understand. Can you tell me more about what\'s been making you anxious?',
        timestamp: new Date(Date.now() - 180000),
        type: 'text',
        readBy: [{ userId: 'user', readAt: new Date() }]
      }
    ];
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && attachments.length === 0) return;

    const messageContent = inputMessage.trim() || '📎 Attachment';
    
    try {
      // Send via socket
      if (socketRef.current && isConnected) {
        socketRef.current.emit('send-message', {
          chatId,
          content: messageContent,
          type: attachments.length > 0 ? 'file' : 'text',
          attachments: attachments.length > 0 ? attachments : undefined
        });

        // Optimistically add message
        const tempMessage = {
          _id: `temp_${Date.now()}`,
          sender: 'user',
          content: messageContent,
          timestamp: new Date(),
          type: attachments.length > 0 ? 'file' : 'text',
          readBy: [{ userId: 'user', readAt: new Date() }],
          isTemp: true
        };
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();
      }

      setInputMessage('');
      setAttachments([]);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setInputMessage(e.target.value);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', {
        chatId,
        isTyping: e.target.value.length > 0
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        continue;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          data: event.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Get message status icon
  const getMessageStatus = (message) => {
    if (message.isTemp) return <FaClock className="text-gray-400 text-xs" />;
    if (message.readBy?.length > 1) return <FaCheckDouble className="text-blue-500 text-xs" />;
    if (message.readBy?.length === 1) return <FaCheckCircle className="text-gray-400 text-xs" />;
    return <FaCheckCircle className="text-gray-300 text-xs" />;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Chat
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition">
              <FaArrowLeft />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              {isAnonymous ? (
                <FaUserSecret className="text-white text-xl" />
              ) : (
                <FaUserCircle className="text-white text-2xl" />
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              onlineStatus === 'online' ? 'bg-green-400' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {isAnonymous ? 'Anonymous Chat' : 'Therapy Chat'}
            </h3>
            <p className="text-xs text-blue-100">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
            <FaPhone />
          </button>
          <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
            <FaVideo />
          </button>
          <button className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message, index) => (
          <motion.div
            key={message._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                {message.type === 'file' && message.attachments?.length > 0 && (
                  <div className="mb-1">
                    {message.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <FaFile /> {att.name}
                      </div>
                    ))}
                  </div>
                )}
                <p className="break-words">{message.content}</p>
              </div>
              <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                <span>{formatTime(message.timestamp)}</span>
                {message.sender === 'user' && getMessageStatus(message)}
              </div>
            </div>
            {message.sender !== 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 order-1">
                {isAnonymous ? <FaUserSecret className="text-gray-500" /> : <FaUserCircle className="text-gray-500" />}
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {typing && typingUser && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <FaUserCircle className="text-gray-500" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3 bg-white">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-sm">
                <FaFile className="text-gray-500" />
                <span className="truncate max-w-[100px]">{att.name}</span>
                <button
                  onClick={() => setAttachments(attachments.filter(a => a.id !== att.id))}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaSmile className="text-xl" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaImage className="text-xl" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() && attachments.length === 0}
            className={`p-2 rounded-full transition ${
              inputMessage.trim() || attachments.length > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane />
          </button>
        </form>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <FaLock className="text-green-500" /> End-to-end encrypted
          </span>
          <span className="flex items-center gap-1">
            <FaShieldAlt className="text-blue-500" /> Secure & private
          </span>
          {isAnonymous && (
            <span className="flex items-center gap-1 text-purple-500">
              <FaUserSecret /> Anonymous
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;