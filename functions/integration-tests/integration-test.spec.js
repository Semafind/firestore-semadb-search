import {assert} from "chai";
import {handleSemaDBSync, axiosInstance, handleSemaDBSearch} from "../semadb.js";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axiosInstance);

beforeEach(() => {
  mock.reset();
});

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

describe("semadbSearch", () => {
  it("returns empty array if no points found", async () => {
    mock.onPost("/search").reply(200, {
      "points": [],
    });
    const res = await handleSemaDBSearch([1, 2, 3], 10);
    assert.hasAllKeys(res, ["points"]);
    assert.isArray(res.points);
    assert.isEmpty(res.points);
  });
});
