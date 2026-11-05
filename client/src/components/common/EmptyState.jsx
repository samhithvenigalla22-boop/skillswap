import React from 'react';
import Button from './Button';
import { Sparkles } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There are currently no items to display in this section.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-darkCard rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-slate-800 flex items-center justify-center text-primary-500 dark:text-primary-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
