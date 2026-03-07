import React from 'react';
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'success' | 'warning';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'default'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getHeaderGradient = () => {
    switch (type) {
      case 'danger': return 'from-red-600 to-red-800';
      case 'success': return 'from-green-600 to-green-800';
      case 'warning': return 'from-yellow-500 to-yellow-700';
      default: return 'from-[#0a83ca] to-[#005f9e]';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return <FaExclamationTriangle className="text-white text-xl" />;
      case 'success': return <FaCheckCircle className="text-white text-xl" />;
      case 'warning': return <FaExclamationTriangle className="text-white text-xl" />;
      default: return <FaInfoCircle className="text-white text-xl" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-fadeIn">
        <div className={`bg-gradient-to-r ${getHeaderGradient()} px-6 py-4 flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-white font-bold text-lg tracking-wide">
              {title}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            title="Fermer"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 leading-relaxed text-lg">
            {message}
          </p>
          
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
              }}
              className={`px-6 py-2.5 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-gradient-to-r ${getHeaderGradient()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;