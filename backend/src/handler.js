const TABLE_NAME = process.env.COUNTER_TABLE_NAME;
const COUNTER_ID = "resume-site";

function createDocumentClient() {
  if (globalThis.__VISITOR_COUNTER_DOCUMENT_CLIENT__) {
    return globalThis.__VISITOR_COUNTER_DOCUMENT_CLIENT__;
  }

  try {
    // AWS Lambda includes aws-sdk v2 in the Node.js runtime.
    // The local test harness injects a fake client so this fallback is only used in AWS.
    const AWS = require("aws-sdk");
    return new AWS.DynamoDB.DocumentClient();
  } catch (error) {
    throw new Error("aws-sdk is unavailable. Inject __VISITOR_COUNTER_DOCUMENT_CLIENT__ for local execution.");
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

async function getCount() {
  const dynamoDb = createDocumentClient();
  const result = await dynamoDb
    .get({
      TableName: TABLE_NAME,
      Key: { counterId: COUNTER_ID },
    })
    .promise();

  return Number(result.Item?.visitCount ?? 0);
}

async function incrementCount() {
  const dynamoDb = createDocumentClient();
  const result = await dynamoDb
    .update({
      TableName: TABLE_NAME,
      Key: { counterId: COUNTER_ID },
      UpdateExpression: "SET visitCount = if_not_exists(visitCount, :zero) + :inc",
      ExpressionAttributeValues: {
        ":zero": 0,
        ":inc": 1,
      },
      ReturnValues: "UPDATED_NEW",
    })
    .promise();

  return Number(result.Attributes?.visitCount ?? 0);
}

exports.handler = async (event) => {
  try {
    const method = event?.requestContext?.http?.method || event?.httpMethod || "GET";

    if (method === "OPTIONS") {
      return buildResponse(200, { ok: true });
    }

    if (method === "POST") {
      const visitCount = await incrementCount();
      return buildResponse(200, { visitCount, count: visitCount });
    }

    const visitCount = await getCount();
    return buildResponse(200, { visitCount, count: visitCount });
  } catch (error) {
    console.error("Visitor counter error:", error);
    return buildResponse(500, { message: "Unable to update visitor counter" });
  }
};
