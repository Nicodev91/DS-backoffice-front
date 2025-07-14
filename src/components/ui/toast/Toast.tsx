import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]); 

  if (!isVisible) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full">
      <div className={`flex items-center p-4 rounded-lg border shadow-lg gap-3 ${
        type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className={`flex-shrink-0 ${
          type === 'success' ? 'text-green-500' : 'text-red-500'
        }`}>
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          className={`flex-shrink-0 p-1 rounded opacity-70 hover:opacity-100 ${
            type === 'success' ? 'text-green-500' : 'text-red-500'
          }`}
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast; 