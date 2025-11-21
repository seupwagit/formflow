const fs = require('fs');
const content = fs.readFileSync('app/fill-form/page.tsx', 'utf8');
const lines = content.split('\n');

let openBraces = 0;
let openParens = 0;
let inString = false;
let inComment = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const prevChar = j > 0 ? line[j-1] : '';
    
    // Skip strings
    if (char === '"' || char === "'" || char === '`') {
      if (!inComment) inString = !inString;
    }
    
    if (inString) continue;
    
    // Skip comments
    if (char === '/' && line[j+1] === '/') {
      break; // Rest of line is comment
    }
    if (char === '/' && line[j+1] === '*') {
      inComment = true;
    }
    if (char === '*' && line[j+1] === '/') {
      inComment = false;
      j++; // Skip next char
      continue;
    }
    
    if (inComment) continue;
    
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
    if (char === '(') openParens++;
    if (char === ')') openParens--;
  }
  
  if (i === 846) {
    console.log(`Linha 847 (índice 846): openBraces=${openBraces}, openParens=${openParens}`);
    console.log(`Conteúdo: ${line}`);
  }
}

console.log(`\nFinal do arquivo:`);
console.log(`Open braces: ${openBraces}`);
console.log(`Open parens: ${openParens}`);

if (openBraces > 0) {
  console.log(`\n❌ Faltam ${openBraces} chave(s) de fechamento }`);
} else if (openBraces < 0) {
  console.log(`\n❌ Há ${-openBraces} chave(s) de fechamento } a mais`);
} else {
  console.log(`\n✅ Chaves balanceadas`);
}
