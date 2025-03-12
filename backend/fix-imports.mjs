// fix-imports.mjs
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Find all TypeScript files in the src directory
const findTsFiles = async () => {
  try {
    const { stdout } = await execAsync('find src -name "*.ts"');
    return stdout.trim().split('\n');
  } catch (error) {
    console.error('Error finding TypeScript files:', error);
    return [];
  }
};

// Map of path aliases to their relative paths
const aliasMap = {
  '@config/': './config/',
  '@features/': './features/',
  '@auth/': './features/authentication/',
  '@user/': './features/user/',
  '@cache/': './features/cache/',
  '@logging/': './features/logging/',
  '@security/': './features/security/',
  '@web/': './features/web-server/',
  '@test/': './test/',
  '@/': './'
};

// For each file, replace all path aliases with relative imports
const processFiles = async () => {
  const files = await findTsFiles();
  let modifiedFiles = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Replace import statements with path aliases
    let importRegex = /from ['"](@[^'"]+)['"]/g;
    let matches = [];
    let match;

    // Collect all the matches first
    while ((match = importRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    // Process each match
    for (const importPath of matches) {
      let replaced = false;

      for (const [alias, relativePath] of Object.entries(aliasMap)) {
        if (importPath.startsWith(alias)) {
          const newPath = importPath.replace(alias, relativePath);
          content = content.replace(
            new RegExp(`from ['"]${importPath}['"]`, 'g'),
            `from '${newPath}'`
          );
          replaced = true;
          break;
        }
      }

      if (!replaced) {
        console.warn(`Could not replace alias in path: ${importPath} in file ${file}`);
      }
    }

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Modified imports in: ${file}`);
      modifiedFiles++;
    }
  }

  console.log(`Modified ${modifiedFiles} files.`);
};

processFiles().catch(error => {
  console.error('Error processing files:', error);
  process.exit(1);
});
