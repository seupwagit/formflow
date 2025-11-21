const fs = require('fs');

let content = fs.readFileSync('app/fill-form/page.tsx', 'utf8');

// Remover os `n literais
content = content.replace(/\},`n\s+onToggleFieldDisabled/g, '},\n            onToggleFieldDisabled');
content = content.replace(/\)`n\s+\}/g, ')\n            }');
content = content.replace(/disabled\)\)`n\s+\},`n/g, 'disabled})\n            },\n');

// Corrigir indentação do onChangeFieldColor
content = content.replace(/onChangeFieldColor: \(targetFieldName, color\) => \{\s+setFieldColors/g, 
  'onChangeFieldColor: (targetFieldName, color) => {\n              setFieldColors');

content = content.replace(/setFieldColors\(prev => \(\{ \.\.\.prev, \[targetFieldName\]: color \}\)\)\s+\}/g,
  'setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))\n            }');

fs.writeFileSync('app/fill-form/page.tsx', content, 'utf8');
console.log('✅ Arquivo corrigido');
