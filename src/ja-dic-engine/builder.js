const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const index = {};
console.log('Generando índice en: ' + baseDir);

for (let i = 1; i <= 216; i++) {
    const filename = path.join(baseDir, `term_bank_${i}.json`);
    if (fs.existsSync(filename)) {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        data.forEach(entry => {
            const term = entry[0];
            const reading = entry[1];
            
            if (!index[term]) index[term] = [];
            if (!index[term].includes(i)) index[term].push(i);
            
            if (reading && reading !== term) {
                if (!index[reading]) index[reading] = [];
                if (!index[reading].includes(i)) index[reading].push(i);
            }
        });
        if (i % 20 === 0) console.log(`Procesados ${i} archivos...`);
    }
}

const outputPath = path.join(baseDir, 'index_data.js');
fs.writeFileSync(outputPath, 'const termIndex = ' + JSON.stringify(index) + ';');
console.log('¡Índice generado con éxito en: ' + outputPath);
