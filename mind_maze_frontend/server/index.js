'use strict';

/**
 * Lightweight Express API that proxies to Supabase using a service role key (server-side only).
 * Security:
 * - Do NOT expose SUPABASE_SERVICE_ROLE_KEY to the client.
 * - Validate and sanitize all inputs.
 * - Only return minimal data fields; never return secrets or internal errors.
 *
 * Env (server-side):
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (server only)
 * - API_PORT: Optional, defaults to 4000
 * - API_TRUST_PROXY: Optional "true" to set trust proxy
 * - NODE_ENV: Optional env
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');

// Helpers
function env(name, fallback = '') {
  return process.env[name] || fallback;
}
function toBool(v) {
  return String(v || '').toLowerCase() === 'true';
}
function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}
function sanitizeString(v, max = 1024) {
  if (typeof v !== 'string') return '';
  const stripped = v.replace(/<[^>]*>?/gm, '').trim();
  return stripped.slice(0, max);
}

const SUPABASE_URL = env('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = env('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[API] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. API will start but endpoints will error.');
}

const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

const app = express();

// Security middleware
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false, // relax for simplicity; can be tuned
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cors({
  origin: true, // allow dev clients; restrict in production as needed
  credentials: false,
}));
app.use(express.json({ limit: '256kb' }));

if (toBool(env('API_TRUST_PROXY'))) {
  app.set('trust proxy', 1);
}

// Basic health
// PUBLIC_INTERFACE
app.get('/health', (req, res) => {
  /** Health check endpoint: returns { status, env } with non-sensitive info. */
  return res.json({
    status: 'ok',
    env: {
      node: process.version,
      apiEnv: env('NODE_ENV', 'development'),
    },
  });
});

function requireAdmin(res) {
  if (!supabaseAdmin) {
    res.status(500).json({ error: { message: 'Server not configured' } });
    return false;
  }
  return true;
}

// --- Quizzes ---
// PUBLIC_INTERFACE
app.get('/api/quizzes', async (req, res) => {
  /** List quizzes. Optional query onlyPublic=true|false */
  if (!requireAdmin(res)) return;
  try {
    const onlyPublic = String(req.query.onlyPublic ?? 'true').toLowerCase() !== 'false';
    let q = supabaseAdmin.from('quizzes').select('*').order('created_at', { ascending: false });
    if (onlyPublic) q = q.eq('is_public', true);
    const { data, error } = await q;
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data: data || [] });
  } catch (e) {
    return res.status(500).json({ error: { message: 'Failed to list quizzes' } });
  }
});

// PUBLIC_INTERFACE
app.get('/api/quizzes/:id', async (req, res) => {
  /** Get quiz by id */
  if (!requireAdmin(res)) return;
  const id = sanitizeString(req.params.id, 64);
  try {
    const { data, error } = await supabaseAdmin.from('quizzes').select('*').eq('id', id).maybeSingle();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to fetch quiz' } });
  }
});

// PUBLIC_INTERFACE
app.post('/api/quizzes', async (req, res) => {
  /** Create a new quiz: { title, description?, is_public? } */
  if (!requireAdmin(res)) return;
  const title = sanitizeString(req.body?.title, 200);
  const description = sanitizeString(req.body?.description || '', 2000);
  const is_public = Boolean(req.body?.is_public);
  if (!title) return res.status(400).json({ error: { message: 'title is required' } });

  try {
    const { data, error } = await supabaseAdmin.from('quizzes').insert({ title, description, is_public }).select('*').single();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.status(201).json({ data });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to create quiz' } });
  }
});

// PUBLIC_INTERFACE
app.patch('/api/quizzes/:id', async (req, res) => {
  /** Update quiz: partial fields { title?, description?, is_public? } */
  if (!requireAdmin(res)) return;
  const id = sanitizeString(req.params.id, 64);
  const patch = {};
  if (req.body?.title !== undefined) patch.title = sanitizeString(req.body.title, 200);
  if (req.body?.description !== undefined) patch.description = sanitizeString(req.body.description, 2000);
  if (req.body?.is_public !== undefined) patch.is_public = Boolean(req.body.is_public);

  try {
    const { data, error } = await supabaseAdmin.from('quizzes').update(patch).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to update quiz' } });
  }
});

