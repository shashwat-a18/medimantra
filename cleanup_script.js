#!/usr/bin/env node
// File cleanup script for MediMitra

const fs = require('fs');
const path = require('path');

console.log('🧹 MediMitra - File Cleanup Script');
console.log('=====================================\n');

// Files to delete - organized by category
const filesToDelete = {
  // Test Reports and Documentation (generated during testing)
  testReports: [
    'ADMIN_DATA_ACCESS_IMPLEMENTATION.md',
    'ADMIN_FUNCTIONALITY_TEST_REPORT.md',
    'APPOINTMENT_STATUS_MANAGEMENT_IMPLEMENTATION.md',
    'APPOINTMENT_SYSTEM_IMPLEMENTATION_REPORT.md',
    'COMPREHENSIVE_TEST_REPORT.md',
    'CREATOR_INFO_SUMMARY.md',
    'DOCTOR_FUNCTIONALITY_TEST_REPORT.md',
    'ERROR_ANALYSIS_AND_FIX_REPORT.md',
    'FINAL_CODEBASE_ANALYSIS.md',
    'HEALTH_TIPS_MARQUEE_REPORT.md',
    'IMPLEMENTATION.md',
    'MISSING_FEATURES_ANALYSIS.md',
    'MONGODB_ATLAS_SETUP.md',
    'MONGODB_SETUP.md',
    'MONGODB_SETUP_GUIDE.md',
    'PROJECT_COMPLETE.md',
    'PROJECT_STATUS_REPORT.md',
    'RUNTIME_ERROR_FIX.md',
    'RUNTIME_ERROR_FIX_REPORT.md',
    'TECH_SCROLLBAR_IMPLEMENTATION_REPORT.md',
    'UI_FIXES_REPORT.md',
    'COMPLETE_SYSTEM_AUDIT_REPORT.md'
  ],

  // Test Scripts (temporary)
  testScripts: [
    'check-appointments.js',
    'cleanup-database.js',
    'complete_functionality_test.js',
    'comprehensive_test.js',
    'error_handling_test.js',
    'final_verification.js',
    'functionality_check.js',
    'role_based_functionality_test.js',
    'test-appointment-status.js',
    'test-simple-admin.js',
    'test_documents.py',
    'test_new_features.js',
    'test_suite.py',
    'verify-database-integrity.js'
  ],

  // Temporary files and scripts
  temporaryFiles: [
    'check-status.ps1',
    'dev-start.js',
    'start-dev.bat',
    'start-dev.ps1',
    'start-dev.sh',
    'system_verification_report.json'
  ],

  // Unused images
  unusedAssets: [
    'image (3).jpg',
    'image (3).svg'
  ]
};

// Core files to keep (important for the application)
const coreFiles = [
  '.env',
  '.env.production',
  '.gitignore',
  'docker-compose.yml',
  'Dockerfile.client',
  'Dockerfile.server',
  'LICENSE',
  'README.md',
  'package.json',
  'package-lock.json'
];

// Core directories to keep
const coreDirectories = [
  'client',
  'server', 
  'ml-server',
  'chatbot',
  'public',
  'uploads',
  '.github',
  '.next',
  '.vscode',
  'node_modules',
  '.venv'
];

let deletedCount = 0;
let totalSize = 0;

function deleteFiles(category, files) {
  console.log(`\n🗑️  Deleting ${category}:`);
  console.log('─'.repeat(50));
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted: ${file} (${sizeKB} KB)`);
        deletedCount++;
        totalSize += stats.size;
      } else {
        console.log(`⚠️  Not found: ${file}`);
      }
    } catch (error) {
      console.log(`❌ Error deleting ${file}: ${error.message}`);
    }
  });
}

// Execute cleanup
console.log('Starting cleanup process...\n');

deleteFiles('Test Reports & Documentation', filesToDelete.testReports);
deleteFiles('Test Scripts', filesToDelete.testScripts);
deleteFiles('Temporary Files', filesToDelete.temporaryFiles);
deleteFiles('Unused Assets', filesToDelete.unusedAssets);

// Summary
console.log('\n🎉 CLEANUP SUMMARY');
console.log('=================');
console.log(`Files deleted: ${deletedCount}`);
console.log(`Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

// List remaining files
console.log('\n📁 REMAINING CORE FILES:');
console.log('========================');

const allFiles = fs.readdirSync(process.cwd());
const remainingFiles = allFiles.filter(file => {
  const isFile = fs.statSync(path.join(process.cwd(), file)).isFile();
  return isFile;
});

console.log('\n📄 Core Application Files:');
remainingFiles.forEach(file => {
  if (coreFiles.includes(file)) {
    console.log(`✅ ${file}`);
  }
});

console.log('\n📁 Core Directories:');
const remainingDirs = allFiles.filter(file => {
  const isDirectory = fs.statSync(path.join(process.cwd(), file)).isDirectory();
  return isDirectory;
});

remainingDirs.forEach(dir => {
  if (coreDirectories.includes(dir)) {
    console.log(`📁 ${dir}/`);
  }
});

console.log('\n✨ Cleanup completed successfully!');
console.log('🚀 Your project is now clean and production-ready!');
