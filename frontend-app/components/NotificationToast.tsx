// Composant pour afficher les notifications Redux
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { removeNotification, selectNotifications, Notification } from '../store/slices/uiSlice';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ToastItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const dispatch = useAppDispatch();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, 300); // Match animation duration
  };

  useEffect(() => {
    if (notification.autoHide && notification.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <FaExclamationCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <FaInfoCircle className="w-5 h-5 text-[#0a83ca]" />;
      default: return <FaInfoCircle className="w-5 h-5 text-[#0a83ca]" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success': return 'bg-white border-l-4 border-green-500 shadow-lg shadow-green-500/10';
      case 'error': return 'bg-white border-l-4 border-red-500 shadow-lg shadow-red-500/10';
      case 'warning': return 'bg-white border-l-4 border-yellow-500 shadow-lg shadow-yellow-500/10';
      case 'info': return 'bg-white border-l-4 border-[#0a83ca] shadow-lg shadow-[#0a83ca]/10';
      default: return 'bg-white border-l-4 border-[#0a83ca] shadow-lg';
    }
  };

  return (
    <div
      className={`
        flex items-start p-4 mb-3 rounded-lg w-80 transform transition-all duration-300
        ${getStyles()}
        ${isExiting ? 'animate-fade-out translate-x-full opacity-0' : 'animate-slide-in'}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-600 mt-1 leading-snug">{notification.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="ml-2 -mx-1.5 -my-1.5 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-300 transition-colors"
      >
        <span className="sr-only">Close</span>
        <FaTimes className="w-4 h-4" />
      </button>
    </div>
  );
};

const NotificationToast: React.FC = () => {
  const notifications = useAppSelector(selectNotifications);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map(notification => (
          <ToastItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

export default NotificationToast;