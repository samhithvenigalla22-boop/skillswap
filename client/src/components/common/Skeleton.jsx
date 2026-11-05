import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-darkCard rounded-2xl p-6 border border-slate-200 dark:border-darkBorder shadow-soft animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-28" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full"
        />
      ))}
    </div>
  );
};
