const { logger } = require('../utils/logger');

const SYSTEM_PROMPT = `You are SkillBot, the friendly AI assistant for SkillSwap — a peer-to-peer microlearning platform where people teach and learn skills using credits.

Key facts:
- Credits are the currency: learners spend credits to book sessions, teachers earn credits by hosting.
- New users get 10 free credits on signup.
- Teachers can subscribe monthly to unlock priority listing and analytics.
- Sessions are 15–60 minutes long, live video via WebRTC.
- Categories include coding, design, music, language, cooking, fitness, and more.

Be helpful, concise, and friendly. Answer questions about how the platform works, credits, bookings, teaching, and subscriptions. For non-platform questions, gently redirect to platform-related help.`;

const RULE_BASED = [
  { test: /credit|coin|balance|earn|spend|top.?up|recharge/i, reply: 'Credits are SkillSwap\'s currency! Learners spend credits to book sessions, and teachers earn them. You start with 10 free credits. You can buy more credit packs (10, 25, 50, or 100 credits) anytime from your Dashboard.' },
  { test: /book|join|attend|enroll/i, reply: 'To book a session: browse Sessions, click a card that interests you, then hit "Book Session". Credits are deducted instantly and refunded if the host cancels.' },
  { test: /host|teach|create|session/i, reply: 'To host a session: go to Dashboard → "Create Session", set your skill, duration (15–60 min), credit cost, and schedule. Teachers need an active subscription to appear in the featured listing.' },
  { test: /video|camera|mic|webrtc|room|connect/i, reply: 'SkillSwap uses live video via WebRTC — no plugins needed. Just allow camera/mic access in your browser when you join a session room. If video doesn\'t connect, try refreshing or switching browsers.' },
  { test: /refund|cancel|money.?back/i, reply: 'Credits are fully refunded if a host cancels or doesn\'t show up. Learner-initiated cancellations within 1 hour of the session start may not be refunded.' },
  { test: /subscri|teacher.?plan|monthly/i, reply: 'The Teacher Subscription ($5/month) unlocks priority search ranking, detailed analytics, and a verified badge. Subscribe from your Dashboard → "Subscribe to Teach".' },
  { test: /review|rating|feedback/i, reply: 'After a completed session you can leave a star rating and written review. Ratings affect the teacher\'s ranking in search results.' },
  { test: /price|cost|cheap|expensive|how much/i, reply: 'Each teacher sets their own credit cost per session (1–50 credits). Our credit packs start at just $2 for 10 credits. 1 credit ≈ $0.10–$0.20 depending on the pack size.' },
];

const ruleBasedReply = (message) => {
  for (const { test, reply } of RULE_BASED) {
    if (test.test(message)) return reply;
  }
  return 'I\'m here to help with anything about SkillSwap — credits, booking sessions, hosting, subscriptions, or video calls. What would you like to know?';
};

const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }
    const trimmed = message.trim().slice(0, 500);

    // Try Groq LLM if key is available
    if (process.env.GROQ_API_KEY) {
      try {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-10).map(({ role, content }) => ({ role, content: String(content).slice(0, 400) })),
          { role: 'user', content: trimmed },
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages,
            max_tokens: 300,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) return res.json({ reply });
        }
      } catch (err) {
        logger.warn(`Groq API failed, falling back to rule-based: ${err.message}`);
      }
    }

    // Fallback: rule-based responses
    res.json({ reply: ruleBasedReply(trimmed) });
  } catch (error) {
    logger.error('Chat controller error:', error.message);
    res.json({ reply: 'Sorry, I\'m having trouble right now. Please try again in a moment!' });
  }
};

module.exports = { chat };
