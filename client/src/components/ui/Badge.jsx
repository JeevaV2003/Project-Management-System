import React from 'react';
import { clsx } from 'clsx';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-full border font-semibold capitalize';
  
  const variants = {
    default: 'bg-neutral-50 text-neutral-600 border-neutral-200/60',
    primary: 'bg-primary-50 text-primary-600 border-primary-200/60',
    secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200/60',
    success: 'bg-success-50 text-success-600 border-success-200/60',
    warning: 'bg-warning-50 text-warning-600 border-warning-200/60',
    danger: 'bg-danger-50 text-danger-600 border-danger-200/60',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

