describe('API /api/analyze', () => {
  test('should reject invalid answer key', async () => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: { 1: 'X' } })
    });
    expect(response.status).toBe(400);
  });

  test('should reject incomplete answers', async () => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: { 1: 'A' } })
    });
    expect(response.status).toBe(400);
  });
});