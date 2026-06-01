# Hozana Concept Blog - Static Generation System

## System Overview

This system generates static HTML pages for blog articles to improve SEO and performance. It includes:

1. Static page generation for each article
2. SEO optimization with meta tags and schema markup
3. Automatic sitemap generation
4. Deployment automation

## Setup Instructions

1. **Prerequisites**:
   - Node.js installed
   - npm installed
   - Required dependencies: `npm install jsdom`

2. **Configuration**:
   - Ensure the following directories exist:
     - `blog-posts/` (for generated static pages)
     - `logs/` (for deployment logs)

3. **Generating Static Pages**:
   - Run the generation script:
     ```
     node js/generate-static-blog.js
     ```
   - This will create static HTML files in the `blog-posts/` directory

4. **Deployment**:
   - Run the deployment script:
     ```
     node scripts/deploy-blog.js
     ```
   - This will:
     - Generate static files
     - Update blog.html with static links
     - Prepare files for production

5. **Post-Publish Hook**:
   - Configure your CMS to run:
     ```
     node scripts/post-publish-hook.js
     ```
   - This will automatically trigger deployment after article updates

## File Structure

```
project-root/
├── blog-posts/          # Generated static pages
├── logs/                # Deployment logs
├── js/
│   ├── blog-seo.js      # SEO functions (browser)
│   ├── blog-seo-node.js # SEO functions (Node.js)
│   ├── generate-static-blog.js # Static generation script
├── scripts/
│   ├── deploy-blog.js  # Deployment script
│   ├── post-publish-hook.js # Post-publish hook
└── README.md            # This documentation
```

## Maintenance

1. **Updating Articles**:
   - After updating an article, run the post-publish hook
   - The system will automatically regenerate the static page

2. **SEO Monitoring**:
   - Submit the sitemap.xml to Google Search Console
   - Monitor search performance in Google Analytics

3. **Troubleshooting**:
   - Check logs in the `logs/` directory for deployment issues
   - Verify static pages in the `blog-posts/` directory

## Notes

- The system requires Node.js to generate static pages
- For production, configure your web server to serve files from the `blog-posts/` directory
- Consider setting up a CI/CD pipeline for automated deployments