import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { addToast, fetchNotifications } = useNotifications();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_status', ({ userId, isOnline, onlineUserIds }) => {
        if (onlineUserIds) {
          setOnlineUsers(onlineUserIds);
        } else {
          setOnlineUsers((prev) =>
            isOnline ? [...new Set([...prev, userId])] : prev.filter((id) => id !== userId)
          );
        }
      });

      newSocket.on('new_message_notification', ({ senderName, message, swapId }) => {
        addToast({
          type: 'info',
          title: `New Message from ${senderName}`,
          message: message.length > 50 ? `${message.substring(0, 47)}...` : message,
        });
        fetchNotifications();
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setOnlineUsers([]);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.includes(userId.toString());
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
