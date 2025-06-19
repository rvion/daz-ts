import * as fs from 'fs';
import * as path from 'pathe';

const rootDir = process.cwd(); // Current workspace directory
const outputFile = 'data/duf_files.txt';
const outputLines: string[] = [];
const dazFolder = 'C:/Users/Public/Documents/My DAZ 3D Library/duf_files.txt'

function getAssetType(filePath: string): string | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    if (jsonData && jsonData.asset_info && typeof jsonData.asset_info.type === 'string') {
      return jsonData.asset_info.type;
    }
  } catch (error) {
    // console.warn(`Could not read or parse JSON from ${filePath}: ${error.message}`);
    // Not a critical error if a file is not JSON or doesn't have the type
  }
  return null;
}

let ix = 0
function findDufFiles(currentPath: string) {
  try {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      ix++
      const itemPath = path.join(currentPath, item);
      let stat;
      try {
        stat = fs.statSync(itemPath);
      } catch (err: any) {
        console.error(`Error stating ${itemPath}: ${err.message}`);
        continue; // Skip if cannot stat
      }

      if (stat.isDirectory()) {
        findDufFiles(itemPath);
      } else if (stat.isFile() && item.toLowerCase().endsWith('.duf')) {
        const relativePath = path.relative(rootDir, itemPath).replace(/\\/g, '/');
        const assetType = getAssetType(itemPath);
        let outputLine = relativePath;
        if (assetType) {
          outputLine = `[${assetType}] ${relativePath}`;
        }
        outputLines.push(outputLine);
        console.log(`[${ix.toString().padStart(5,' ')}] Processed: ${outputLine}`);
      }
    }
  } catch (err: any)
{
    console.error(`Error reading directory ${currentPath}: ${err.message}`);
  }
}

console.log(`Starting search for .duf files in ${rootDir}...`);
findDufFiles(rootDir);

try {
  fs.writeFileSync(outputFile, outputLines.join('\n'));
  console.log(`\nProcessed ${outputLines.length} .duf files.`);
  console.log(`Output written to ${path.join(rootDir, outputFile)}`);
} catch (err: any) {
  console.error(`Error writing to ${outputFile}: ${err.message}`);
}

console.log(`[🤠] 🟢 Script finished.`);