const request = require('supertest')
const mongoose = require('mongoose')
const { app } = require('../src/app')

// Mock postgres and redis for tests
jest.mock('../src/config/postgres', () => ({
  connectPostgres: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockResolvedValue({ rows: [{ balance: 10 }] }),
  getClient: jest.fn().mockReturnValue({
    query: jest.fn().mockResolvedValue({ rows: [{ balance: 10 }] }),
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
  getBalance: jest.fn().mockResolvedValue(10),
  TRANSACTION_TYPES: { SIGNUP_BONUS: 'signup_bonus' },
}))

jest.mock('../src/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}))

jest.mock('../src/services/notificationService', () => ({
  init: jest.fn(),
  registerUserSocket: jest.fn(),
  removeUserSocket: jest.fn(),
  createNotification: jest.fn(),
  notifyBookingConfirmed: jest.fn(),
  notifySessionCancelled: jest.fn(),
  notifyCreditsReceived: jest.fn(),
  notifyReviewReceived: jest.fn(),
}))

const TEST_USER = { name: 'Test User', email: `test${Date.now()}@test.com`, password: 'Password123' }
let accessToken = ''

beforeAll(async () => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/skillswap_test'
  process.env.JWT_SECRET = 'test-secret-key'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-key'
  process.env.JWT_EXPIRES_IN = '1h'
  process.env.NODE_ENV = 'test'
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(TEST_USER)
        .expect(201)

      expect(res.body.status).toBe('success')
      expect(res.body.data.user.email).toBe(TEST_USER.email)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.user.password).toBeUndefined()
      accessToken = res.body.data.accessToken
    })

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(TEST_USER)
        .expect(409)

      expect(res.body.status).toBe('fail')
    })

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...TEST_USER, password: '123', email: 'new@test.com' })
        .expect(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: TEST_USER.password })
        .expect(200)

      expect(res.body.status).toBe('success')
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_USER.email, password: 'wrongpassword' })
        .expect(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(res.body.data.user.email).toBe(TEST_USER.email)
    })

    it('should reject request without token', async () => {
      await request(app).get('/api/auth/me').expect(401)
    })
  })

  describe('Health check', () => {
    it('GET /health should return ok', async () => {
      const res = await request(app).get('/health').expect(200)
      expect(res.body.status).toBe('ok')
    })
  })
})
