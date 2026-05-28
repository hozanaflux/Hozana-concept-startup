/* ============================================================
   HOZANA CONCEPT - Post-Publish Hook
   Automatically triggers blog deployment after article updates
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy-blog.js');
const LOG_FILE = path.join(__dirname, '../logs/blog-deploy.log');
const PROJECT_ROOT = path.join(__dirname, '..');
const FULL_DEPLOY_SCRIPT = path.resolve(PROJECT_ROOT, 'scripts', 'deploy-blog.js');
const RELATIVE_DEPLOY_SCRIPT = './deploy-blog.js';
const ABSOLUTE_DEPLOY_SCRIPT = path.resolve(__dirname, 'deploy-blog.js');
const RELATIVE_SCRIPT_PATH = './scripts/deploy-blog.js';

// Function to log deployment events
function logEvent(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(logMessage);
}

// Main function
function runPostPublishHook() {
  try {
    logEvent('Post-publish hook triggered');

    // Execute the deployment script
    logEvent('Starting blog deployment...');
    execSync(`node ${RELATIVE_SCRIPT_PATH}`, { stdio: 'inherit' });

    logEvent('Blog deployment completed successfully');
    logEvent('Remember to submit your sitemap to search engines!');

  } catch (err) {
    logEvent(`Deployment failed: ${err.message}`);
    process.exit(1);
  }
}

// Run the hook
runPostPublishHook();