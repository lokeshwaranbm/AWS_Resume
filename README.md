# Lokeshwaran B Resume Portfolio

A modern, responsive resume website built with HTML, CSS, and vanilla JavaScript. It is designed for static hosting and can be deployed to AWS S3 directly.

## Features

- Sticky navigation bar with smooth section scrolling
- Professional dark blue, white, and gray visual system
- Responsive cards, grids, and hover effects
- Dark mode toggle with saved preference
- Icon-based contact strip using Font Awesome
- Visitor counter placeholder for future AWS integration

## Files

- `index.html`
- `styles.css`
- `script.js`

## Run locally

Open `index.html` in a browser, or serve the folder with any static web server.

## Deploy to AWS S3

1. Create an S3 bucket configured for static website hosting.
2. Upload `index.html`, `styles.css`, and `script.js`.
3. Set `index.html` as the index document.
4. If needed, add CloudFront in front of the bucket for HTTPS and caching.
