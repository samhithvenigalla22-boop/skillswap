import React, { useState, useEffect } from 'react';
import * as skillService from '../services/skillService';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../utils/constants';
import {
  BookOpen,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
} from 'lucide-react';

const ManageSkillsPage = () => {
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('Offer'); // 'Offer' or 'Want'
  const [loading, setLoading] = useState(true);
  const [offeredSkills, setOfferedSkills] = useState([]);
  const [wantedSkills, setWantedSkills] = useState([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    skillName: '',
    category: SKILL_CATEGORIES[0],
    skillType: 'Offer',
    proficiencyLevel: 'Intermediate',
    description: '',
  });

  const fetchMySkills = async () => {
    setLoading(true);
    try {
      const data = await skillService.getMySkills();
      if (data && data.success) {
        setOfferedSkills(data.offeredSkills || []);
        setWantedSkills(data.wantedSkills || []);
      }
    } catch (err) {
      console.error('Failed to fetch my skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySkills();
  }, []);

  const handleOpenAddModal = (type = activeTab) => {
    setEditingSkill(null);
    setFormData({
      skillName: '',
      category: SKILL_CATEGORIES[0],
      skillType: type,
      proficiencyLevel: type === 'Offer' ? 'Advanced' : 'Beginner',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      skillName: skill.skillName,
      category: skill.category,
      skillType: skill.skillType,
      proficiencyLevel: skill.proficiencyLevel,
      description: skill.description || '',
    });
    setModalOpen(true);
  };

  const handleDeleteSkill = async (id, skillName) => {
    if (!window.confirm(`Are you sure you want to remove "${skillName}"?`)) return;

    try {
      await skillService.deleteSkill(id);
      addToast({
        type: 'success',
        title: 'Skill Removed',
        message: `"${skillName}" was removed from your profile.`,
      });
      fetchMySkills();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.response?.data?.message || 'Could not delete skill.',
      });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.skillName.trim()) {
      addToast({
        type: 'warning',
        title: 'Skill Name Required',
        message: 'Please provide a skill title.',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingSkill) {
        await skillService.updateSkill(editingSkill._id, formData);
        addToast({
          type: 'success',
          title: 'Skill Updated',
          message: `"${formData.skillName}" was updated successfully.`,
        });
      } else {
        await skillService.createSkill(formData);
        addToast({
          type: 'success',
          title: 'Skill Added',
          message: `"${formData.skillName}" was added to your profile.`,
        });
      }
      setModalOpen(false);
      fetchMySkills();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.response?.data?.message || 'Could not save skill.',
      });
    } finally {
      setSaving(false);
    }
  };

  const displayedSkills = activeTab === 'Offer' ? offeredSkills : wantedSkills;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase">
            Curriculum Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Manage Your Skills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Specify skills you can offer to teach others and areas you wish to learn.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleOpenAddModal(activeTab)}
        >
          {activeTab === 'Offer' ? 'Add Offered Skill' : 'Add Wanted Skill'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('Offer')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'Offer'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Skills You Offer ({offeredSkills.length})
        </button>

        <button
          onClick={() => setActiveTab('Want')}
          className={`flex items-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'Want'
              ? 'border-secondary-500 text-secondary-600 dark:text-secondary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Skills You Want to Learn ({wantedSkills.length})
        </button>
      </div>

      {/* Skills List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : displayedSkills.length === 0 ? (
        <EmptyState
          icon={activeTab === 'Offer' ? BookOpen : Sparkles}
          title={
            activeTab === 'Offer'
              ? 'No skills offered yet'
              : 'No learning goals listed yet'
          }
          description={
            activeTab === 'Offer'
              ? 'Add skills you know well so other members can discover you and propose complementary swaps.'
              : 'List skills or technologies you want to master to help our algorithm match you with teachers.'
          }
          actionLabel={activeTab === 'Offer' ? 'Add Skill to Teach' : 'Add Skill to Learn'}
          onAction={() => handleOpenAddModal(activeTab)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedSkills.map((skill) => (
            <div
              key={skill._id}
              className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-soft flex flex-col justify-between hover-card"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {skill.skillName}
                  </h3>
                  <ProficiencyBadge level={skill.proficiencyLevel} />
                </div>

                <div className="mb-3">
                  <CategoryBadge category={skill.category} />
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {skill.description || 'No detailed curriculum description provided.'}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={Edit2}
                  onClick={() => handleOpenEditModal(skill)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  icon={Trash2}
                  onClick={() => handleDeleteSkill(skill._id, skill.skillName)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Skill Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            editingSkill
              ? `Edit Skill: ${editingSkill.skillName}`
              : formData.skillType === 'Offer'
              ? 'Add a Skill You Can Teach'
              : 'Add a Skill You Want to Learn'
          }
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Skill Type Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, skillType: 'Offer' }))}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    formData.skillType === 'Offer'
                      ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 text-primary-700 dark:text-primary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Offer (I Can Teach)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, skillType: 'Want' }))}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                    formData.skillType === 'Want'
                      ? 'bg-secondary-50 dark:bg-secondary-950/60 border-secondary-500 text-secondary-700 dark:text-secondary-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Want (I Wish to Learn)
                </button>
              </div>
            </div>

            {/* Skill Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                value={formData.skillName}
                onChange={(e) => setFormData((p) => ({ ...p, skillName: e.target.value }))}
                placeholder="e.g. Python Programming, UI Design, Japanese Conversation..."
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discipline / Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proficiency Level
              </label>
              <select
                value={formData.proficiencyLevel}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, proficiencyLevel: e.target.value }))
                }
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PROFICIENCY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Learning Goals
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Share your teaching style, projects you build, or what you hope to cover..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                {editingSkill ? 'Update Skill' : 'Save Skill'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageSkillsPage;
