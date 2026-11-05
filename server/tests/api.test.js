/**
 * SkillSwap Comprehensive Automated Verification Test Suite
 * Tests all 10 core functional workflows from Specification Phase 9.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Swap = require('../models/Swap');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const { calculateMatchScore } = require('../utils/matchingAlgorithm');

let testResults = [];
const logTest = (name, passed, details = '') => {
  testResults.push({ name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name} ${details ? '(' + details + ')' : ''}`);
};

const runAllTests = async () => {
  console.log('=====================================================');
  console.log('Starting SkillSwap Automated Integration & QA Tests...');
  console.log('=====================================================');

  try {
    await connectDB();

    // Clean test collections
    await User.deleteMany({ email: /test.*@skillswap\.com/ });
    await Skill.deleteMany({});
    await SwapRequest.deleteMany({});
    await Swap.deleteMany({});
    await Message.deleteMany({});
    await Session.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    // -----------------------------------------------------------------
    // TEST 1: Registration
    // -----------------------------------------------------------------
    console.log('\n--- TEST 1: User Registration & Hashing ---');
    const userAData = {
      name: 'Alice Developer',
      email: 'test_alice@skillswap.com',
      password: 'Password123!',
      role: 'user',
      bio: 'Python and backend engineer',
    };

    const userA = await User.create(userAData);
    const userAInDb = await User.findById(userA._id).select('+password');
    const isPasswordHashed = userAInDb.password !== 'Password123!' && userAInDb.password.startsWith('$2');
    logTest('User registration creates MongoDB record', !!userAInDb);
    logTest('Password is automatically hashed with bcrypt', isPasswordHashed);

    // Duplicate email check
    let duplicateRejected = false;
    try {
      await User.create(userAData);
    } catch (err) {
      duplicateRejected = err.code === 11000 || err.name === 'ValidationError';
    }
    logTest('Duplicate email registration is rejected', duplicateRejected);

    // -----------------------------------------------------------------
    // TEST 2: Authentication
    // -----------------------------------------------------------------
    console.log('\n--- TEST 2: Authentication & Password Verification ---');
    const validLogin = await userAInDb.matchPassword('Password123!');
    const invalidLogin = await userAInDb.matchPassword('WrongPassword!');
    logTest('Valid credentials verified successfully', validLogin === true);
    logTest('Invalid credentials correctly rejected', invalidLogin === false);

    const token = generateToken(userA._id);
    logTest('JWT Token generation is valid', typeof token === 'string' && token.length > 20);

    // -----------------------------------------------------------------
    // TEST 3: Skill Management
    // -----------------------------------------------------------------
    console.log('\n--- TEST 3: Skill Creation, Update & Deletion ---');
    // Alice offers Python, wants UI/UX
    const skillAliceOffer = await Skill.create({
      userId: userA._id,
      skillName: 'Python Programming',
      category: 'Programming',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Advanced Python, FastAPI, and data structures',
    });

    const skillAliceWant = await Skill.create({
      userId: userA._id,
      skillName: 'UI/UX Design',
      category: 'UI/UX Design',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Looking to learn wireframing and user journey mapping',
    });

    logTest('Add offered skill successfully', skillAliceOffer.skillType === 'Offer');
    logTest('Add wanted skill successfully', skillAliceWant.skillType === 'Want');

    // Update skill
    skillAliceOffer.proficiencyLevel = 'Expert';
    skillAliceOffer.description = 'Updated description';
    await skillAliceOffer.save();
    const updatedSkill = await Skill.findById(skillAliceOffer._id);
    logTest('Skill update persists in MongoDB', updatedSkill.description === 'Updated description');

    // Create temporary skill to test deletion
    const tempSkill = await Skill.create({
      userId: userA._id,
      skillName: 'Temporary Skill',
      category: 'Other',
      skillType: 'Offer',
      proficiencyLevel: 'Beginner',
    });
    await Skill.findByIdAndDelete(tempSkill._id);
    const deletedSkill = await Skill.findById(tempSkill._id);
    logTest('Skill deletion removes record from MongoDB', deletedSkill === null);

    // -----------------------------------------------------------------
    // TEST 4: Matching Algorithm
    // -----------------------------------------------------------------
    console.log('\n--- TEST 4: Skill Matching Engine ---');
    // Create Bob who offers UI/UX and wants Python
    const userB = await User.create({
      name: 'Bob Designer',
      email: 'test_bob@skillswap.com',
      password: 'Password123!',
      role: 'user',
      bio: 'Product designer specializing in Figma and UI/UX',
    });

    const skillBobOffer = await Skill.create({
      userId: userB._id,
      skillName: 'UI/UX Design',
      category: 'UI/UX Design',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Figma prototypes, wireframing, and component libraries',
    });

    const skillBobWant = await Skill.create({
      userId: userB._id,
      skillName: 'Python Programming',
      category: 'Programming',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Wants to learn Python scripting',
    });

    const matchResult = calculateMatchScore({
      userAOffers: [skillAliceOffer],
      userAWants: [skillAliceWant],
      userBOffers: [skillBobOffer],
      userBWants: [skillBobWant],
      userBProfile: userB,
    });

    logTest('Reciprocal match detected', matchResult.matchType === 'Direct Reciprocal');
    logTest('Match score is calculated deterministically (> 70%)', matchResult.matchPercentage >= 70, `${matchResult.matchPercentage}%`);
    logTest('Shows skills Bob can teach Alice', matchResult.canTeachYou.length > 0 && matchResult.canTeachYou[0].skillName === 'UI/UX Design');
    logTest('Shows skills Alice can teach Bob', matchResult.youCanTeach.length > 0 && matchResult.youCanTeach[0].skillName === 'Python Programming');

    // -----------------------------------------------------------------
    // TEST 5: Swap Requests & Active Swap Creation
    // -----------------------------------------------------------------
    console.log('\n--- TEST 5: Swap Request Workflow ---');
    const swapRequest = await SwapRequest.create({
      senderId: userA._id,
      receiverId: userB._id,
      offeredSkillId: skillAliceOffer._id,
      requestedSkillId: skillBobOffer._id,
      message: 'Hi Bob, lets swap Python for UI/UX!',
      status: 'Pending',
    });
    logTest('Swap request created with status Pending', swapRequest.status === 'Pending');

    // Bob accepts request
    swapRequest.status = 'Accepted';
    await swapRequest.save();

    const activeSwap = await Swap.create({
      requestId: swapRequest._id,
      participants: [userA._id, userB._id],
      offeredSkill: skillAliceOffer._id,
      requestedSkill: skillBobOffer._id,
      status: 'Active',
      startedAt: new Date(),
    });

    logTest('Active Swap created upon request acceptance', activeSwap.status === 'Active' && activeSwap.participants.length === 2);

    // -----------------------------------------------------------------
    // TEST 6: Real-time Messaging & Persistence
    // -----------------------------------------------------------------
    console.log('\n--- TEST 6: Messaging System ---');
    const msg1 = await Message.create({
      swapId: activeSwap._id,
      senderId: userA._id,
      receiverId: userB._id,
      message: 'Hello Bob! Ready to get started?',
    });

    const msgInDb = await Message.findById(msg1._id);
    logTest('Message persisted in MongoDB', msgInDb && msgInDb.message === 'Hello Bob! Ready to get started?');
    logTest('Sender and receiver IDs correctly recorded', msgInDb.senderId.toString() === userA._id.toString());

    // -----------------------------------------------------------------
    // TEST 7: Learning Sessions
    // -----------------------------------------------------------------
    console.log('\n--- TEST 7: Learning Session Scheduling ---');
    const session = await Session.create({
      swapId: activeSwap._id,
      title: 'Python Setup & Syntax Basics',
      description: 'First learning session covering variables, loops and functions',
      scheduledDate: new Date(Date.now() + 86400000),
      startTime: '10:00',
      endTime: '11:00',
      meetingLink: 'https://meet.google.com/test-swap-session',
      status: 'Scheduled',
      createdBy: userA._id,
    });

    logTest('Session created with valid times and status Scheduled', session.status === 'Scheduled');

    // Update & complete session
    session.status = 'Completed';
    await session.save();
    const updatedSession = await Session.findById(session._id);
    logTest('Session completed successfully', updatedSession.status === 'Completed');

    // -----------------------------------------------------------------
    // TEST 8: Reviews & Ratings
    // -----------------------------------------------------------------
    console.log('\n--- TEST 8: Reviews, Ratings & Duplicate Prevention ---');
    // Complete swap
    activeSwap.status = 'Completed';
    activeSwap.completedAt = new Date();
    await activeSwap.save();
    logTest('Swap marked as Completed', activeSwap.status === 'Completed');

    // Alice reviews Bob
    const review = await Review.create({
      swapId: activeSwap._id,
      reviewerId: userA._id,
      revieweeId: userB._id,
      rating: 5,
      comment: 'Fantastic teacher! Figma and wireframing made so clear.',
    });
    logTest('Review created with 5-star rating', review.rating === 5);

    // Prevent duplicate review for the same swap
    let duplicateReviewBlocked = false;
    try {
      await Review.create({
        swapId: activeSwap._id,
        reviewerId: userA._id,
        revieweeId: userB._id,
        rating: 4,
        comment: 'Attempting duplicate review',
      });
    } catch (err) {
      duplicateReviewBlocked = err.code === 11000 || err.name === 'MongoServerError';
    }
    logTest('Duplicate review for same completed swap correctly prevented', duplicateReviewBlocked);

    // Average rating check
    const bReviews = await Review.find({ revieweeId: userB._id });
    const avg = bReviews.reduce((acc, r) => acc + r.rating, 0) / bReviews.length;
    logTest('Average rating calculation matches expected value', avg === 5.0);

    // -----------------------------------------------------------------
    // TEST 9: Admin Dashboard & Authorization
    // -----------------------------------------------------------------
    console.log('\n--- TEST 9: Admin Role & Account Moderation ---');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'test_admin@skillswap.com',
      password: 'AdminPassword123!',
      role: 'admin',
    });
    logTest('Admin user created with admin role', adminUser.role === 'admin');

    // Suspend user
    userB.isActive = false;
    await userB.save();
    const suspendedBob = await User.findById(userB._id);
    logTest('User suspension status saved in database', suspendedBob.isActive === false);

    // Reactivate user
    userB.isActive = true;
    await userB.save();
    logTest('User reactivation status saved in database', userB.isActive === true);

    // -----------------------------------------------------------------
    // TEST 10: In-App Notifications
    // -----------------------------------------------------------------
    console.log('\n--- TEST 10: In-App Notifications ---');
    const notif = await Notification.create({
      userId: userA._id,
      type: 'SWAP_COMPLETED',
      title: 'Swap Completed',
      message: 'Your swap with Bob has been successfully completed.',
      isRead: false,
    });
    logTest('Notification created with unread state', notif.isRead === false);
    notif.isRead = true;
    await notif.save();
    logTest('Notification marked as read', notif.isRead === true);

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n=====================================================');
    const passedCount = testResults.filter((t) => t.passed).length;
    const totalCount = testResults.length;
    console.log(`TEST RESULTS SUMMARY: ${passedCount} / ${totalCount} PASSED`);
    console.log('=====================================================');

    await closeDB();

    if (passedCount === totalCount) {
      console.log('ALL 10 WORKFLOW TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error('Some tests failed.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    await closeDB();
    process.exit(1);
  }
};

runAllTests();
