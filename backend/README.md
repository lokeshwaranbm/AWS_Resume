# Visitor Counter Backend

This folder contains the AWS backend for the resume site's live visitor counter.

## Architecture

- API Gateway HTTP API
- AWS Lambda
- DynamoDB table `visitor-counter`

The Lambda function supports:

- `GET /counter` to read the current count
- `POST /counter` to increment the count and return the new value

## Local verification

Run the simulation test:

```bash
cd backend
npm test
```

## Deploy with AWS SAM

1. Install the AWS SAM CLI.
2. Install dependencies in this folder:

```bash
npm install
```

3. From this folder, run:

```bash
sam build
sam deploy --guided
```

4. Use the output `VisitorCounterApiUrl` as the value for the `visitor-counter-api` meta tag in `index.html`.

## Front-end wiring

The static site reads the API URL from:

```html
<meta name="visitor-counter-api" content="https://your-api-id.execute-api.your-region.amazonaws.com/counter" />
```

When the page loads, the browser sends a `POST` request to increment the counter and display the updated value.
