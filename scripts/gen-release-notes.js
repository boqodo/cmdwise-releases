const fs = require('fs');
const path = require('path');

// Configuration constants
const CONFIG = {
  defaultContent: "This release includes various improvements and bug fixes.",
  installInstructions: `
## Installation Guide

✅ **Digitally signed and notarized by Apple** - Safe to run directly.

### macOS Installation

1. Download the DMG file
2. Open DMG and drag the app to Applications folder
3. Double-click to launch CmdWise`,
  documentationLink: `
📖 **Documentation**: [https://cmdwise.app/docs](https://cmdwise.app/docs)
---
🌏 **中文用户**: 查看[中文文档](https://cmdwise.app/docs/zh)`,
};

const tag = process.argv[2];
if (!tag) {
  console.error('Please provide a tag parameter, e.g.: node gen-release-notes.js v1.2.3');
  process.exit(1);
}

const version = tag.replace(/^v/, ''); // Remove v prefix
console.log(`Generating release notes for version ${version}...`);

let changelogContent = '';

// Try to extract content from CHANGELOG.md
try {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    const changelog = fs.readFileSync(changelogPath, 'utf8').split('\n');
    
    let capturing = false;
    let lines = [];
    
    for (const line of changelog) {
      // Match version title lines, supporting formats: # v1.2.3 (date), ## [1.2.3], ## v1.2.3, ## 1.2.3
      if (/^#+\s*(\[?v?\d+\.\d+\.\d+\]?)/i.test(line)) {
        if (capturing) {
          // Already reached next section, stop collecting
          break;
        }
        
        // Flexible matching, supporting version numbers followed by dates etc.
        const match = line.match(/^#+\s*\[?v?(\d+\.\d+\.\d+)\]?/i);
        if (match && match[1] === version) {
          capturing = true;
          continue; // Skip title line itself
        }
      }
      
      if (capturing) {
        lines.push(line);
      }
    }
    
    if (lines.length > 0) {
      // Remove trailing empty lines
      while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }
      
      if (lines.length > 0) {
        changelogContent = lines.join('\n');
        console.log(`✓ Found changelog content for version ${version}`);
      }
    }
  }
} catch (error) {
  console.log(`⚠ Failed to read CHANGELOG.md: ${error.message}`);
}

// Build final content
let content = '## Release Notes\n\n';

if (changelogContent) {
  content += changelogContent;
} else {
  content += CONFIG.defaultContent;
  console.log(`✓ Using default content`);
}

content += '\n\n';
content += CONFIG.installInstructions;
content += '\n\n';
content += CONFIG.documentationLink;

// Write to file
const outputPath = path.join(process.cwd(), 'release_notes.md');
fs.writeFileSync(outputPath, content.trim());

console.log(`✓ Release notes generated to ${outputPath}`); 