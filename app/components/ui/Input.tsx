import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export function Input({
  label,
  error,
  icon,
  helperText,
  className = '',
  ...props
}: InputProps) {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          className={`
            block w-full px-3 py-2.5 border rounded-lg shadow-sm
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20 text-red-800 dark:text-red-200'
              : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {helperText}
        </p>
      )}
    </div>
  );
}
