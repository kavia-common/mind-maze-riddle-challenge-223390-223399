/**
 * Lightweight integration test for the answers flow through the proxy API.
 * Skips when REACT_APP_API_BASE is not set (no server).
 */
 // PUBLIC_INTERFACE
describe('Answers proxy API flow', () => {
  const API = process.env.REACT_APP_API_BASE;

  const skip = !API;

  test('create quiz -> question -> record answer', async () => {
    if (skip) {
      console.warn('[AnswersTest] Skipped: REACT_APP_API_BASE not set');
      return;
    }
    // Create quiz
    const qzResp = await fetch(`${API}/api/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Quiz', description: 'e2e', is_public: true })
    });
    const qz = await qzResp.json();
    expect(qzResp.ok).toBe(true);
    const quiz_id = qz.data.id;

    // Create question
    const quesResp = await fetch(`${API}/api/quizzes/${encodeURIComponent(quiz_id)}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'What says hello?',
        seconds: 15,
        order_index: 0,
        answers: ['hello', 'hi']
      })
    });
    const ques = await quesResp.json();
    expect(quesResp.ok).toBe(true);
    const question_id = ques.data.id;

    // Record anonymous answer
    const anon_id = 'test_device_' + Math.random().toString(16).slice(2);
    const ansResp = await fetch(`${API}/api/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anon_id,
        quiz_id,
        question_id,
        answer_text: 'hello',
        is_correct: true
      })
    });
    const ans = await ansResp.json();
    expect(ansResp.ok).toBe(true);
    expect(ans.data).toBeTruthy();
    expect(ans.data.quiz_id).toBe(quiz_id);
    expect(ans.data.question_id).toBe(question_id);
  });
});
