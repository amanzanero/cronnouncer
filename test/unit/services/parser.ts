import test from "ava";
import { parseCommand } from "../../../src/lib/parser";

test("parses command", (t) => {
  t.deepEqual(parseCommand("!command"), { command: "command", args: [] });
});

test("parses command with args", (t) => {
  t.deepEqual(parseCommand("!command arg1 arg2"), { command: "command", args: ["arg1", "arg2"] });
});

test("Non command returns object with empty props", (t) => {
  t.deepEqual(parseCommand("non-command"), { command: "", args: [] });
});
