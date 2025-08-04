import React from 'react';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const Alert = ({ 
  type = 'info', 
  message, 
  title,
  onClose,
  className = ''
}) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-400',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-400',
      icon: <XCircleIcon className="h-5 w-5 text-red-400" />
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-400',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />
    }
  };
  
  const { bg, text, border, icon } = types[type];
  
  return (
    <div className={`${bg} ${border} border-l-4 p-4 mb-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3">
          {title && <h3 className={`text-sm font-medium ${text}`}>{title}</h3>}
          <div className={`text-sm ${text}`}>{message}</div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  type === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' :
                  type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' :
                  type === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' :
                  'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                }`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
