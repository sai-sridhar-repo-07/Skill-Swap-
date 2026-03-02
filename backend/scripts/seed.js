/**
 * SkillSwap Seed Script
 * Creates admin user, two test users, and a sample session.
 *
 * Run: node backend/scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  const User = require('../src/models/User');

  // ── 1. Admin user ──────────────────────────────────────────────────────
  const adminEmail = 'admin@skillswap.io';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'Admin@1234',
      role: 'admin',
      isEmailVerified: true,
      bio: 'Platform administrator',
    });
    console.log('✅ Admin user created');
  } else {
    // Ensure role is admin and email verified
    admin.role = 'admin';
    admin.isEmailVerified = true;
    await admin.save({ validateBeforeSave: false });
    console.log('✅ Admin user updated');
  }

  // ── 2. User A (host — will create sessions) ───────────────────────────
  const userAEmail = 'priya@skillswap.io';
  let userA = await User.findOne({ email: userAEmail });
  if (!userA) {
    userA = await User.create({
      name: 'Priya Sharma',
      email: userAEmail,
      password: 'Test@1234',
      role: 'user',
      isEmailVerified: true,
      bio: 'Full-stack developer teaching React & Node.js',
      skillsOffered: [
        { name: 'React', level: 'Advanced', category: 'Programming' },
        { name: 'Node.js', level: 'Intermediate', category: 'Programming' },
      ],
      skillsWanted: [{ name: 'Machine Learning', level: 'Beginner', category: 'AI/ML' }],
    });
    console.log('✅ User A (host) created: priya@skillswap.io / Test@1234');
  } else {
    userA.isEmailVerified = true;
    await userA.save({ validateBeforeSave: false });
    console.log('✅ User A already exists, email verified');
  }

  // ── 3. User B (learner — will book sessions) ──────────────────────────
  const userBEmail = 'arjun@skillswap.io';
  let userB = await User.findOne({ email: userBEmail });
  if (!userB) {
    userB = await User.create({
      name: 'Arjun Patel',
      email: userBEmail,
      password: 'Test@1234',
      role: 'user',
      isEmailVerified: true,
      bio: 'Aspiring developer looking to learn React and web dev',
      skillsOffered: [{ name: 'Graphic Design', level: 'Intermediate', category: 'Design' }],
      skillsWanted: [{ name: 'React', level: 'Beginner', category: 'Programming' }],
    });
    console.log('✅ User B (learner) created: arjun@skillswap.io / Test@1234');
  } else {
    userB.isEmailVerified = true;
    await userB.save({ validateBeforeSave: false });
    console.log('✅ User B already exists, email verified');
  }

  // ── 4. Sample session hosted by User A ───────────────────────────────
  const Session = require('../src/models/Session');
  const existingSession = await Session.findOne({ hostId: userA._id });
  if (!existingSession) {
    const startTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const session = await Session.create({
      title: 'React Hooks Deep Dive — useState, useEffect & Custom Hooks',
      description: 'Learn React hooks in depth with live coding examples. We will cover useState, useEffect, useContext, and build custom hooks from scratch. Perfect for developers who know basic React and want to level up.',
      skillTag: 'React',
      level: 'Intermediate',
      category: 'Programming',
      duration: 60,
      creditCost: 5,
      maxSeats: 5,
      hostId: userA._id,
      status: 'upcoming',
      startTime,
    });
    await User.findByIdAndUpdate(userA._id, { $addToSet: { sessionsHosted: session._id } });
    console.log(`✅ Sample session created (ID: ${session._id})`);
  } else {
    console.log('✅ Sample session already exists');
  }

  // ── 5. Give both test users credits via PostgreSQL ─────────────────────
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });
    // Give each test user 50 credits (top up)
    for (const u of [userA, userB, admin]) {
      const bal = await pool.query('SELECT balance FROM credit_ledger WHERE user_id=$1', [u._id.toString()]);
      if (bal.rows.length === 0) {
        await pool.query(
          `INSERT INTO credit_ledger (user_id, balance) VALUES ($1, 50)
           ON CONFLICT (user_id) DO UPDATE SET balance = credit_ledger.balance + 50`,
          [u._id.toString()]
        );
        console.log(`✅ Credits added for ${u.email}`);
      } else {
        // Ensure they have at least 20
        if (bal.rows[0].balance < 20) {
          await pool.query('UPDATE credit_ledger SET balance = 50 WHERE user_id=$1', [u._id.toString()]);
          console.log(`✅ Credits topped up for ${u.email}`);
        } else {
          console.log(`✅ ${u.email} already has ${bal.rows[0].balance} credits`);
        }
      }
    }
    await pool.end();
  } catch (e) {
    console.warn('⚠️  PostgreSQL credit setup skipped (run migration first):', e.message);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  SKILLSWAP SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log('  ADMIN LOGIN');
  console.log('  Email:    admin@skillswap.io');
  console.log('  Password: Admin@1234');
  console.log('───────────────────────────────────────────────────');
  console.log('  USER A (Host / creates sessions)');
  console.log('  Email:    priya@skillswap.io');
  console.log('  Password: Test@1234');
  console.log('───────────────────────────────────────────────────');
  console.log('  USER B (Learner / books sessions)');
  console.log('  Email:    arjun@skillswap.io');
  console.log('  Password: Test@1234');
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(e => { console.error('Seed failed:', e); process.exit(1); });
