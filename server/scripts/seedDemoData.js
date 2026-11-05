require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const SwapRequest = require('../models/SwapRequest');
const Swap = require('../models/Swap');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const seedDemoData = async ({ exitProcess = true } = {}) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('Clearing existing demo data...');

    await Skill.deleteMany({});
    await SwapRequest.deleteMany({});
    await Swap.deleteMany({});
    await Message.deleteMany({});
    await Session.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});

    console.log('Seeding demo users...');
    const demoPassword = 'Password@123';

    // 1. Ensure Admin exists
    let admin = await User.findOne({ email: 'admin@skillswap.com' });
    if (!admin) {
      admin = await User.create({
        name: 'SkillSwap Admin',
        email: 'admin@skillswap.com',
        password: 'Admin@123456',
        role: 'admin',
        bio: 'Lead System Administrator & Community Moderator',
        location: 'New York, USA',
        interests: ['Platform Moderation', 'EdTech', 'Open Source'],
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      });
    }

    // 2. Demo Users
    const usersData = [
      {
        name: 'Alex Rivera',
        email: 'alex@skillswap.com',
        bio: 'Full-stack software developer with 4 years experience in Python and backend services. Passionate about learning visual design and UX principles.',
        location: 'San Francisco, CA',
        interests: ['Software Architecture', 'Open Source', 'Coffee', 'Hiking'],
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      },
      {
        name: 'Maya Chen',
        email: 'maya@skillswap.com',
        bio: 'Product Designer specializing in wireframing, design systems, and Figma prototypes. Eager to pick up Python for automation and data visualization.',
        location: 'Seattle, WA',
        interests: ['UI/UX', 'Design Systems', 'Typography', 'Illustration'],
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      },
      {
        name: 'Liam Johnson',
        email: 'liam@skillswap.com',
        bio: 'Frontend enthusiast working with React, Vite, and Tailwind. Looking to learn video editing for online developer content creation.',
        location: 'Austin, TX',
        interests: ['React', 'Web Performance', 'Blogging', 'Photography'],
        profilePicture: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      },
      {
        name: 'Sophia Patel',
        email: 'sophia@skillswap.com',
        bio: 'Growth marketer and SEO specialist with experience scaling tech startups. Looking to understand React to better communicate with engineering teams.',
        location: 'Chicago, IL',
        interests: ['SEO', 'Content Strategy', 'Public Speaking', 'Cycling'],
        profilePicture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      },
      {
        name: 'David Kim',
        email: 'david@skillswap.com',
        bio: 'Data scientist and machine learning researcher. Can teach Deep Learning, Pandas, and statistics. Looking to learn conversational Spanish.',
        location: 'Boston, MA',
        interests: ['AI Research', 'Mathematics', 'Language Learning', 'Chess'],
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
      {
        name: 'Elena Rodriguez',
        email: 'elena@skillswap.com',
        bio: 'Native Spanish speaker and professional translator. Passionate about coding and excited to learn Python programming from scratch.',
        location: 'Miami, FL',
        interests: ['Linguistics', 'Cultural Exchange', 'Coding', 'Travel'],
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
    ];

    const createdUsers = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create({
          ...u,
          password: demoPassword,
          role: 'user',
        });
      } else {
        user.name = u.name;
        user.bio = u.bio;
        user.location = u.location;
        user.interests = u.interests;
        user.profilePicture = u.profilePicture;
        await user.save();
      }
      createdUsers[u.email] = user;
    }

    console.log('Seeding skills for demo users...');

    // Alex Rivera's Skills
    const alexPython = await Skill.create({
      userId: createdUsers['alex@skillswap.com']._id,
      skillName: 'Python Programming',
      category: 'Programming',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Master core Python, data structures, OOP, API development with FastAPI, and automated scripts.',
    });

    const alexJs = await Skill.create({
      userId: createdUsers['alex@skillswap.com']._id,
      skillName: 'JavaScript & Node.js',
      category: 'Web Development',
      skillType: 'Offer',
      proficiencyLevel: 'Advanced',
      description: 'Asynchronous programming, Express.js backend services, and RESTful API architecture.',
    });

    const alexWantUI = await Skill.create({
      userId: createdUsers['alex@skillswap.com']._id,
      skillName: 'UI/UX Design',
      category: 'UI/UX Design',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Looking to learn wireframing, user persona mapping, and Figma design workflow.',
    });

    const alexWantSpanish = await Skill.create({
      userId: createdUsers['alex@skillswap.com']._id,
      skillName: 'Spanish Conversation',
      category: 'Languages',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Seeking conversational Spanish practice for travel and professional networking.',
    });

    // Maya Chen's Skills
    const mayaUI = await Skill.create({
      userId: createdUsers['maya@skillswap.com']._id,
      skillName: 'UI/UX Design',
      category: 'UI/UX Design',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Hands-on mentorship in UI design, visual hierarchy, mobile-first design, and Figma prototyping.',
    });

    const mayaGraphic = await Skill.create({
      userId: createdUsers['maya@skillswap.com']._id,
      skillName: 'Graphic Design & Branding',
      category: 'Graphic Design',
      skillType: 'Offer',
      proficiencyLevel: 'Advanced',
      description: 'Logo creation, brand identity guides, color theory, and typography fundamentals.',
    });

    const mayaWantPython = await Skill.create({
      userId: createdUsers['maya@skillswap.com']._id,
      skillName: 'Python Programming',
      category: 'Programming',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Eager to learn Python basics to automate data collection and run generative design scripts.',
    });

    // Liam Johnson's Skills
    const liamReact = await Skill.create({
      userId: createdUsers['liam@skillswap.com']._id,
      skillName: 'React.js & Tailwind CSS',
      category: 'Web Development',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Modern component-driven development, custom React hooks, state management, and responsive styling.',
    });

    const liamWantMarketing = await Skill.create({
      userId: createdUsers['liam@skillswap.com']._id,
      skillName: 'Digital Marketing & Growth',
      category: 'Digital Marketing',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Want to understand SEO, content funnels, and organic growth strategies for tech projects.',
    });

    // Sophia Patel's Skills
    const sophiaMarketing = await Skill.create({
      userId: createdUsers['sophia@skillswap.com']._id,
      skillName: 'Digital Marketing & Growth',
      category: 'Digital Marketing',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Practical training on keyword research, technical SEO, content distribution, and analytics.',
    });

    const sophiaWantReact = await Skill.create({
      userId: createdUsers['sophia@skillswap.com']._id,
      skillName: 'React.js & Tailwind CSS',
      category: 'Web Development',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Wants to understand frontend components, props, and how modern web apps are structured.',
    });

    // David Kim's Skills
    await Skill.create({
      userId: createdUsers['david@skillswap.com']._id,
      skillName: 'Machine Learning & AI',
      category: 'Artificial Intelligence',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Supervised and unsupervised learning, neural network architectures, PyTorch, and Scikit-Learn.',
    });

    await Skill.create({
      userId: createdUsers['david@skillswap.com']._id,
      skillName: 'Spanish Conversation',
      category: 'Languages',
      skillType: 'Want',
      proficiencyLevel: 'Intermediate',
      description: 'Looking to practice intermediate Spanish conversation and grammar refinement.',
    });

    // Elena Rodriguez's Skills
    const elenaSpanish = await Skill.create({
      userId: createdUsers['elena@skillswap.com']._id,
      skillName: 'Spanish Conversation',
      category: 'Languages',
      skillType: 'Offer',
      proficiencyLevel: 'Expert',
      description: 'Native Spanish coaching, natural pronunciation, everyday idioms, and business vocabulary.',
    });

    await Skill.create({
      userId: createdUsers['elena@skillswap.com']._id,
      skillName: 'Python Programming',
      category: 'Programming',
      skillType: 'Want',
      proficiencyLevel: 'Beginner',
      description: 'Starting my coding journey. Want patient mentorship on Python syntax and small scripts.',
    });

    console.log('Seeding active swaps and requests...');

    // 1. Accepted Swap Request between Alex Rivera and Maya Chen
    const swapRequestAlexMaya = await SwapRequest.create({
      senderId: createdUsers['alex@skillswap.com']._id,
      receiverId: createdUsers['maya@skillswap.com']._id,
      offeredSkillId: alexPython._id,
      requestedSkillId: mayaUI._id,
      message: 'Hey Maya! I would love to teach you Python backend fundamentals in exchange for learning UI/UX prototyping in Figma.',
      status: 'Accepted',
    });

    // Active Swap between Alex and Maya
    const activeSwapAlexMaya = await Swap.create({
      requestId: swapRequestAlexMaya._id,
      participants: [
        createdUsers['alex@skillswap.com']._id,
        createdUsers['maya@skillswap.com']._id,
      ],
      offeredSkill: alexPython._id,
      requestedSkill: mayaUI._id,
      status: 'Active',
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    // Messages in Active Swap
    await Message.create({
      swapId: activeSwapAlexMaya._id,
      senderId: createdUsers['alex@skillswap.com']._id,
      receiverId: createdUsers['maya@skillswap.com']._id,
      message: 'Hi Maya, welcome to our skill swap! Excited to dive into Figma and Python together.',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    });

    await Message.create({
      swapId: activeSwapAlexMaya._id,
      senderId: createdUsers['maya@skillswap.com']._id,
      receiverId: createdUsers['alex@skillswap.com']._id,
      message: 'Hey Alex! Great to connect. I have prepared a quick curriculum for Figma wireframes and components for our first session.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    // Sessions in Active Swap
    await Session.create({
      swapId: activeSwapAlexMaya._id,
      title: 'Python Core Fundamentals & Environment Setup',
      description: 'Hands-on review of virtual environments, pip, data types, and writing basic CLI scripts.',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '11:30',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'Scheduled',
      createdBy: createdUsers['alex@skillswap.com']._id,
    });

    await Session.create({
      swapId: activeSwapAlexMaya._id,
      title: 'Figma Auto-Layout & Design Tokens Introduction',
      description: 'Walkthrough of creating modular components, padding systems, and mobile layouts in Figma.',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '15:30',
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
      status: 'Scheduled',
      createdBy: createdUsers['maya@skillswap.com']._id,
    });

    // 2. Completed Swap between Liam Johnson and Sophia Patel
    const swapRequestLiamSophia = await SwapRequest.create({
      senderId: createdUsers['liam@skillswap.com']._id,
      receiverId: createdUsers['sophia@skillswap.com']._id,
      offeredSkillId: liamReact._id,
      requestedSkillId: sophiaMarketing._id,
      message: 'Hi Sophia, I would love to trade React frontend tutoring for practical SEO and digital marketing strategy.',
      status: 'Completed',
    });

    const completedSwap = await Swap.create({
      requestId: swapRequestLiamSophia._id,
      participants: [
        createdUsers['liam@skillswap.com']._id,
        createdUsers['sophia@skillswap.com']._id,
      ],
      offeredSkill: liamReact._id,
      requestedSkill: sophiaMarketing._id,
      status: 'Completed',
      startedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Reviews for Completed Swap
    await Review.create({
      swapId: completedSwap._id,
      reviewerId: createdUsers['liam@skillswap.com']._id,
      revieweeId: createdUsers['sophia@skillswap.com']._id,
      rating: 5,
      comment: 'Sophia was an incredible mentor! She explained SEO strategies, keyword optimization, and audience funnels in a super actionable way.',
    });

    await Review.create({
      swapId: completedSwap._id,
      reviewerId: createdUsers['sophia@skillswap.com']._id,
      revieweeId: createdUsers['liam@skillswap.com']._id,
      rating: 5,
      comment: 'Liam is a patient and knowledgeable React instructor. He helped me understand component architecture and modern JSX effortlessly.',
    });

    // 3. Pending Swap Request from Elena to Alex
    await SwapRequest.create({
      senderId: createdUsers['elena@skillswap.com']._id,
      receiverId: createdUsers['alex@skillswap.com']._id,
      offeredSkillId: elenaSpanish._id,
      requestedSkillId: alexPython._id,
      message: 'Hola Alex! I saw that you want to learn Spanish and you teach Python. Would love to swap lessons with you!',
      status: 'Pending',
    });

    // Notifications for Alex
    await Notification.create({
      userId: createdUsers['alex@skillswap.com']._id,
      type: 'SWAP_REQUEST',
      title: 'New Skill Swap Request!',
      message: 'Elena Rodriguez sent you a swap request: "Spanish Conversation" for "Python Programming"',
      relatedId: alexPython._id,
    });

    console.log('Demo data successfully populated!');
    console.log('Available accounts:');
    console.log('  Admin: admin@skillswap.com / Admin@123456');
    console.log('  Alex Rivera: alex@skillswap.com / Password@123');
    console.log('  Maya Chen: maya@skillswap.com / Password@123');

    if (exitProcess) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding demo data:', error);
    if (exitProcess) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDemoData({ exitProcess: true });
}

module.exports = { seedDemoData };
