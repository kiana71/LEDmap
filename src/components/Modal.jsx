import React from 'react';

const Modal = ({ isOpen, onClose, title, children, actions, actionsPosition = 'center' }) => {
  if (!isOpen) return null;

  const getActionsPositionClass = () => {
    switch (actionsPosition) {
      case 'start':
        return 'justify-start';
      case 'end':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {title}
          </h3>
        )}
        <div className="text-gray-600 mb-6">
          {children}
        </div>
        {actions && (
          <div className={`flex ${getActionsPositionClass()} gap-3`}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 