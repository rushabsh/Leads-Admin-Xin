const fs = require('fs');

// Read store/tortQuestionsStore.ts
const content = fs.readFileSync('store/tortQuestionsStore.ts', 'utf-8');

// Extract the DEFAULT_TORT_QUESTIONS object text
const startMarker = 'export const DEFAULT_TORT_QUESTIONS: TortQuestionsMap = ';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Could not find startMarker');
  process.exit(1);
}

const afterStart = content.substring(startIndex + startMarker.length);
// Find matching closing brace
let depth = 0;
let endIndex = -1;
for (let i = 0; i < afterStart.length; i++) {
  if (afterStart[i] === '{') depth++;
  else if (afterStart[i] === '}') {
    depth--;
    if (depth === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

if (endIndex === -1) {
  console.error('Could not find matching closing brace');
  process.exit(1);
}

const objText = afterStart.substring(0, endIndex);
// Evaluate safely using Function
const questionsMap = new Function('return (' + objText + ')')();

const container = {
  version: 4,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Administrator',
  questionsMap: questionsMap
};

fs.writeFileSync('utils/tortQuestionsSettings.json', JSON.stringify(container, null, 2), 'utf-8');
console.log('Successfully synced', Object.keys(questionsMap).length, 'tort categories to utils/tortQuestionsSettings.json:');
console.log(Object.keys(questionsMap).join(', '));
