import React from 'react';
import { clsx } from 'clsx';

const Input = ({ 
  label, 
  error, 
  icon: Icon, 
  className,
  hint,
  ...props 
}) => {
  const inputClasses = clsx(
    'w-full rounded-2xl border border-neutral-200/80 bg-white/90 px-4 py-2.5 text-sm text-neutral-700 placeholder-neutral-400 shadow-inner transition-all duration-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
    {
      'border-danger-400 focus:border-danger-400 focus:ring-danger-100': error,
      'pl-10': Icon,
    },
    className
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-neutral-600">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="text-xs text-neutral-400">{hint}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-danger-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
