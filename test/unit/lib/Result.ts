import test from "ava";
import { Result } from "../../../src/core/lib";

test("shouldn't be able to create a success result with an error", (t) => {
  t.throws(() => new Result<string>(true, "error!"));
});

test("need an error message for a failure", (t) => {
  t.throws(() => new Result<string>(false));
});

test("can't get value on error", (t) => {
  const errRes = Result.fail<string>("hi there");
  t.throws(() => errRes.getValue());
});
