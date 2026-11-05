import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Github, Code, ExternalLink } from 'lucide-react';
import { SKILL_CATEGORIES } from '../../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              SkillSwap is a peer-to-peer knowledge-sharing ecosystem where people exchange skills without financial barriers. Learn One. Teach One.
            </p>
            <div className="pt-2 text-xs text-slate-400 dark:text-slate-500">
              College Team Project • MERN Stack Architecture
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Platform Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="text-slate-600 dark:text-slate-400 hover:text-primary-500">
                  Explore All Skills
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-slate-600 dark:text-slate-400 hover:text-primary-500">
                  Mutual Skill Matches
                </Link>
              </li>
              <li>
                <Link to="/swap-requests" className="text-slate-600 dark:text-slate-400 hover:text-primary-500">
                  Swap Proposals
                </Link>
              </li>
              <li>
                <Link to="/active-swaps" className="text-slate-600 dark:text-slate-400 hover:text-primary-500">
                  Active Learning Swaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Featured Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {SKILL_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/explore?category=${encodeURIComponent(cat)}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-500"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Academic & Stack */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Engineering Specs
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Built with React, Vite, Tailwind CSS, Node.js, Express, Socket.IO WebSockets & MongoDB Atlas.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-400">
              <Code className="w-4 h-4" />
              <span>Full-Stack Peer Barter</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-900 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SkillSwap Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by College Project Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
