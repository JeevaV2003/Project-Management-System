import React from 'react';
import { clsx } from 'clsx';

const Card = ({ children, className, padding = 'default', hover = true, ...props }) => {
  const baseClasses = 'surface-card';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClasses = hover ? 'hover:-translate-y-0.5 hover:shadow-medium' : '';

  return (
    <div
      className={clsx(
        baseClasses,
        paddingClasses[padding],
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
