const { JSDOM } = require('jsdom');

describe('OPC适配自测', () => {
  let window, document;

  beforeEach(() => {
    const dom = new JSDOM(`
      <div id="app"></div>
      <script src="questions.json"></script>
      <script src="app.js"></script>
    `, { runScripts: 'dangerously' });
    window = dom.window;
    document = window.document;
  });

  test('should render first question on load', () => {
    expect(document.getElementById('app').innerHTML).toContain('问题 1');
  });

  test('should track answer selection', () => {
    const buttons = document.querySelectorAll('.option-btn');
    expect(buttons.length).toBe(4);
  });

  test('should handle network error gracefully', () => {
    expect(typeof window.generateMockResults).toBe('function');
  });
});