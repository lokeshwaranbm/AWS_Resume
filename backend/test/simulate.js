const assert = require("assert");

process.env.COUNTER_TABLE_NAME = "visitor-counter";

let storedCount = 0;

class FakeDocumentClient {
  get(params) {
    assert.strictEqual(params.TableName, "visitor-counter");
    return {
      promise: async () => ({
        Item: { counterId: params.Key.counterId, visitCount: storedCount },
      }),
    };
  }

  update(params) {
    assert.strictEqual(params.TableName, "visitor-counter");
    return {
      promise: async () => {
        storedCount += 1;
        return { Attributes: { visitCount: storedCount } };
      },
    };
  }
}

global.__VISITOR_COUNTER_DOCUMENT_CLIENT__ = new FakeDocumentClient();

const { handler } = require("../src/handler");

async function run() {
  const getResponse = await handler({ httpMethod: "GET" });
  assert.strictEqual(getResponse.statusCode, 200);
  assert.strictEqual(JSON.parse(getResponse.body).visitCount, 0);

  const postResponse = await handler({ httpMethod: "POST" });
  assert.strictEqual(postResponse.statusCode, 200);
  assert.strictEqual(JSON.parse(postResponse.body).visitCount, 1);

  const secondGetResponse = await handler({ httpMethod: "GET" });
  assert.strictEqual(JSON.parse(secondGetResponse.body).visitCount, 1);

  console.log("Visitor counter backend simulation passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
