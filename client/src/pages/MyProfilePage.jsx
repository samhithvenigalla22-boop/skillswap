import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import * as skillService from '../services/skillService';
import Button from '../components/common/Button';
import RatingStars from '../components/common/RatingStars';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';
import { CardSkeleton } from '../components/common/Skeleton';
import { formatDate, getInitials } from '../utils/formatters';
import {
  User,
  MapPin,
  Calendar,
  Edit,
  BookOpen,
  Sparkles,
  Tag,
  Star,
  Award,
} from 'lucide-react';

const MyProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id && !user?.id) return;
      const userId = user._id || user.id;
      setLoading(true);
      try {
        const data = await userService.getUserById(userId);
        if (data && data.success) {
          setProfileData(data.user);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <CardSkeleton />;
  }

  const u = profileData || user;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-5">
            {u?.profilePicture ? (
              <img
                src={u.profilePicture}
                alt={u.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {getInitials(u?.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {u?.name}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300">
                  {u?.role === 'admin' ? 'Administrator' : 'Active Member'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u?.email}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                {u?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {u.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {formatDate(u?.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Link to="/profile/edit">
            <Button variant="outline" size="sm" icon={Edit}>
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Bio */}
        <div className="pt-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              About Me
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {u?.bio || 'No bio provided yet. Click "Edit Profile" to share your background!'}
            </p>
          </div>

          {/* Interests */}
          {u?.interests?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Interests & Focus
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {u.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Tag className="w-3 h-3 text-primary-500" />
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: Skills & Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Skills Offered & Wanted */}
        <div className="space-y-6">
          {/* Skills Offered */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Skills You Teach ({u?.offeredSkills?.length || 0})
              </h3>
              <Link
                to="/manage-skills"
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            {!u?.offeredSkills || u.offeredSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                You haven't added any skills to teach yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {u.offeredSkills.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {s.skillName}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.category}</span>
                    </div>
                    <ProficiencyBadge level={s.proficiencyLevel} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary-500" />
                Skills You Want to Learn ({u?.wantedSkills?.length || 0})
              </h3>
              <Link
                to="/manage-skills"
                className="text-xs font-semibold text-secondary-600 dark:text-secondary-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            {!u?.wantedSkills || u.wantedSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                You haven't listed any learning goals yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {u.wantedSkills.map((s) => (
                  <div
                    key={s._id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {s.skillName}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.category}</span>
                    </div>
                    <ProficiencyBadge level={s.proficiencyLevel} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reviews Received */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Reviews & Ratings ({u?.reviews?.length || 0})
            </h3>
            <RatingStars rating={u?.averageRating} count={u?.reviewCount} size="sm" />
          </div>

          {!u?.reviews || u.reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No reviews yet. Complete your first skill swap to earn ratings!
            </p>
          ) : (
            <div className="space-y-3">
              {u.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {rev.reviewerId?.name || 'Verified Member'}
                    </span>
                    <RatingStars rating={rev.rating} size="sm" showScore={false} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
