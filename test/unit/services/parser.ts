import test from "ava";
import { parseCommand } from "../../../src/commands/util/parser";
import { PREFIX } from "../../../src/constants";
import { Args } from "../../../src/commands/definitions/Args";

test("parses command", (t) => {
  t.deepEqual(parseCommand(`${PREFIX}command`), { command: "command", args: new Args("") });
});

test("parses command with args", (t) => {
  t.deepEqual(parseCommand(`${PREFIX}command arg1 arg2`), {
    command: "command",
    args: new Args("arg1 arg2"),
  });
});

test("Non command returns object with empty props", (t) => {
  t.deepEqual(parseCommand("non-command"), { command: "", args: new Args("") });
});
