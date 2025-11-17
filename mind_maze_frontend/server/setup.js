'use strict';

/**
 * Setup script to apply required SQL (tables, indexes, policies) to Supabase using service role key.
 * Usage: node server/setup.js
 *
 * Env:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * Notes:
 * - This executes raw SQL via the PostgREST RPC? Not directly supported. We instead use the Admin client to call postgres via 'sql' REST endpoint using the service role key:
 *   Supabase REST doesn't expose arbitrary SQL; thus, the recommended approach is to run these statements in the Supabase SQL editor manually.
 * - For convenience, we print the SQL needed and exit non-zero if env missing.
 * - If you have supabase CLI or direct connection, prefer that. This script is a helper printer.
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function readSql(relPath) {
  return fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
}

function main() {
  const scoresSql = readSql('supabase.sql');
  const extraSql = readSql('assets/supabase_tables_extra.sql');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // eslint-disable-next-line no-console
    console.log('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\nPlease set them in server environment and run these SQL blocks manually in Supabase SQL Editor:\n\n-- SCORES\n', scoresSql, '\n\n-- QUIZZES/QUESTIONS/ANSWERS\n', extraSql);
    process.exit(1);
  }

  // No safe direct SQL endpoint from supabase-js; thus print instructions.
  // eslint-disable-next-line no-console
  console.log('To apply migrations, open Supabase SQL Editor and run the following blocks in order:\n');
  // eslint-disable-next-line no-console
  console.log('--- scores.sql ---\n', scoresSql);
  // eslint-disable-next-line no-console
  console.log('\n--- quizzes_questions_answers.sql ---\n', extraSql);
  // eslint-disable-next-line no-console
  console.log('\nNote: Alternatively, use Supabase CLI linked to your project to apply SQL files.');
  process.exit(0);
}

if (require.main === module) {
  main();
}
