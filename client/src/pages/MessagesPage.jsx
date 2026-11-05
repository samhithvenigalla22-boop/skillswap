import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import * as swapService from '../services/swapService';
import * as messageService from '../services/messageService';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatTime, formatRelativeTime, getInitials } from '../utils/formatters';
import {
  MessageSquare,
  Send,
  Users,
  Circle,
  Video,
  Calendar,
  Sparkles,
} from 'lucide-react';

const MessagesPage = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingSwaps, setLoadingSwaps] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Load user's active/completed swaps for the conversation sidebar
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingSwaps(true);
      try {
        const data = await swapService.getActiveSwaps('All');
        if (data && data.success) {
          const list = data.swaps || [];
          setSwaps(list);

          // Select swap from param or first available
          if (swapId) {
            const found = list.find((s) => s._id === swapId);
            setSelectedSwap(found || list[0] || null);
          } else if (list.length > 0) {
            setSelectedSwap(list[0]);
            navigate(`/messages/${list[0]._id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingSwaps(false);
      }
    };

    fetchConversations();
  }, [swapId]);

  // Load messages for selected swap
  useEffect(() => {
    if (!selectedSwap?._id) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await messageService.getMessagesBySwapId(selectedSwap._id);
        if (data && data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Socket.IO Room Joining
    if (socket) {
      socket.emit('join_swap', selectedSwap._id);

      const handleReceiveMessage = (newMsg) => {
        if (newMsg.swapId === selectedSwap._id) {
          setMessages((prev) => [...prev, newMsg]);
        }
      };

      const handleUserTyping = ({ swapId: typingSwapId, userId: typingUserId }) => {
        if (typingSwapId === selectedSwap._id && typingUserId !== user?.id) {
          setPartnerTyping(true);
        }
      };

      const handleUserStopTyping = ({ swapId: typingSwapId }) => {
        if (typingSwapId === selectedSwap._id) {
          setPartnerTyping(false);
        }
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);

      return () => {
        socket.emit('leave_swap', selectedSwap._id);
        socket.off('receive_message', handleReceiveMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stop_typing', handleUserStopTyping);
      };
    }
  }, [selectedSwap, socket, user?.id]);

  // Handle typing emitting
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (socket && selectedSwap?._id) {
      socket.emit('typing', { swapId: selectedSwap._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { swapId: selectedSwap._id });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || !selectedSwap?._id) return;

    setInputMessage('');
    if (socket) {
      socket.emit('stop_typing', { swapId: selectedSwap._id });
    }

    try {
      if (socket && socket.connected) {
        // Send via Socket.IO
        socket.emit('send_message', {
          swapId: selectedSwap._id,
          message: trimmed,
        });
      } else {
        // Fallback to REST
        const data = await messageService.sendMessage(selectedSwap._id, trimmed);
        if (data && data.success) {
          setMessages((prev) => [...prev, data.message]);
        }
      }
    } catch (err) {
      console.error('Failed to deliver message:', err);
    }
  };

  const currentUserId = user?._id || user?.id;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
          Real-Time Collaboration
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
          Messages & Chat
        </h1>
      </div>

      <div className="h-[75vh] min-h-[500px] rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft overflow-hidden flex flex-col md:flex-row">
        {/* Left Sidebar: Conversations List (1 Col) */}
        <div className="w-full md:w-80 border-r border-slate-200 dark:border-darkBorder flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30">
          <div className="p-4 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Conversations ({swaps.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {loadingSwaps ? (
              <div className="p-4 space-y-3">
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
              </div>
            ) : swaps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active swap conversations. Accept a swap request to start chatting!
              </div>
            ) : (
              swaps.map((swap) => {
                const partner = swap.partner;
                const isSelected = selectedSwap?._id === swap._id;
                const online = isUserOnline(partner?._id);

                return (
                  <button
                    key={swap._id}
                    onClick={() => {
                      setSelectedSwap(swap);
                      navigate(`/messages/${swap._id}`);
                    }}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-50/70 dark:bg-primary-950/40 border-l-4 border-primary-500'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {partner?.profilePicture ? (
                        <img
                          src={partner.profilePicture}
                          alt={partner.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                          {getInitials(partner?.name)}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-darkCard ${
                          online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        title={online ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {partner?.name || 'Swap Partner'}
                        </span>
                        {swap.latestMessage && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {formatRelativeTime(swap.latestMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {swap.latestMessage
                          ? swap.latestMessage.message
                          : `${swap.offeredSkill?.skillName} ↔ ${swap.requestedSkill?.skillName}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Chat Window (2-3 Cols) */}
        {selectedSwap ? (
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-darkCard">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedSwap.partner?.profilePicture ? (
                    <img
                      src={selectedSwap.partner.profilePicture}
                      alt={selectedSwap.partner.name}
                      className="w-10 h-10 rounded-full object-cover border border-primary-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                      {getInitials(selectedSwap.partner?.name)}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-darkCard ${
                      isUserOnline(selectedSwap.partner?._id)
                        ? 'bg-emerald-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedSwap.partner?.name}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isUserOnline(selectedSwap.partner?._id)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {isUserOnline(selectedSwap.partner?._id) ? 'Online' : 'Offline'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Swapping: {selectedSwap.offeredSkill?.skillName} ↔{' '}
                    {selectedSwap.requestedSkill?.skillName}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                <Link to="/sessions">
                  <Button size="sm" variant="outline" icon={Calendar}>
                    Schedule Session
                  </Button>
                </Link>
              </div>
            </div>

            {/* Chat Messages Scroll Window */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-900/10">
              {loadingMessages ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-slate-800 text-primary-500 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    This is the start of your swap conversation!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Say hello, introduce your goals, and coordinate your upcoming learning sessions.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe =
                    msg.senderId?._id?.toString() === currentUserId?.toString() ||
                    msg.senderId?.toString() === currentUserId?.toString();

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {getInitials(msg.senderId?.name || selectedSwap.partner?.name)}
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-primary-500 text-white rounded-br-xs'
                            : 'bg-white dark:bg-darkBorder text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            isMe ? 'text-primary-200' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {partnerTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-9 italic animate-pulse">
                  <span>{selectedSwap.partner?.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-slate-200 dark:border-darkBorder flex items-center gap-2 bg-white dark:bg-darkCard"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={`Message ${selectedSwap.partner?.name || 'partner'}...`}
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="submit" variant="primary" size="md" icon={Send} disabled={!inputMessage.trim()}>
                Send
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <EmptyState
              icon={MessageSquare}
              title="No Conversation Selected"
              description="Choose an active swap conversation from the left to start messaging."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
