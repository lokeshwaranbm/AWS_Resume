# Lokeshwaran B Resume Portfolio

A modern, responsive resume website built with HTML, CSS, and vanilla JavaScript. It is designed for static hosting and can be deployed to AWS S3 directly.

## Features

- Sticky navigation bar with smooth section scrolling
- Professional dark blue, white, and gray visual system
- Responsive cards, grids, and hover effects
- Dark mode toggle with saved preference
- Icon-based contact strip using Font Awesome
- Live visitor counter ready to connect to an AWS backend

## Files

- `index.html`
- `styles.css`
- `script.js`
- `backend/`

## Run locally

Open `index.html` in a browser, or serve the folder with any static web server.

## Deploy to AWS S3

1. Create an S3 bucket configured for static website hosting.
2. Upload `index.html`, `styles.css`, and `script.js`.
3. Set `index.html` as the index document.
4. If needed, add CloudFront in front of the bucket for HTTPS and caching.
5. For the live visitor counter, deploy the backend in `backend/` and set the API URL in the `visitor-counter-api` meta tag.

## GitHub Actions CI/CD

The repository includes `/.github/workflows/deploy.yml` to push the static site to S3 and optionally invalidate CloudFront.

Set these repository secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID` (optional)
- `VISITOR_COUNTER_API_URL` (optional, used to inject the live counter URL into `index.html` during deploy)

Push to the `main` branch to trigger the deployment.
