const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const generatePresentation = async () => {
  console.log('Generating SkillSwap 10-slide PowerPoint presentation...');

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  // Brand Colors
  const PRIMARY = '5145CD';   // Deep Indigo
  const SECONDARY = '8B5CF6'; // Violet
  const DARK_BG = '0F172A';   // Dark Slate
  const LIGHT_BG = 'F8FAFC';  // Light background
  const TEXT_DARK = '1E293B';
  const TEXT_MUTED = '64748B';
  const WHITE = 'FFFFFF';
  const ACCENT_GREEN = '10B981';

  // Helper for slide header
  const addHeader = (slide, title, category = 'SKILLSWAP PLATFORM PRESENTATION') => {
    // Top banner bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.1,
      fill: { color: PRIMARY },
    });

    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.15,
      fontSize: 10,
      fontFace: 'Arial',
      color: 'C7CCFE',
      bold: true,
      charSpacing: 2,
    });

    slide.addText(title, {
      x: 0.8,
      y: 0.45,
      fontSize: 22,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    // Decorative underline
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.05,
      w: 2.5,
      h: 0.05,
      fill: { color: SECONDARY },
    });

    // Slide footer
    slide.addText('SkillSwap – Learn One. Teach One. | College Team Project Evaluation', {
      x: 0.8,
      y: 7.1,
      fontSize: 9,
      fontFace: 'Arial',
      color: TEXT_MUTED,
    });
  };

  // ==========================================
  // SLIDE 1: Title Slide
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: DARK_BG };

    // Decorative shape
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 0.4,
      h: '100%',
      fill: { color: PRIMARY },
    });

    slide.addText('MERN STACK WEB APPLICATION', {
      x: 1.2,
      y: 1.5,
      fontSize: 14,
      fontFace: 'Arial',
      color: SECONDARY,
      bold: true,
      charSpacing: 3,
    });

    slide.addText('SkillSwap', {
      x: 1.2,
      y: 2.1,
      fontSize: 48,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    slide.addText('Learn One. Teach One.', {
      x: 1.2,
      y: 3.1,
      fontSize: 24,
      fontFace: 'Arial',
      color: '94A3B8',
      italic: true,
    });

    slide.addShape(pptx.ShapeType.rect, {
      x: 1.2,
      y: 3.7,
      w: 3.0,
      h: 0.04,
      fill: { color: PRIMARY },
    });

    slide.addText('A Peer-to-Peer Collaborative Knowledge Exchange Platform', {
      x: 1.2,
      y: 4.0,
      fontSize: 16,
      fontFace: 'Arial',
      color: 'CBD5E1',
    });

    // Team Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.2,
      y: 4.8,
      w: 11.0,
      h: 2.0,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('PROJECT TEAM DETAILS:', {
      x: 1.5,
      y: 5.0,
      fontSize: 12,
      fontFace: 'Arial',
      color: 'A5B4FC',
      bold: true,
    });

    slide.addText([
      { text: 'Team Name: ', options: { bold: true, color: WHITE } },
      { text: '[ENTER TEAM NAME]\n', options: { color: 'CBD5E1' } },
      { text: 'Member 1 (Frontend Lead): ', options: { bold: true, color: WHITE } },
      { text: '[NAME AND REGISTRATION NUMBER]\n', options: { color: 'CBD5E1' } },
      { text: 'Member 2 (Backend & API Lead): ', options: { bold: true, color: WHITE } },
      { text: '[NAME AND REGISTRATION NUMBER]\n', options: { color: 'CBD5E1' } },
      { text: 'Member 3 (Database & Real-time Integration): ', options: { bold: true, color: WHITE } },
      { text: '[NAME AND REGISTRATION NUMBER]', options: { color: 'CBD5E1' } },
    ], {
      x: 1.5,
      y: 5.3,
      w: 10.4,
      h: 1.4,
      fontSize: 11,
      fontFace: 'Arial',
    });
  }

  // ==========================================
  // SLIDE 2: Introduction & Problem Statement
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Introduction & Problem Statement', 'CONTEXT & MOTIVATION');

    // Problem Card (Left)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: 'FFF1F2' },
      line: { color: 'FECDD3', width: 1.5 },
      rectRadius: 0.1,
    });

    slide.addText('The Problem in Modern Learning', {
      x: 1.1,
      y: 1.8,
      fontSize: 16,
      fontFace: 'Arial',
      color: 'BE123C',
      bold: true,
    });

    slide.addText([
      { text: '• Financial Barriers to Education: ', options: { bold: true } },
      { text: 'Commercial courses and tutoring subscriptions are expensive and inaccessible for many students and self-learners.\n\n' },
      { text: '• Passive Learning Isolation: ', options: { bold: true } },
      { text: 'Pre-recorded video tutorials lack interactive peer accountability, personalized Q&A, and live hands-on practice.\n\n' },
      { text: '• Underutilized Peer Knowledge: ', options: { bold: true } },
      { text: 'Millions of learners possess valuable skills (coding, design, language, marketing) but have no direct barter mechanism to trade skills without monetary friction.\n\n' },
      { text: '• Unstructured Informal Swaps: ', options: { bold: true } },
      { text: 'Trading skills over social media forums lacks scheduling tools, verification, progress tracking, and credibility ratings.' },
    ], {
      x: 1.1,
      y: 2.3,
      w: 5.0,
      h: 4.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });

    // Solution Card (Right)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: 'F0FDF4' },
      line: { color: 'BBF7D0', width: 1.5 },
      rectRadius: 0.1,
    });

    slide.addText('The SkillSwap Solution', {
      x: 7.1,
      y: 1.8,
      fontSize: 16,
      fontFace: 'Arial',
      color: '15803D',
      bold: true,
    });

    slide.addText([
      { text: '• Zero Monetary Cost: ', options: { bold: true } },
      { text: 'Pure barter model founded on "Learn One. Teach One." where the currency is mutual time and expertise.\n\n' },
      { text: '• Smart Complementary Matching: ', options: { bold: true } },
      { text: 'Automated matching engine pairing User A (Offers Python, Wants UI/UX) directly with User B (Offers UI/UX, Wants Python).\n\n' },
      { text: '• End-to-End Learning Workflow: ', options: { bold: true } },
      { text: 'Structured journey from discovery, request negotiation, real-time chat, session scheduling with video links, to verified reviews.\n\n' },
      { text: '• Community Trust & Reputation: ', options: { bold: true } },
      { text: '1–5 star peer ratings, feedback verification, and administrative moderation to ensure safe learning.' },
    ], {
      x: 7.1,
      y: 2.3,
      w: 5.0,
      h: 4.2,
      fontSize: 11,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });
  }

  // ==========================================
  // SLIDE 3: Project Objectives
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Project Objectives & Scope', 'STRATEGIC GOALS');

    const objectives = [
      { num: '01', title: 'Peer-to-Peer Barter Engine', desc: 'Eliminate all monetary transactions by facilitating seamless 1:1 barter exchanges between knowledge seekers.' },
      { num: '02', title: 'Automated Skill Matching', desc: 'Implement an algorithmic scoring mechanism calculating compatibility based on reciprocal skills, categories, and proficiency levels.' },
      { num: '03', title: 'Integrated Learning Lifecycle', desc: 'Provide end-to-end management of swap requests, active collaboration states, calendar session scheduling, and completion.' },
      { num: '04', title: 'Real-Time Synchronous Chat', desc: 'Deliver private, instantaneous messaging using Socket.IO WebSockets with database persistence and typing indicators.' },
      { num: '05', title: 'Trust & Reputation System', desc: 'Incentivize quality instruction through verified post-swap reviews, 1-5 star ratings, and transparent user profiles.' },
      { num: '06', title: 'Enterprise Role-Based Security', desc: 'Secure the application with JWT authentication, bcrypt hashing, rate limiting, and an administrative moderation panel.' },
    ];

    objectives.forEach((obj, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 3.9;
      const y = 1.6 + row * 2.6;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 3.6,
        h: 2.3,
        fill: { color: WHITE },
        line: { color: 'E2E8F0', width: 1.5 },
        rectRadius: 0.1,
      });

      // Number badge
      slide.addShape(pptx.ShapeType.rect, {
        x: x + 0.2,
        y: y + 0.2,
        w: 0.7,
        h: 0.4,
        fill: { color: PRIMARY },
      });

      slide.addText(obj.num, {
        x: x + 0.2,
        y: y + 0.2,
        w: 0.7,
        h: 0.4,
        fontSize: 12,
        fontFace: 'Arial',
        color: WHITE,
        bold: true,
        align: 'center',
      });

      slide.addText(obj.title, {
        x: x + 0.2,
        y: y + 0.75,
        w: 3.2,
        fontSize: 13,
        fontFace: 'Arial',
        color: PRIMARY,
        bold: true,
      });

      slide.addText(obj.desc, {
        x: x + 0.2,
        y: y + 1.2,
        w: 3.2,
        h: 0.9,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_MUTED,
      });
    });
  }

  // ==========================================
  // SLIDE 4: Technologies & Tools Used
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Technology Stack & Architecture Tools', 'FULL-STACK MERN');

    const stackItems = [
      {
        layer: 'Frontend Layer',
        color: '3B82F6',
        techs: [
          '• React.js (Vite Tooling): Fast rendering & HMR',
          '• Tailwind CSS: Utility-first responsive design',
          '• React Router DOM v6: Client-side dynamic routing',
          '• React Context API: Global auth, theme & alerts',
          '• Axios: Promise-based HTTP client with interceptors',
          '• Lucide React: Modern accessible vector iconography',
        ]
      },
      {
        layer: 'Backend API Layer',
        color: PRIMARY,
        techs: [
          '• Node.js & Express.js: Scalable RESTful API',
          '• Socket.IO: Real-time bi-directional WebSockets',
          '• JWT & bcryptjs: Token authorization & hashing',
          '• Express Rate Limit: Protection on auth routes',
          '• Helmet & CORS: HTTP header hardening',
          '• Express Validator: Request payload sanitization',
        ]
      },
      {
        layer: 'Data & DevOps Layer',
        color: '10B981',
        techs: [
          '• MongoDB Atlas: Distributed cloud NoSQL database',
          '• Mongoose ODM: Schemas, validations & relations',
          '• Render: Production cloud backend hosting',
          '• Vercel: Edge frontend distribution & rewrites',
          '• Git & GitHub: Branching, pull requests & CI/CD',
          '• In-Memory DB Engine: Zero-setup dev fallback',
        ]
      }
    ];

    stackItems.forEach((item, idx) => {
      const x = 0.8 + idx * 3.9;
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 1.6,
        w: 3.6,
        h: 5.1,
        fill: { color: WHITE },
        line: { color: item.color, width: 2 },
        rectRadius: 0.1,
      });

      slide.addShape(pptx.ShapeType.rect, {
        x,
        y: 1.6,
        w: 3.6,
        h: 0.7,
        fill: { color: item.color },
      });

      slide.addText(item.layer, {
        x,
        y: 1.75,
        w: 3.6,
        fontSize: 14,
        fontFace: 'Arial',
        color: WHITE,
        bold: true,
        align: 'center',
      });

      slide.addText(item.techs.join('\n\n'), {
        x: x + 0.25,
        y: 2.5,
        w: 3.1,
        h: 4.0,
        fontSize: 11,
        fontFace: 'Arial',
        color: TEXT_DARK,
      });
    });
  }

  // ==========================================
  // SLIDE 5: System Architecture & Workflow
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'System Architecture & Complete Workflow', 'SYSTEM DESIGN');

    // Architecture description box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 11.6,
      h: 2.2,
      fill: { color: 'F1F5F9' },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Three-Tier Client-Server Architecture Overview', {
      x: 1.1,
      y: 1.7,
      fontSize: 13,
      fontFace: 'Arial',
      color: PRIMARY,
      bold: true,
    });

    slide.addText(
      'Client Browser (React SPA + Tailwind CSS)\n' +
      '       ↓  HTTPS / REST APIs (Axios)        ↕  WSS / Socket.IO Events\n' +
      'Express.js Node Backend API (Controllers, Auth Middleware, JWT Validation, Rate Limiter)\n' +
      '       ↓  Mongoose ODM (ObjectId References, Compound Indexes, Transactions)\n' +
      'MongoDB Atlas Cloud Cluster (Users, Skills, Swaps, Sessions, Messages, Reviews, Notifications)',
      {
        x: 1.1,
        y: 2.1,
        w: 11.0,
        h: 1.4,
        fontSize: 11,
        fontFace: 'Courier New',
        color: TEXT_DARK,
      }
    );

    // Lifecycle workflow steps
    slide.addText('End-to-End Skill Barter Lifecycle:', {
      x: 0.8,
      y: 3.9,
      fontSize: 13,
      fontFace: 'Arial',
      color: TEXT_DARK,
      bold: true,
    });

    const workflowSteps = [
      { step: 'Step 1', title: 'Profile & Skills', desc: 'User registers, lists skills offered to teach and skills wanted to learn.' },
      { step: 'Step 2', title: 'Algorithm Match', desc: 'Engine computes match percentage and highlights mutual trade opportunities.' },
      { step: 'Step 3', title: 'Swap Proposal', desc: 'User transmits formal swap request specifying offered vs requested skills.' },
      { step: 'Step 4', title: 'Acceptance & Active', desc: 'Recipient accepts proposal; system initiates Active Swap & enables chat.' },
      { step: 'Step 5', title: 'Live Sessions', desc: 'Participants coordinate timetable, schedule sessions & join video meets.' },
      { step: 'Step 6', title: 'Review & Complete', desc: 'Swap is marked Complete; participants exchange 1-5 star verified reviews.' },
    ];

    workflowSteps.forEach((ws, idx) => {
      const x = 0.8 + idx * 1.95;
      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y: 4.3,
        w: 1.8,
        h: 2.4,
        fill: { color: WHITE },
        line: { color: PRIMARY, width: 1 },
        rectRadius: 0.1,
      });

      slide.addShape(pptx.ShapeType.rect, {
        x,
        y: 4.3,
        w: 1.8,
        h: 0.4,
        fill: { color: PRIMARY },
      });

      slide.addText(ws.step, {
        x,
        y: 4.38,
        w: 1.8,
        fontSize: 10,
        fontFace: 'Arial',
        color: WHITE,
        bold: true,
        align: 'center',
      });

      slide.addText(ws.title, {
        x: x + 0.1,
        y: 4.8,
        w: 1.6,
        fontSize: 10,
        fontFace: 'Arial',
        color: PRIMARY,
        bold: true,
        align: 'center',
      });

      slide.addText(ws.desc, {
        x: x + 0.1,
        y: 5.4,
        w: 1.6,
        fontSize: 9,
        fontFace: 'Arial',
        color: TEXT_MUTED,
        align: 'center',
      });
    });
  }

  // ==========================================
  // SLIDE 6: Features and Functionalities
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Platform Features & Functional Modules', 'CAPABILITIES');

    const features = [
      {
        title: 'Complementary Matching Algorithm',
        desc: 'Deterministic formula analyzing two-way reciprocal skills (60%), one-way needs (35%), exact name matches, proficiency hierarchy, and verified profile metrics.'
      },
      {
        title: 'Real-time WebSocket Messaging',
        desc: 'Private Socket.IO messaging restricted strictly to active swap participants with online/offline indicators, typing notifications, and persistent MongoDB chat history.'
      },
      {
        title: 'Learning Session Scheduler',
        desc: 'Integrated booking tool with meeting URL integration, chronological validation (end time > start time), date pickers, and automated calendar notifications.'
      },
      {
        title: 'Verified Reviews & Rating Engine',
        desc: 'Reputation system calculating average star rating (1–5) and score distributions, guarded by unique constraints to eliminate duplicate or fraudulent reviews.'
      },
      {
        title: 'Modern UI/UX with Dual Themes',
        desc: '18 accessible pages built with Tailwind CSS, Deep Indigo identity (#5145CD), smooth transitions, toast alerts, loading skeletons, and instant Dark/Light mode toggle.'
      },
      {
        title: 'Role-Based Admin Moderation Panel',
        desc: 'Administrative suite featuring real-time platform statistics, user search, account suspension/reactivation, and community skill content removal.'
      },
    ];

    features.forEach((feat, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.9;
      const y = 1.6 + row * 1.75;

      slide.addShape(pptx.ShapeType.roundRect, {
        x,
        y,
        w: 5.6,
        h: 1.55,
        fill: { color: WHITE },
        line: { color: 'E2E8F0', width: 1.5 },
        rectRadius: 0.1,
      });

      slide.addText(feat.title, {
        x: x + 0.3,
        y: y + 0.2,
        w: 5.0,
        fontSize: 12,
        fontFace: 'Arial',
        color: PRIMARY,
        bold: true,
      });

      slide.addText(feat.desc, {
        x: x + 0.3,
        y: y + 0.55,
        w: 5.0,
        h: 0.9,
        fontSize: 10,
        fontFace: 'Arial',
        color: TEXT_MUTED,
      });
    });
  }

  // ==========================================
  // SLIDE 7: Database Design and API Integration
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Database Design & REST API Endpoints', 'DATA & API SPECIFICATION');

    // DB Schema Table (Left)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('MongoDB Collections & Relationships', {
      x: 1.0,
      y: 1.7,
      fontSize: 13,
      fontFace: 'Arial',
      color: PRIMARY,
      bold: true,
    });

    slide.addText([
      { text: '• User: ', options: { bold: true } },
      { text: 'name, email (unique), password (hash), bio, role (user/admin), isActive, interests.\n' },
      { text: '• Skill: ', options: { bold: true } },
      { text: 'userId (ref), skillName, category (17 types), skillType (Offer/Want), proficiencyLevel.\n' },
      { text: '• SwapRequest: ', options: { bold: true } },
      { text: 'senderId, receiverId, offeredSkillId, requestedSkillId, status, message.\n' },
      { text: '• Swap: ', options: { bold: true } },
      { text: 'requestId (unique), participants (2 Users), offeredSkill, requestedSkill, status (Active/Completed).\n' },
      { text: '• Message: ', options: { bold: true } },
      { text: 'swapId, senderId, receiverId, message, readAt, timestamps.\n' },
      { text: '• Session: ', options: { bold: true } },
      { text: 'swapId, title, scheduledDate, startTime, endTime, meetingLink, status.\n' },
      { text: '• Review: ', options: { bold: true } },
      { text: 'swapId, reviewerId, revieweeId, rating (1-5), comment [Unique index on swapId + reviewerId].\n' },
      { text: '• Notification: ', options: { bold: true } },
      { text: 'userId, type, title, message, relatedId, isRead.' },
    ], {
      x: 1.0,
      y: 2.1,
      w: 5.2,
      h: 4.4,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });

    // REST APIs (Right)
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Core REST API Modules (HTTP Methods)', {
      x: 7.0,
      y: 1.7,
      fontSize: 13,
      fontFace: 'Arial',
      color: PRIMARY,
      bold: true,
    });

    slide.addText([
      { text: 'Authentication & Profile:\n', options: { bold: true, color: SECONDARY } },
      { text: 'POST /api/auth/register, POST /api/auth/login, GET /api/auth/me\nPUT /api/users/profile, PUT /api/users/change-password\n\n' },
      { text: 'Skills & Discovery Engine:\n', options: { bold: true, color: SECONDARY } },
      { text: 'POST /api/skills, GET /api/skills, GET /api/skills/my-skills, PUT /api/skills/:id\nGET /api/matches (Deterministic complementary matches)\n\n' },
      { text: 'Swap Lifecycle & Collaboration:\n', options: { bold: true, color: SECONDARY } },
      { text: 'POST /api/swaps/request, GET /api/swaps/active, PUT /api/swaps/:id/accept\nPUT /api/swaps/:id/complete, GET /api/messages/:swapId\n\n' },
      { text: 'Sessions, Reviews & Administration:\n', options: { bold: true, color: SECONDARY } },
      { text: 'POST /api/sessions, GET /api/sessions, POST /api/reviews\nGET /api/admin/dashboard, PUT /api/admin/users/:id/status' },
    ], {
      x: 7.0,
      y: 2.1,
      w: 5.2,
      h: 4.4,
      fontSize: 10,
      fontFace: 'Courier New',
      color: TEXT_DARK,
    });
  }

  // ==========================================
  // SLIDE 8: UI Design & User Experience
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'UI/UX Design System & Application Pages', 'USER INTERFACE');

    // Design Highlights Box
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 11.6,
      h: 1.3,
      fill: { color: 'EEF2FF' },
      line: { color: 'C7D2FE', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Design Identity: Modern SaaS Collaboration Platform', {
      x: 1.0,
      y: 1.65,
      fontSize: 12,
      fontFace: 'Arial',
      color: PRIMARY,
      bold: true,
    });

    slide.addText(
      '• Palette: Deep Indigo (#5145CD), Soft Violet (#8B5CF6), Clean Background (#F8FAFC), Dark Slate (#0F172A)\n' +
      '• Typography & Feedback: Inter Variable Sans, Responsive Grid, Toast Alerts, Modal Dialogs, Skeleton Loaders',
      {
        x: 1.0,
        y: 1.95,
        w: 11.0,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: TEXT_DARK,
      }
    );

    // List of 18 Developed Pages
    const pages = [
      '1. Landing Page (Hero, Features, Barter Demo)',
      '2. Registration Page (Client & Server Validation)',
      '3. Login Page (JWT Security & Rate Limiting)',
      '4. User Dashboard (Metrics, Requests, Quick Actions)',
      '5. Explore Skills (Search, Category Filters, Sort)',
      '6. Skill Details (Instructor Info, Bio & Reviews)',
      '7. My Profile (Public View, Skills & Ratings)',
      '8. Edit Profile (Bio, Location, Avatar, Password)',
      '9. Manage My Skills (Add/Edit/Delete Offer & Want)',
      '10. Skill Matches (Mutual Barter Scoring Engine)',
      '11. Swap Requests (Sent, Received, Accept/Reject)',
      '12. Active Swaps (Active Partners & Progress)',
      '13. Messages (Socket.IO Real-Time Chat & History)',
      '14. Session Scheduler (Meetings & Time Validation)',
      '15. Reviews & Ratings (1–5 Star Verified Feedback)',
      '16. Notifications (In-App Badges & Mark As Read)',
      '17. Admin Dashboard (Platform KPIs & Moderation)',
      '18. 404 Not Found Page (Friendly Return Navigation)',
    ];

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 3.0,
      w: 11.6,
      h: 3.7,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Complete Suite of 18 Fully Functional Responsive Pages:', {
      x: 1.0,
      y: 3.2,
      fontSize: 12,
      fontFace: 'Arial',
      color: PRIMARY,
      bold: true,
    });

    // 2 columns of pages
    slide.addText(pages.slice(0, 9).join('\n'), {
      x: 1.0,
      y: 3.6,
      w: 5.5,
      h: 2.9,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });

    slide.addText(pages.slice(9, 18).join('\n'), {
      x: 6.8,
      y: 3.6,
      w: 5.5,
      h: 2.9,
      fontSize: 10,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });
  }

  // ==========================================
  // SLIDE 9: Challenges Faced & Future Scope
  // ==========================================
  {
    const slide = pptx.addSlide();
    addHeader(slide, 'Engineering Challenges & Future Scope', 'ANALYSIS & ROADMAP');

    // Challenges Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: 'F59E0B', width: 1.5 },
      rectRadius: 0.1,
    });

    slide.addText('Engineering Challenges Resolved', {
      x: 1.1,
      y: 1.8,
      fontSize: 14,
      fontFace: 'Arial',
      color: 'D97706',
      bold: true,
    });

    slide.addText([
      { text: '• Deterministic Matching Complexity: ', options: { bold: true } },
      { text: 'Preventing duplicate matches while computing multi-criteria compatibility across reciprocal skills, proficiencies, and categories.\n\n' },
      { text: '• WebSocket Authorization Boundary: ', options: { bold: true } },
      { text: 'Ensuring Socket.IO connections enforce JWT authentication and verify that only verified participants of an active swap can enter room communications.\n\n' },
      { text: '• Chronological Time Validation: ', options: { bold: true } },
      { text: 'Enforcing strict validation to verify session end times occur after start times and avoiding cross-timezone scheduling anomalies.\n\n' },
      { text: '• Data Integrity & Duplicate Reviews: ', options: { bold: true } },
      { text: 'Using compound unique indexes to guarantee each participant can submit exactly one review per completed swap exchange.' },
    ], {
      x: 1.1,
      y: 2.2,
      w: 5.0,
      h: 4.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });

    // Future Scope Card
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: WHITE },
      line: { color: PRIMARY, width: 1.5 },
      rectRadius: 0.1,
    });

    slide.addText('Future Enhancements Roadmap', {
      x: 7.1,
      y: 1.8,
      fontSize: 14,
      fontFace: 'Arial',
      color: PRIMARY,
      bold: true,
    });

    slide.addText([
      { text: '• Native WebRTC Video Conferencing: ', options: { bold: true } },
      { text: 'Integrate in-browser peer-to-peer audio/video streaming, screen sharing, and recording directly inside learning session rooms.\n\n' },
      { text: '• Multi-Party Study Circles: ', options: { bold: true } },
      { text: 'Expand beyond 1:1 barter to support group study rooms, workshops, and group skill circles.\n\n' },
      { text: '• AI-Assisted Skill Syllabus Generator: ', options: { bold: true } },
      { text: 'Incorporate LLM-driven generation of customized weekly lesson plans based on swapped skill proficiencies.\n\n' },
      { text: '• Mobile Apps via React Native: ', options: { bold: true } },
      { text: 'Deploy native iOS and Android versions with push notifications for swap requests and session reminders.' },
    ], {
      x: 7.1,
      y: 2.2,
      w: 5.0,
      h: 4.3,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: TEXT_DARK,
    });
  }

  // ==========================================
  // SLIDE 10: Conclusion & Evaluation Summary
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: DARK_BG };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.1,
      fill: { color: PRIMARY },
    });

    slide.addText('PROJECT EVALUATION CONCLUSION', {
      x: 0.8,
      y: 0.15,
      fontSize: 10,
      fontFace: 'Arial',
      color: 'C7CCFE',
      bold: true,
      charSpacing: 2,
    });

    slide.addText('SkillSwap: Learn One. Teach One.', {
      x: 0.8,
      y: 0.45,
      fontSize: 22,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
    });

    // Content container
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 11.6,
      h: 4.5,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1.5 },
      rectRadius: 0.1,
    });

    slide.addText('Key Takeaways & Project Outcomes:', {
      x: 1.2,
      y: 1.8,
      fontSize: 14,
      fontFace: 'Arial',
      color: SECONDARY,
      bold: true,
    });

    slide.addText([
      { text: '✓ Complete Full-Stack Implementation: ', options: { bold: true, color: WHITE } },
      { text: 'Built a real production MERN web application with 0% hardcoded dummy data; all 18 pages operate on real database state.\n\n', options: { color: 'CBD5E1' } },
      { text: '✓ Verified Skill Barter Economy: ', options: { bold: true, color: WHITE } },
      { text: 'Successfully eliminated financial barriers by connecting learners through an intelligent mutual skill matching engine.\n\n', options: { color: 'CBD5E1' } },
      { text: '✓ Real-time Synchronization: ', options: { bold: true, color: WHITE } },
      { text: 'Combined REST API persistence with Socket.IO WebSockets to provide smooth real-time chat and live notifications.\n\n', options: { color: 'CBD5E1' } },
      { text: '✓ Production & Deployment Readiness: ', options: { bold: true, color: WHITE } },
      { text: 'Configured for Vercel (Frontend), Render (Backend), and MongoDB Atlas with automated test suites and seed scripts.', options: { color: 'CBD5E1' } },
    ], {
      x: 1.2,
      y: 2.2,
      w: 10.8,
      h: 3.5,
      fontSize: 12,
      fontFace: 'Arial',
    });

    // Thank you text
    slide.addText('Thank You! Questions & Live Demonstration Welcome.', {
      x: 0.8,
      y: 6.3,
      w: 11.6,
      fontSize: 14,
      fontFace: 'Arial',
      color: WHITE,
      bold: true,
      align: 'center',
    });
  }

  // Ensure target directory exists
  const outputDir = path.resolve(__dirname, '../../docs/presentation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'SkillSwap_Project_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`PowerPoint presentation successfully saved at: ${outputPath}`);
};

generatePresentation().catch((err) => {
  console.error('Failed to generate presentation:', err);
  process.exit(1);
});
