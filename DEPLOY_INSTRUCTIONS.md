# Deploy instructions (S3 + CloudFront)

Steps to deploy the static site and CI/CD with GitHub Actions.

1) Create an S3 bucket

Quick (public bucket, easiest):

```bash
aws s3 mb s3://your-bucket-name --region us-east-1
aws s3 sync . s3://your-bucket-name --acl public-read --exclude ".git/*" --exclude ".github/*"
```

Recommended (private bucket + CloudFront Origin Access):
- Create the S3 bucket in your region (console or CLI).
- Create an Origin Access Identity (OAI) in CloudFront and attach it to the distribution.
- Add a bucket policy allowing the OAI to GetObject from the bucket (console helps here).

2) CloudFront + TLS

- Create an ACM certificate in **us-east-1** for your domain if you plan to use a custom domain.
- Create a CloudFront distribution using the S3 bucket as origin. Prefer Origin Access (OAC/OAI) so the bucket can remain private.
- Configure behaviors, caching, and set the default root object to `index.html`.

3) IAM policy for GitHub Actions

Create an IAM user (or role) used by GitHub Actions with this minimal policy (replace `my-bucket`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

4) GitHub repository secrets

Set these secrets in your repository settings:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g., `us-east-1`)
- `S3_BUCKET` (your bucket name)
- `CLOUDFRONT_DISTRIBUTION_ID` (optional, used by the workflow to invalidate cache)
- `VISITOR_COUNTER_API_URL` (optional, injects the live counter endpoint into `index.html` during deploy)

5) Test deploy

- Commit and push to `main` to trigger the workflow `/.github/workflows/deploy.yml`.
- Or run the `aws s3 sync` command locally to verify upload.

The workflow also replaces the empty `visitor-counter-api` meta tag in `index.html` with `VISITOR_COUNTER_API_URL` before the upload, so the same repo works for both local editing and CI/CD deploys.

6) Live visitor counter backend

- The visitor counter uses API Gateway, Lambda, and DynamoDB from the `backend/` folder.
- Deploy it with AWS SAM:

```bash
cd backend
sam build
sam deploy --guided
```

- Copy the `VisitorCounterApiUrl` output into the `visitor-counter-api` meta tag in `index.html`.
- After that, reload the site and the counter will increment on each page load.

Notes:
- For production, prefer private bucket + CloudFront OAC/OAI and use `aws s3 sync` without making objects public.
- If you use a custom domain, point DNS to CloudFront (use Route 53 or your DNS provider) and attach the ACM certificate.
