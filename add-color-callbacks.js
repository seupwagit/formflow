const fs = require('fs');

let content = fs.readFileSync('app/fill-form/page.tsx', 'utf8');

// Padrão para encontrar: onToggleFieldDisabled seguido de fechamento
const pattern = /(onToggleFieldDisabled: \(targetFieldName, disabled\) => \{\s+setFieldDisabled\(prev => \(\{ \.\.\.prev, \[targetFieldName\]: disabled \}\)\)\s+\})\s+(\}\))/g;

// Substituir adicionando onChangeFieldColor
const replacement = `$1,
            onChangeFieldColor: (targetFieldName, color) => {
              setFieldColors(prev => ({ ...prev, [targetFieldName]: color }))
            }
          $2`;

content = content.replace(pattern, replacement);

// Salvar
fs.writeFileSync('app/fill-form/page.tsx', content, 'utf8');

// Contar quantas substituições foram feitas
const matches = content.match(/onChangeFieldColor/g);
console.log(`✅ Adicionados ${matches ? matches.length : 0} callbacks onChangeFieldColor`);
