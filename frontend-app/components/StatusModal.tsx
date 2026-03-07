import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all">
        <div className="p-6">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-col items-center text-center">
            {type === 'success' ? (
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-[scale-in_0.3s_ease-out]">
                <FaCheckCircle className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4 animate-[scale-in_0.3s_ease-out]">
                <FaTimesCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
            
            <h3 className={`text-2xl font-bold mb-2 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {title}
            </h3>
            
            <p className="text-slate-600 mb-6">
              {message}
            </p>
            
            <button
              onClick={onClose}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-colors ${
                type === 'success'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
