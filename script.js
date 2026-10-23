const counterInput = document.getElementById('counterInput');
const wordCount = document.getElementById('wordCount');
const charCount = document.getElementById('charCount');
const readTime = document.getElementById('readTime');

function updateCounter() {
  const text = counterInput.value;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  wordCount.textContent = words.toLocaleString();
  charCount.textContent = text.length.toLocaleString();
  const minutes = words ? Math.max(1, Math.ceil(words / 200)) : 0;
  readTime.textContent = `${minutes} min`;
}
counterInput.addEventListener('input', updateCounter);
document.getElementById('clearCounter').addEventListener('click', () => {
  counterInput.value = '';
  updateCounter();
  counterInput.focus();
});

const caseInput = document.getElementById('caseInput');
const caseStatus = document.getElementById('caseStatus');
document.querySelectorAll('[data-case]').forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.case;
    const original = caseInput.value;
    if (mode === 'upper') caseInput.value = original.toLocaleUpperCase();
    if (mode === 'lower') caseInput.value = original.toLocaleLowerCase();
    if (mode === 'title') caseInput.value = original.toLocaleLowerCase().replace(/(^|[\s\u2014-])(\p{L})/gu, (_, prefix, letter) => prefix + letter.toLocaleUpperCase());
    caseStatus.textContent = 'Text converted.';
  });
});

const spaceInput = document.getElementById('spaceInput');
const spaceStatus = document.getElementById('spaceStatus');
document.getElementById('cleanSpaces').addEventListener('click', () => {
  spaceInput.value = spaceInput.value
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  spaceStatus.textContent = 'Text cleaned.';
});
document.getElementById('copyClean').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(spaceInput.value);
    spaceStatus.textContent = 'Copied to clipboard.';
  } catch {
    spaceInput.focus();
    spaceInput.select();
    spaceStatus.textContent = 'Select the text and copy it manually.';
  }
});
document.getElementById('year').textContent = new Date().getFullYear();
