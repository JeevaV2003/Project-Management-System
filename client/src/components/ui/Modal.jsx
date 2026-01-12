import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  footer,
  className,
  onBackdropClick
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onBackdropClick) {
        onBackdropClick();
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div 
        className={clsx(
          'fixed inset-0 bg-neutral-900/60 backdrop-blur-md transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Modal Container with animation */}
      <div 
        className={clsx(
          'relative z-10 w-full transform transition-all duration-300',
          sizeClasses[size],
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Content with glass effect */}
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-transparent pointer-events-none" />
          
          {/* Content wrapper */}
          <div className="relative">
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between border-b border-neutral-200/60 bg-gradient-to-r from-neutral-50/80 to-white/60 px-6 py-5">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">
                    {title}
                  </h2>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-4 flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/60 bg-white/80 text-neutral-500 transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="modal-scroll max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-neutral-200/60 bg-gradient-to-r from-neutral-50/80 to-white/60 px-6 py-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
