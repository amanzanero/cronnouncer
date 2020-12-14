import test from "ava";
import { parseCommand } from "../../../src/lib/parser";

test("parses command", (t) => {
  t.deepEqual(parseCommand("!command"), { command: "command", args: [] });
});

test("Non command returns string", (t) => {
  t.deepEqual(parseCommand("non-command"), { command: "" });
});
