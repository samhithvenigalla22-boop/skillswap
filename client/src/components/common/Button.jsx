import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-sm',
    md: 'text-sm px-4 py-2.5 gap-2 shadow',
    lg: 'text-base px-6 py-3 gap-2.5 shadow-md',
  };

  const variantClasses = {
    primary:
      'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-400 dark:focus:ring-offset-slate-900',
    secondary:
      'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-400 dark:focus:ring-offset-slate-900',
    outline:
      'border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 focus:ring-primary-400 dark:focus:ring-offset-slate-900',
    ghost:
      'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-300 shadow-none',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 dark:focus:ring-offset-slate-900',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 dark:focus:ring-offset-slate-900',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
