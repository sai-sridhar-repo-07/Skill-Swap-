const request = require('supertest')
const mongoose = require('mongoose')
const { app } = require('../src/app')

jest.mock('../src/config/postgres', () => ({
  connectPostgres: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockImplementation((text) => {
    if (text.includes('SUM')) return Promise.resolve({ rows: [{ balance: '50' }] })
    return Promise.resolve({ rows: [] })
  }),
  getClient: jest.fn().mockReturnValue({
    query: jest.fn().mockImplementation((text) => {
      if (text.includes('SUM')) return Promise.resolve({ rows: [{ balance: '50' }] })
      return Promise.resolve({ rows: [] })
    }),
    release: jest.fn(),
  }),
  pool: { end: jest.fn() },
}))

jest.mock('../src/config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(null),
  getRedis: jest.fn().mockReturnValue(null),
  cacheGet: jest.fn().mockResolvedValue(null),
  cacheSet: jest.fn().mockResolvedValue(null),
  cacheDel: jest.fn().mockResolvedValue(null),
}))

jest.mock('../src/services/creditService', () => ({
  initializeLedger: jest.fn().mockResolvedValue(true),
  signupBonus: jest.fn().mockResolvedValue(true),
  getBalance: jest.fn().mockResolvedValue(50),
  deductCredits: jest.fn().mockResolvedValue({ id: 'tx-1', amount: -5 }),
  refundCredits: jest.fn().mockResolvedValue(true),
  TRANSACTION_TYPES: { BOOKING: 'booking', TEACHING: 'teaching' },
}))

jest.mock('../src/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}))

jest.mock('../src/services/notificationService', () => ({
  init: jest.fn(), registerUserSocket: jest.fn(), removeUserSocket: jest.fn(),
  createNotification: jest.fn(), notifyBookingConfirmed: jest.fn(),
  notifySessionCancelled: jest.fn(), notifyCreditsReceived: jest.fn(), notifyReviewReceived: jest.fn(),
}))

let hostToken, learnerToken, sessionId

beforeAll(async () => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/skillswap_sessions_test'
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_REFRESH_SECRET = 'test-refresh'
  process.env.NODE_ENV = 'test'

  const host = await request(app).post('/api/auth/register')
    .send({ name: 'Host User', email: `host${Date.now()}@test.com`, password: 'Password123' })
  hostToken = host.body.data.accessToken

  const learner = await request(app).post('/api/auth/register')
    .send({ name: 'Learner', email: `learner${Date.now()}@test.com`, password: 'Password123' })
  learnerToken = learner.body.data.accessToken
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe('Sessions API', () => {
  describe('POST /api/sessions', () => {
    it('should create a session', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${hostToken}`)
        .send({
          title: 'React Hooks Deep Dive',
          description: 'Learn useState, useEffect and custom hooks in depth with real examples',
          skillTag: 'React',
          level: 'Intermediate',
          duration: 30,
          creditCost: 5,
          maxSeats: 5,
          sessionType: 'group',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201)

      expect(res.body.data.session.title).toBe('React Hooks Deep Dive')
      expect(res.body.data.session.creditCost).toBe(5)
      sessionId = res.body.data.session._id
    })

    it('should reject unauthenticated create', async () => {
      await request(app).post('/api/sessions').send({ title: 'Test' }).expect(401)
    })
  })

  describe('GET /api/sessions', () => {
    it('should list sessions', async () => {
      const res = await request(app).get('/api/sessions').expect(200)
      expect(res.body.data.sessions).toBeInstanceOf(Array)
    })

    it('should filter by skill tag', async () => {
      const res = await request(app).get('/api/sessions?skill=React').expect(200)
      expect(res.body.data.sessions.every((s) => s.skillTag.includes('React'))).toBe(true)
    })
  })

  describe('POST /api/sessions/:id/book', () => {
    it('should book a session', async () => {
      const res = await request(app)
        .post(`/api/sessions/${sessionId}/book`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(200)

      expect(res.body.status).toBe('success')
    })

    it('should prevent double booking', async () => {
      const res = await request(app)
        .post(`/api/sessions/${sessionId}/book`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(409)
    })
  })
})
