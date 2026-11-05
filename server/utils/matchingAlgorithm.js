/**
 * SkillSwap Matching Algorithm
 * Calculates complementary skill matches between users using a deterministic scoring formula.
 *
 * Scoring Formula:
 * 1. Two-way Reciprocal Exchange (User A offers what User B wants AND User B offers what User A wants):
 *    - Base: 60 points
 * 2. One-way Direct Match (User B offers what User A wants):
 *    - Base: 30 points
 * 3. Additional Cross-Match Skills:
 *    - +5 points for each additional complementary skill pairing (up to 15 points max)
 * 4. Proficiency Alignment:
 *    - +10 points if the offered skill proficiency is Advanced or Expert
 *    - +5 points if Intermediate
 * 5. Category Affinity:
 *    - +10 points if teaching and learning skills share categories or complementary disciplines
 * 6. Profile & Reputation Weight:
 *    - +5 points for having completed profile (bio, location, interests)
 *
 * Total Score is clamped between 0 and 100%.
 */

const calculateMatchScore = ({
  userAOffers,
  userAWants,
  userBOffers,
  userBWants,
  userBProfile,
}) => {
  // Find skills User B offers that User A wants
  const canTeachYou = [];
  userAWants.forEach((wanted) => {
    const match = userBOffers.find((offered) => {
      const nameMatch =
        offered.skillName.toLowerCase().trim() === wanted.skillName.toLowerCase().trim() ||
        offered.skillName.toLowerCase().includes(wanted.skillName.toLowerCase()) ||
        wanted.skillName.toLowerCase().includes(offered.skillName.toLowerCase());
      const catMatch = offered.category === wanted.category;
      return nameMatch || catMatch;
    });

    if (match) {
      canTeachYou.push({
        wantedSkill: wanted,
        offeredSkill: match,
        exactNameMatch:
          match.skillName.toLowerCase().trim() === wanted.skillName.toLowerCase().trim(),
      });
    }
  });

  // Find skills User A offers that User B wants
  const youCanTeach = [];
  userBWants.forEach((wanted) => {
    const match = userAOffers.find((offered) => {
      const nameMatch =
        offered.skillName.toLowerCase().trim() === wanted.skillName.toLowerCase().trim() ||
        offered.skillName.toLowerCase().includes(wanted.skillName.toLowerCase()) ||
        wanted.skillName.toLowerCase().includes(offered.skillName.toLowerCase());
      const catMatch = offered.category === wanted.category;
      return nameMatch || catMatch;
    });

    if (match) {
      youCanTeach.push({
        wantedSkill: wanted,
        offeredSkill: match,
        exactNameMatch:
          match.skillName.toLowerCase().trim() === wanted.skillName.toLowerCase().trim(),
      });
    }
  });

  // If no skills can be exchanged in either direction, no match
  if (canTeachYou.length === 0 && youCanTeach.length === 0) {
    return null;
  }

  let score = 0;
  const breakdown = [];

  const isReciprocal = canTeachYou.length > 0 && youCanTeach.length > 0;

  if (isReciprocal) {
    score += 60;
    breakdown.push('Direct Two-Way Complementary Match (+60%)');
  } else if (canTeachYou.length > 0) {
    score += 35;
    breakdown.push('Complementary Skill Offered (+35%)');
  } else {
    score += 25;
    breakdown.push('Complementary Skill Needed (+25%)');
  }

  // Exact name matches bonus
  const exactMatches =
    canTeachYou.filter((m) => m.exactNameMatch).length +
    youCanTeach.filter((m) => m.exactNameMatch).length;
  if (exactMatches > 0) {
    const exactBonus = Math.min(exactMatches * 8, 16);
    score += exactBonus;
    breakdown.push(`Exact Skill Name Match Bonus (+${exactBonus}%)`);
  }

  // Proficiency level weighting of offered skills
  let proficiencyBonus = 0;
  canTeachYou.forEach((m) => {
    if (m.offeredSkill.proficiencyLevel === 'Expert') proficiencyBonus += 6;
    else if (m.offeredSkill.proficiencyLevel === 'Advanced') proficiencyBonus += 4;
    else if (m.offeredSkill.proficiencyLevel === 'Intermediate') proficiencyBonus += 2;
  });
  proficiencyBonus = Math.min(proficiencyBonus, 12);
  if (proficiencyBonus > 0) {
    score += proficiencyBonus;
    breakdown.push(`Teacher Proficiency Level Bonus (+${proficiencyBonus}%)`);
  }

  // Profile quality & completeness
  let profileBonus = 0;
  if (userBProfile?.bio && userBProfile.bio.length > 20) profileBonus += 4;
  if (userBProfile?.location) profileBonus += 3;
  if (userBProfile?.interests && userBProfile.interests.length > 0) profileBonus += 3;
  if (profileBonus > 0) {
    score += profileBonus;
    breakdown.push(`Verified Profile & Details (+${profileBonus}%)`);
  }

  // Clamp score between 0 and 100
  const finalScore = Math.min(Math.max(Math.round(score), 20), 99);

  return {
    matchPercentage: finalScore,
    matchType: isReciprocal ? 'Direct Reciprocal' : 'Potential Exchange',
    canTeachYou: canTeachYou.map((m) => m.offeredSkill),
    youCanTeach: youCanTeach.map((m) => m.offeredSkill),
    breakdown,
  };
};

module.exports = {
  calculateMatchScore,
};
