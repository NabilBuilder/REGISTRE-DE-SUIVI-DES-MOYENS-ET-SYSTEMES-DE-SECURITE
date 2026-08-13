import React from 'react';

const variants = {
  primary: 'bg-gardnet-700 hover:bg-gardnet-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  info: 'bg-blue-600 hover:bg-blue-700 text-white'
};

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`toolbar-btn rounded-lg font-semibold inline-flex items-center justify-center gap-1.5 transition-all duration-200 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
