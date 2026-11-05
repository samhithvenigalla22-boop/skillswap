import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Code2,
  Palette,
  Users,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Award,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import Button from '../components/common/Button';
import { SKILL_CATEGORIES } from '../utils/constants';

const LandingPage = () => {
  // Interactive mini simulation demo on the hero
  const [activeTab, setActiveTab] = useState('match');

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-20 overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Money. 100% Peer Collaboration.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Learn One.{' '}
            <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-indigo-600 bg-clip-text text-transparent">
              Teach One.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The premier peer-to-peer knowledge barter platform. Exchange what you know for what you wish to learn — no subscription fees, no financial barriers, just pure mutual growth.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/register">
              <Button size="lg" variant="primary" icon={ArrowRight}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline">
                Explore Skills
              </Button>
            </Link>
          </div>

          {/* Social proof metric chips */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
              <div className="text-2xl font-black text-primary-600 dark:text-primary-400">0$</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Financial Cost
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
              <div className="text-2xl font-black text-secondary-600 dark:text-secondary-400">17+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Skill Disciplines
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Complementary Barter
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">5.0★</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Verified Peer Reviews
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Exchange Simulation Banner */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-gradient-to-tr from-primary-900 to-indigo-950 p-6 sm:p-8 text-white shadow-2xl border border-primary-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-800/80 text-primary-200 text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Live Barter Simulation
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                See How SkillSwap Connects Two Minds
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                User A has Python and wants UI/UX. User B has UI/UX and wants Python. Our matching engine detects mutual synergy instantly.
              </p>
            </div>

            {/* Exchange Graphic */}
            <div className="flex items-center gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center font-bold text-sm mx-auto mb-1">
                  Alex
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">Offers: Python</div>
                <div className="text-[10px] text-slate-400">Wants: UI/UX</div>
              </div>

              <div className="flex flex-col items-center px-2">
                <div className="text-xs font-black text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full mb-1">
                  96% Match
                </div>
                <RefreshCw className="w-5 h-5 text-secondary-400 animate-spin" />
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary-600 flex items-center justify-center font-bold text-sm mx-auto mb-1">
                  Maya
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">Offers: UI/UX</div>
                <div className="text-[10px] text-slate-400">Wants: Python</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-10 text-center max-w-6xl mx-auto">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
            How SkillSwap Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2">
            No money required. Follow four effortless steps to trade skills and expand your horizons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              List Offers & Wants
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Create your profile and add skills you are confident to teach, along with subjects you are eager to master.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card">
            <div className="w-12 h-12 rounded-xl bg-secondary-50 dark:bg-slate-800 text-secondary-600 dark:text-secondary-400 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Algorithmic Matching
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our matching engine pairs complementary skills, scoring exact matches and reciprocal teaching compatibility.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Swap Request & Chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Send a proposal. Once accepted, collaborate through real-time private chat and schedule learning sessions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft hover-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Complete & Rate
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Conclude your learning exchange and exchange verified 1–5 star reviews to build your community reputation.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
              Diverse Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Skill Categories
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            Browse all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SKILL_CATEGORIES.slice(0, 12).map((category) => (
            <Link
              key={category}
              to={`/explore?category=${encodeURIComponent(category)}`}
              className="p-4 rounded-xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder hover:border-primary-400 hover:shadow-soft text-center group transition-all"
            >
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {category}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center">
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Community Voices
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Real Stories From Real Swappers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="text-amber-400 font-bold text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "I taught Python data pipelines for 4 weeks and received masterclass Figma training in return. We both built real portfolio pieces without spending a single dollar."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center">
                AR
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Alex Rivera</div>
                <div className="text-[11px] text-slate-400">Software Developer</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="text-amber-400 font-bold text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "The structured session scheduling and built-in chat made keeping each other accountable so simple. SkillSwap eliminated the awkwardness of informal skill trading."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-secondary-500 text-white font-bold text-xs flex items-center justify-center">
                MC
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Maya Chen</div>
                <div className="text-[11px] text-slate-400">UI/UX Designer</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="text-amber-400 font-bold text-sm">★★★★★</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "As a college student, paid coaching was out of reach. On SkillSwap I traded conversational Spanish for frontend React tutoring. It completely changed my learning pace!"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                ER
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Elena Rodriguez</div>
                <div className="text-[11px] text-slate-400">Student & Translator</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 p-8 sm:p-12 text-center text-white space-y-6 shadow-xl max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to Trade Knowledge & Accelerate Growth?
        </h2>
        <p className="text-sm sm:text-base text-primary-100 max-w-xl mx-auto leading-relaxed">
          Join thousands of learners and creators exchanging skills today. Sign up in seconds with no credit card required.
        </p>
        <div>
          <Link to="/register">
            <button className="px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-primary-700 hover:bg-slate-50 transition-all shadow-lg active:scale-95">
              Create Your Skill Profile
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
