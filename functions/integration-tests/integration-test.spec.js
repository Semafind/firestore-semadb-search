import {assert} from "chai";
import {handleSemaDBSync} from "../semadb.js";

describe("semadbSync", () => {
  it("skips if vectors are the same", async () => {
    const change = {
      before: {
        exists: true,
        data: () => ({
          "_semadbPointId": "point1",
          "vector": [1, 2, 3],
        }),
      },
      after: {
        exists: true,
        data: () => ({
          "_semadbPointId": "point1",
          "vector": [1, 2, 3],
        }),
      },
    };
    const res = await handleSemaDBSync(change.before, change.after);
    assert.isNull(res);
  });
});
