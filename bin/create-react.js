#!/usr/bin/env node

import { program } from 'commander';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_URL = 'https://github.com/codingpixel-developer/react-template.git';

function validateProjectName(name) {
  // Replace spaces with dashes
  let sanitized = name.replace(/\s+/g, '-');
  
  // Remove any characters that aren't alphanumeric, dash, or underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9-_]/g, '');
  
  // Check minimum length
  if (sanitized.length < 3) {
    console.error(`❌ Error: Project name "${sanitized}" must be at least 3 characters long.`);
    process.exit(1);
  }
  
  return sanitized;
}

function createProject(projectName) {
  const sanitizedName = validateProjectName(projectName);
  const targetDir = path.resolve(process.cwd(), sanitizedName);
  
  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Directory "${sanitizedName}" already exists.`);
    process.exit(1);
  }
  
  console.log(`\n🚀 Creating project "${sanitizedName}"...\n`);
  
  try {
    // Clone the repository
    console.log('📦 Cloning template repository...');
    execSync(`git clone --depth 1 ${REPO_URL} "${targetDir}"`, {
      stdio: 'inherit',
    });
    
    // Remove .git folder
    console.log('🗑️  Removing template git history...');
    fs.rmSync(path.join(targetDir, '.git'), { recursive: true, force: true });
    
    // Update .gitignore to exclude AI agent files
    console.log('📝 Updating .gitignore...');
    const gitignorePath = path.join(targetDir, '.gitignore');
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    
    // Add AI agent files to gitignore if not already present
    const agentIgnoreLines = [
      '',
      '# AI Agent Assistance (internal use only)',
      '.agent/',
      'AGENT.md',
    ];
    
    if (!gitignoreContent.includes('.agent/')) {
      gitignoreContent += agentIgnoreLines.join('\n');
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }
    
    // Remove AI agent files from the created project
    console.log('🧹 Cleaning up AI agent files...');
    const agentDir = path.join(targetDir, '.agent');
    const agentMdPath = path.join(targetDir, 'AGENT.md');
    
    if (fs.existsSync(agentDir)) {
      fs.rmSync(agentDir, { recursive: true, force: true });
    }
    if (fs.existsSync(agentMdPath)) {
      fs.rmSync(agentMdPath);
    }
    
    // Remove npm package specific files (these shouldn't be in the created project)
    console.log('🧹 Removing package template files...');
    const filesToRemove = [
      'bin',
      '.npmignore',
      'README.md',  // Will be replaced with TEMPLATE_README.md
    ];
    
    for (const file of filesToRemove) {
      const filePath = path.join(targetDir, file);
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    }
    
    // Copy template README to the created project
    const templateReadmePath = path.join(targetDir, 'TEMPLATE_README.md');
    const projectReadmePath = path.join(targetDir, 'README.md');
    if (fs.existsSync(templateReadmePath)) {
      fs.copyFileSync(templateReadmePath, projectReadmePath);
      fs.rmSync(templateReadmePath);
    }
    
    // Update package.json for the new project
    console.log('🔧 Setting up project configuration...');
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    // Reset to a clean project package.json
    const newPkg = {
      name: sanitizedName,
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: pkg.scripts,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
    };
    
    fs.writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2) + '\n');
    
    // Initialize new git repository
    console.log('🔧 Initializing git repository...');
    execSync('git init', { cwd: targetDir, stdio: 'ignore' });
    execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from @codingpixel/create-react"', {
      cwd: targetDir,
      stdio: 'ignore',
    });
    
    // Success message
    console.log('\n✅ Project created successfully!\n');
    console.log(`Next steps:`);
    console.log(`  cd ${sanitizedName}`);
    console.log(`  npm install`);
    console.log(`  cp .env.sample .env`);
    console.log(`  npm run dev\n`);
    console.log('Happy coding! 🎉\n');
    
  } catch (error) {
    console.error('\n❌ Error creating project:', error.message);
    
    // Clean up on failure
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    
    process.exit(1);
  }
}

program
  .name('create-react')
  .description('CLI tool to scaffold a production-ready React project')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project to create')
  .action((projectName) => {
    if (!projectName) {
      console.error('❌ Error: Please provide a project name.');
      console.log('\nUsage: npx @codingpixel/create-react <project-name>');
      console.log('Example: npx @codingpixel/create-react my-app\n');
      process.exit(1);
    }
    
    createProject(projectName);
  });

program.parse();
