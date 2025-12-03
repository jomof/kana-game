import fs from 'fs';
import path from 'path';

const reportPath = path.resolve('reports/mutation/mutation.json');

if (!fs.existsSync(reportPath)) {
  console.error('Mutation report not found at', reportPath);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const files = report.files;

for (const [fileName, fileData] of Object.entries(files)) {
  const survivors = fileData.mutants.filter(m => m.status === 'Survived');
  
  if (survivors.length > 0) {
    const survivor = survivors[0];
    console.log(`\n🔥 Survivor found in ${fileName}:${survivor.location.start.line}:${survivor.location.start.column}`);
    console.log(`Mutator: ${survivor.mutatorName}`);
    
    // Read the source file to show context
    // The report might have the source, but reading from disk is safer if we want latest
    // Actually, the report has 'source' property for the file usually.
    let source = fileData.source;
    if (!source && fs.existsSync(fileName)) {
        source = fs.readFileSync(fileName, 'utf-8');
    }

    if (source) {
        const lines = source.split('\n');
        const startLine = survivor.location.start.line - 1;
        const endLine = survivor.location.end.line - 1;
        const startCol = survivor.location.start.column - 1;
        const endCol = survivor.location.end.column - 1;

        // Extract original code
        // Handle multi-line
        let originalCode = '';
        if (startLine === endLine) {
            originalCode = lines[startLine].substring(startCol, endCol);
        } else {
            originalCode = lines[startLine].substring(startCol) + '\n';
            for (let i = startLine + 1; i < endLine; i++) {
                originalCode += lines[i] + '\n';
            }
            originalCode += lines[endLine].substring(0, endCol);
        }

        console.log(`\n- ${originalCode}`);
        console.log(`+ ${survivor.replacement}`);
        
        // Show context (3 lines before)
        console.log('\nContext:');
        for (let i = Math.max(0, startLine - 3); i <= startLine; i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
    
    console.log('\nFix this mutant to improve your score!');
    process.exit(0);
  }
}

console.log('No survivors found! Great job!');
