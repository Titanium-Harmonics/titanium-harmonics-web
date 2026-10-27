import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { renderPlaceholderControls } from "../src/projects/templates/site-controls.js";
import { SITE_GITHUB_URL } from "../src/projects/templates/html.js";

function setup() {
  const message = { textContent: "" };
  const handlers = new Map<string, (event?: unknown) => void>();
  const timers = new Map<number, { callback: () => void; delay: number }>();
  const opened: unknown[][] = [];
  let timerId = 0;
  const card = {
    querySelector: () => message,
    addEventListener: (name: string, callback: (event?: unknown) => void) => handlers.set(name, callback),
  };
  const script = renderPlaceholderControls().match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  runInNewContext(script, {
    document: { querySelectorAll: () => [card] },
    window: {
      clearTimeout: (id: number) => timers.delete(id),
      setTimeout: (callback: () => void, delay: number) => {
        timers.set(++timerId, { callback, delay });
        return timerId;
      },
      open: (...args: unknown[]) => opened.push(args),
    },
  });
  const click = () => handlers.get("click")!();
  const key = (value: string, repeat = false) => {
    let prevented = false;
    handlers.get("keydown")!({ key: value, repeat, preventDefault: () => { prevented = true; } });
    return prevented;
  };
  return { message, timers, opened, click, key };
}

test("placeholder supports click, Enter and Space, then opens GitHub without resetting", () => {
  const ui = setup();
  assert.equal(ui.key("Tab"), false);
  assert.equal(ui.message.textContent, "");
  ui.click();
  assert.equal(ui.message.textContent, "Hey! Get in line xD We told you to wait, didn’t we?");
  assert.equal(ui.key("Enter"), true);
  assert.equal(ui.message.textContent, "Pressing it again won’t make it ship faster.");
  ui.key("Enter", true);
  assert.equal(ui.message.textContent, "Pressing it again won’t make it ship faster.");
  assert.equal(ui.key(" "), true);
  assert.equal(ui.message.textContent, "Okay, okay. We’re working on it.");
  const [timer] = ui.timers.values();
  assert.ok(timer);
  assert.equal(timer.delay, 3000);
  timer.callback();
  assert.equal(ui.message.textContent, "Okay, okay. We’re working on it. Probably.");
  ui.click();
  const last = "You’re persistent. Respect. Maybe check GitHub while you wait?";
  assert.equal(ui.message.textContent, last);
  assert.equal(ui.opened.length, 0);
  ui.click();
  ui.key("Enter");
  ui.key(" ");
  assert.deepEqual(ui.opened, Array.from({ length: 3 }, () => [SITE_GITHUB_URL, "_blank", "noopener,noreferrer"]));
  assert.equal(ui.message.textContent, last);
});

test("advancing past message three cancels the pending addition", () => {
  const ui = setup();
  ui.click(); ui.click(); ui.click();
  assert.equal(ui.timers.size, 1);
  ui.click();
  assert.equal(ui.timers.size, 0);
  assert.equal(ui.message.textContent, "You’re persistent. Respect. Maybe check GitHub while you wait?");
});
