import React from 'react';
import { clsx } from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 text-white shadow-glow hover:-translate-y-0.5 hover:shadow-large',
    secondary: 'border border-white/70 bg-white/80 text-neutral-700 shadow-inner hover:bg-white hover:text-neutral-900',
    outline: 'border border-primary-200 bg-white/70 text-primary-600 hover:bg-primary-50',
    ghost: 'bg-transparent text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-glow hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-glow hover:-translate-y-0.5',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-glow hover:-translate-y-0.5',
  };
  
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
