import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-slate-800 text-primary-500 flex items-center justify-center mb-6 shadow-md shadow-primary-500/10">
        <Sparkles className="w-10 h-10" />
      </div>

      <span className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
        Error 404
      </span>
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-3">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The skill exchange or page you are looking for does not exist or has been relocated to another corridor.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Back to Home
          </Button>
        </Link>
        <Link to="/explore">
          <Button variant="outline">Explore Skills Marketplace</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
