import test from "ava";
import { parseCommand } from "../../src/handlers/parser";

test("parses command", (t) => {
  t.is(parseCommand("!command"), "command");
});

test("Non command returns string", (t) => {
  t.is(parseCommand("non-command"), "");
});
