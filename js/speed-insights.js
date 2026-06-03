/* ============================================================
   Vercel Speed Insights Integration
   ============================================================ */

(function() {
  'use strict';

  // Initialize Vercel Speed Insights
  // Based on official Vercel documentation for vanilla JS/Astro projects
  window.si = window.si || function () { 
    (window.siq = window.siq || []).push(arguments); 
  };

  // Load the Speed Insights script dynamically
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Append script to document head
  document.head.appendChild(script);

  console.log('[Hozana] Speed Insights initialized');
})();
