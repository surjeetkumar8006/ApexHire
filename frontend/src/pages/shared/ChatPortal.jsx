import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Send, 
  MessageSquare, 
  UserPlus, 
  Clock, 
  AlertCircle,
  Cpu,
  Shield,
  GraduationCap
} from 'lucide-react';

const ChatPortal = () => {
  const { authHeader, user } = useAuth();
  const { addToast } = useNotification();

  const [inbox, setInbox] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchInbox();
    fetchUsersList();
  }, []);

  useEffect(() => {
    if (activePartner) {
      fetchChatHistory(activePartner._id);
      
      // Auto-poll messages every 6 seconds to simulate real-time sockets
      const interval = setInterval(() => {
        fetchChatHistory(activePartner._id, true);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [activePartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInbox = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/chat/inbox`, { headers: authHeader() });
      if (res.ok) {
        setInbox(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/users`, { headers: authHeader() });
      if (res.ok) {
        setAvailableUsers(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatHistory = async (partnerId, isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/community/chat/${partnerId}`, { headers: authHeader() });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;

    try {
      const res = await fetch(`${API_BASE}/community/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          receiverId: activePartner._id,
          text
        })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setText('');
        fetchInbox(); // Refresh sidebar order
      } else {
        addToast('Failed to send message', 'error');
      }
    } catch (err) {
      addToast('Network error sending message', 'error');
    }
  };

  const startNewChat = (selectedUser) => {
    // Check if partner already in inbox
    const exists = inbox.find(i => i.partner._id === selectedUser._id);
    if (!exists) {
      // Add mock empty inbox item
      setInbox(prev => [{ partner: selectedUser, lastMessage: '', timestamp: new Date() }, ...prev]);
    }
    setActivePartner(selectedUser);
    setShowNewChatDropdown(false);
    setMessages([]);
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield size={14} className="text-secondary" />;
    if (role === 'recruiter') return <Cpu size={14} className="text-accent" />;
    return <GraduationCap size={14} className="text-primary" />;
  };

  return (
    <div className="container-fluid py-4" style={{ color: 'var(--text-primary)' }}>
      <div className="chat-layout">
        
        {/* Left Side: Inbox List */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header d-flex justify-content-between align-items-center">
            <h3 className="h6 font-bold mb-0">Messages</h3>
            
            <div className="position-relative">
              <button 
                onClick={() => { setShowNewChatDropdown(!showNewChatDropdown); setSearchUserQuery(''); }}
                className="btn btn-xs btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <UserPlus size={14} /> New
              </button>

              {showNewChatDropdown && (
                <div 
                  className="position-absolute glass-card p-2 shadow-lg rounded border border-color" 
                  style={{ 
                    right: 0, 
                    top: '40px', 
                    zIndex: 100, 
                    width: '250px', 
                    maxHeight: '280px', 
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-surface)' 
                  }}
                >
                  <span className="text-xxs text-muted font-bold d-block px-2 mb-2">SELECT USER TO CHAT</span>
                  <input
                    type="text"
                    className="form-input text-xs mb-2"
                    placeholder="Search users..."
                    value={searchUserQuery}
                    onChange={(e) => setSearchUserQuery(e.target.value)}
                    style={{ 
                      padding: '0.4rem 0.75rem', 
                      width: '100%',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                  {availableUsers.filter(u => 
                    u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                    u.role.toLowerCase().includes(searchUserQuery.toLowerCase())
                  ).length === 0 ? (
                    <span className="text-xs text-muted d-block p-2">No matching users</span>
                  ) : (
                    availableUsers
                      .filter(u => 
                        u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) || 
                        u.role.toLowerCase().includes(searchUserQuery.toLowerCase())
                      )
                      .map(u => (
                        <button
                          key={u._id}
                          onClick={() => startNewChat(u)}
                          className="dropdown-user-item"
                        >
                          <div className="avatar-circle text-xxs font-semibold bg-base" style={{ width: 24, height: 24 }}>
                            {u.name.charAt(0)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <span className="font-semibold text-xs d-block text-truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                            <span className="text-muted text-xxs" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{getRoleIcon(u.role)} {u.role}</span>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Conversations Scrollbar */}
          <div className="chat-sidebar-list d-flex flex-column gap-1">
            {inbox.length === 0 ? (
              <div className="text-center py-5 text-muted text-xs">
                <MessageSquare size={24} className="mb-2 mx-auto" />
                <p>No active conversations. Start one by clicking "New"!</p>
              </div>
            ) : (
              inbox.map((item, idx) => {
                const isActive = activePartner?._id === item.partner._id;
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePartner(item.partner)}
                    className={`chat-partner-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="avatar-circle bg-primary-glow font-bold text-primary" style={{ width: 38, height: 38, minWidth: 38, marginRight: '0.25rem' }}>
                      {item.partner.name.charAt(0)}
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="font-bold text-xs" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {item.partner.name}
                          {getRoleIcon(item.partner.role)}
                          <span className="online-dot" style={{ width: '6px', height: '6px', minWidth: '6px', boxShadow: 'none', marginLeft: '0.25rem' }}></span>
                        </span>
                        <span className="text-muted text-xxs d-flex align-items-center gap-1">
                          <Clock size={10} /> 
                          {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                      <span className="text-muted text-xs d-block text-truncate">{item.lastMessage || 'Start messaging...'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Chat Message Feed */}
        <div className="chat-feed-area">
          {activePartner ? (
            <>
              {/* Partner info bar */}
              <div className="chat-feed-header d-flex align-items-center gap-3">
                <div className="avatar-circle bg-primary-glow font-bold text-primary" style={{ width: 38, height: 38 }}>
                  {activePartner.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-sm d-flex align-items-center gap-1">
                    {activePartner.name}
                    {getRoleIcon(activePartner.role)}
                    <span className="online-dot ml-2" style={{ width: '8px', height: '8px' }}></span>
                  </span>
                  <span className="text-muted text-xs d-block">{activePartner.email} • {activePartner.role}</span>
                </div>
              </div>

              {/* Feed scroll body */}
              <div className="chat-feed-messages d-flex flex-column gap-3">
                {loading ? (
                  <div className="text-center py-5">
                    <span className="spinner"></span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-5 text-muted text-xs">
                    <MessageSquare size={28} className="mb-2 mx-auto" />
                    <p>No messages yet. Send a note to kickstart conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.sender.toString() === user._id.toString();
                    return (
                      <div 
                        key={idx} 
                        className={`chat-bubble-container ${isMine ? 'mine' : 'theirs'}`}
                      >
                        <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                          <p className="mb-1">{msg.text}</p>
                          <span className="text-xxs text-muted d-block text-right" style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send message form */}
              <div className="chat-input-area">
                <form onSubmit={handleSendMessage} className="chat-input-wrapper">
                  <input 
                    type="text" 
                    className="chat-input-field"
                    placeholder="Type your message here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button type="submit" className="chat-input-send-btn">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted p-4">
              <MessageSquare size={48} className="mb-3 text-primary-glow" style={{ color: 'var(--primary)' }} />
              <h3 className="h6 font-bold mb-1">Select a Conversation</h3>
              <p className="text-xs text-center" style={{ maxWidth: '400px' }}>
                Choose a chat partner from the sidebar or click "New" to start messaging recruiters or students.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatPortal;