// --- Questions ---
// PUBLIC_INTERFACE
app.get('/api/quizzes/:quiz_id/questions', async (req, res) => {
  /** List questions for a quiz ordered by order_index */
  if (!requireAdmin(res)) return;
  const quiz_id = sanitizeString(req.params.quiz_id, 64);
  try {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz_id)
      .order('order_index', { ascending: true });
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data: data || [] });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to list questions' } });
  }
});

// PUBLIC_INTERFACE
app.post('/api/quizzes/:quiz_id/questions', async (req, res) => {
  /** Create a question: { text, answers: string[], seconds?, order_index? } */
  if (!requireAdmin(res)) return;
  const quiz_id = sanitizeString(req.params.quiz_id, 64);
  const text = sanitizeString(req.body?.text, 2000);
  const seconds = clamp(Number(req.body?.seconds ?? 30), 5, 600);
  const order_index = Math.max(0, Number(req.body?.order_index ?? 0));
  let answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  answers = answers
    .filter(s => typeof s === 'string' && s.trim().length > 0)
    .map(s => sanitizeString(s, 200));

  if (!text) return res.status(400).json({ error: { message: 'text is required' } });
  if (!answers.length) return res.status(400).json({ error: { message: 'at least one answer required' } });

  try {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert({ quiz_id, text, answers_json: answers, seconds, order_index })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.status(201).json({ data });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to create question' } });
  }
});

// PUBLIC_INTERFACE
app.patch('/api/questions/:id', async (req, res) => {
  /** Update a question by id */
  if (!requireAdmin(res)) return;
  const id = sanitizeString(req.params.id, 64);
  const patch = {};
  if (req.body?.text !== undefined) patch.text = sanitizeString(req.body.text, 2000);
  if (req.body?.seconds !== undefined) patch.seconds = clamp(Number(req.body.seconds), 5, 600);
  if (req.body?.order_index !== undefined) patch.order_index = Math.max(0, Number(req.body.order_index) || 0);
  if (req.body?.answers !== undefined) {
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    patch.answers_json = answers
      .filter(s => typeof s === 'string' && s.trim().length > 0)
      .map(s => sanitizeString(s, 200));
  }
  try {
    const { data, error } = await supabaseAdmin.from('questions').update(patch).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to update question' } });
  }
});

// --- Answers (attempt log) ---
// PUBLIC_INTERFACE
app.post('/api/answers', async (req, res) => {
  /**
   * Record answer: { user_id?, anon_id?, quiz_id, question_id, answer_text, is_correct }
   * Either user_id or anon_id is required.
   * Validation aligns with schema: answer_text must be non-empty, ids are sanitized.
   */
  if (!requireAdmin(res)) return;

  // Basic UUID-ish check to avoid obvious bad payloads (not strict)
  const isUuidish = (v) => typeof v === 'string' && v.length >= 16 && v.length <= 64;

  const rawUserId = typeof req.body?.user_id === 'string' ? req.body.user_id : null;
  const rawAnonId = rawUserId ? null : (typeof req.body?.anon_id === 'string' ? req.body.anon_id : null);

  const payload = {
    user_id: rawUserId ? sanitizeString(rawUserId, 64) : null,
    anon_id: rawUserId ? null : (rawAnonId ? sanitizeString(rawAnonId, 128) : null),
    quiz_id: sanitizeString(req.body?.quiz_id, 64),
    question_id: sanitizeString(req.body?.question_id, 64),
    answer_text: sanitizeString(req.body?.answer_text || '', 512),
    is_correct: Boolean(req.body?.is_correct),
  };

  // Input validation with helpful messages
  if (!payload.quiz_id || !isUuidish(payload.quiz_id)) {
    return res.status(400).json({ error: { message: 'quiz_id required (uuid)' } });
  }
  if (!payload.question_id || !isUuidish(payload.question_id)) {
    return res.status(400).json({ error: { message: 'question_id required (uuid)' } });
  }
  if (!payload.user_id && !payload.anon_id) {
    return res.status(400).json({ error: { message: 'user_id or anon_id required' } });
  }
  if (payload.anon_id !== null && payload.anon_id.trim().length === 0) {
    return res.status(400).json({ error: { message: 'anon_id must be a non-empty string when provided' } });
  }
  if (!payload.answer_text || payload.answer_text.trim().length === 0) {
    return res.status(400).json({ error: { message: 'answer_text required' } });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('answers')
      .insert(payload)
      .select('*')
      .single();
    if (error) {
      // Surface supabase constraint messages succinctly
      return res.status(400).json({ error: { message: error.message } });
    }
    return res.status(201).json({ data });
  } catch (e) {
    return res.status(500).json({ error: { message: 'Failed to record answer' } });
  }
});

