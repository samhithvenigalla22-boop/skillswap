import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import * as userService from '../services/userService';
import Button from '../components/common/Button';
import { User, MapPin, Image, Tag, Lock, Save, KeyRound } from 'lucide-react';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profilePicture: user?.profilePicture || '',
    interests: user?.interests ? user.interests.join(', ') : '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const interestsArray = profileForm.interests
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const res = await userService.updateProfile({
        name: profileForm.name.trim(),
        bio: profileForm.bio.trim(),
        location: profileForm.location.trim(),
        profilePicture: profileForm.profilePicture.trim(),
        interests: interestsArray,
      });

      if (res && res.user) {
        updateUser(res.user);
      }

      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile changes have been saved successfully.',
      });

      navigate('/profile');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: err.response?.data?.message || 'Could not save profile changes.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      addToast({
        type: 'warning',
        title: 'Password Too Short',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      addToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been successfully updated.',
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Change Password',
        message: err.response?.data?.message || 'Current password was incorrect.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
          Settings & Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Edit Profile & Account
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Profile Details */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profile Picture URL
              </label>
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  name="profilePicture"
                  value={profileForm.profilePicture}
                  onChange={handleProfileChange}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleProfileChange}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Bio / Expertise Overview
              </label>
              <textarea
                rows={4}
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Share your experience, tools you love, and what excites you about learning..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interests & Tags (Comma-separated)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="interests"
                  value={profileForm.interests}
                  onChange={handleProfileChange}
                  placeholder="Open Source, UI Systems, Machine Learning, Design"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" loading={savingProfile} icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): Change Password */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft space-y-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-secondary-500" />
            Security
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="secondary" loading={savingPassword} className="w-full">
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
