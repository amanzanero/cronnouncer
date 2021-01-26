import test from "ava";
import { Guard, IGuardResult } from "../../../src/core/lib";

test("combine - all success guard results should pass", (t) => {
  const succeedArg: IGuardResult = { succeeded: true, message: "succeeded" };
  const res = Guard.combine([succeedArg]);
  t.true(res.succeeded);
});

test("combine - catch a failed guard result", (t) => {
  const succeedArg: IGuardResult = { succeeded: true, message: "succeeded" };
  const failedArg: IGuardResult = { succeeded: false, message: "failed" };
  const res = Guard.combine([succeedArg, failedArg]);
  t.false(res.succeeded);
});

test("againstNullOrUndefined - any defined should succeed", (t) => {
  const res = Guard.againstNullOrUndefined("string", "stringArg");
  t.true(res.succeeded);
});

test("againstNullOrUndefined - undefined should fail", (t) => {
  const res = Guard.againstNullOrUndefined(undefined, "stringArg");
  t.false(res.succeeded);
});

test("againstNullOrUndefinedBulk - all good args should succeed", (t) => {
  const res = Guard.againstNullOrUndefinedBulk([
    { argument: "string", argumentName: "goodString" },
  ]);
  t.true(res.succeeded);
});

test("againstNullOrUndefinedBulk - any bad arg should fail all", (t) => {
  const res = Guard.againstNullOrUndefinedBulk([
    { argument: "string", argumentName: "goodString" },
    { argument: null, argumentName: "badString" },
  ]);
  t.false(res.succeeded);
});