// PUBLIC_INTERFACE
app.get('/api/answers', async (req, res) => {
  /** List answers by quiz and identity. Query: quiz_id, user_id? or anon_id? */
  if (!requireAdmin(res)) return;
  const quiz_id = sanitizeString(req.query.quiz_id, 64);
  const user_id = req.query.user_id ? sanitizeString(req.query.user_id, 64) : null;
  const anon_id = user_id ? null : (req.query.anon_id ? sanitizeString(req.query.anon_id, 128) : null);
  if (!quiz_id) return res.status(400).json({ error: { message: 'quiz_id required' } });
  if (!user_id && !anon_id) return res.status(400).json({ error: { message: 'user_id or anon_id required' } });

  try {
    let q = supabaseAdmin.from('answers').select('*').eq('quiz_id', quiz_id).order('created_at', { ascending: true });
    if (user_id) q = q.eq('user_id', user_id);
    else q = q.eq('anon_id', anon_id);
    const { data, error } = await q;
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data: data || [] });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to fetch answers' } });
  }
});

// --- Scores / Progress ---
// PUBLIC_INTERFACE
app.get('/api/score', async (req, res) => {
  /** Get score/progress row. Query: user_id? or anon_id? */
  if (!requireAdmin(res)) return;
  const user_id = req.query.user_id ? sanitizeString(req.query.user_id, 64) : null;
  const anon_id = user_id ? null : (req.query.anon_id ? sanitizeString(req.query.anon_id, 128) : null);
  if (!user_id && !anon_id) return res.status(400).json({ error: { message: 'user_id or anon_id required' } });
  try {
    let q = supabaseAdmin.from('scores').select('*').limit(1);
    if (user_id) q = q.eq('user_id', user_id);
    else q = q.eq('anon_id', anon_id);
    const { data, error } = await q.maybeSingle();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data: data ?? null });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to fetch score' } });
  }
});

// PUBLIC_INTERFACE
app.post('/api/score', async (req, res) => {
  /** Upsert score/progress row by user_id or anon_id */
  if (!requireAdmin(res)) return;
  const user_id = req.body?.user_id ? sanitizeString(req.body.user_id, 64) : null;
  const anon_id = user_id ? null : (req.body?.anon_id ? sanitizeString(req.body.anon_id, 128) : null);
  if (!user_id && !anon_id) return res.status(400).json({ error: { message: 'user_id or anon_id required' } });
  const payload = {
    user_id,
    anon_id,
    score: Math.max(0, Number(req.body?.score ?? 0)),
    level: Math.max(1, Number(req.body?.level ?? 1)),
    lives: Math.max(0, Number(req.body?.lives ?? 3)),
  };
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .upsert(payload, { onConflict: user_id ? 'user_id' : 'anon_id' })
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.status(201).json({ data });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to upsert score' } });
  }
});

// --- Leaderboard ---
// PUBLIC_INTERFACE
app.get('/api/leaderboard', async (req, res) => {
  /** Get top scores. Query: limit?, offset? */
  if (!requireAdmin(res)) return;
  const limit = clamp(req.query.limit ?? 20, 1, 100);
  const offset = clamp(req.query.offset ?? 0, 0, 10000);
  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('user_id, anon_id, score, level, lives, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    if (error) return res.status(400).json({ error: { message: error.message } });
    return res.json({ data: data || [] });
  } catch {
    return res.status(500).json({ error: { message: 'Failed to fetch leaderboard' } });
  }
});

// Start only when this module is run directly (not started by tests automatically)
// Note: The hosting environment should start this server with `npm run start:api` or combined script.
if (require.main === module) {
  const PORT = Number(env('API_PORT', 4000));
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[API] Listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
