import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarMonths, calendarYears } from "./calendar";

test("only months with an edition are made, newest first", () => {
  const months = calendarMonths([
    { day: "2026-12-02" },
    { day: "2026-10-31" },
    { day: "2026-10-03" },
  ]);
  assert.deepEqual(
    months.map((month) => [month.key, month.name, month.editions.length]),
    [
      ["2026-12", "December 2026", 1],
      ["2026-10", "October 2026", 2],
    ],
  );
});

test("a month with its first edition joins the calendar", () => {
  const before = calendarMonths([{ day: "2026-10-31" }]);
  const after = calendarMonths([{ day: "2026-11-01" }, { day: "2026-10-31" }]);
  assert.deepEqual(
    before.map((month) => month.key),
    ["2026-10"],
  );
  assert.deepEqual(
    after.map((month) => month.key),
    ["2026-11", "2026-10"],
  );
});

test("weeks start on a Monday, padded at either end", () => {
  // 1 October 2026 is a Thursday; the 31st a Saturday.
  const [october] = calendarMonths([{ day: "2026-10-03" }]);
  assert.equal(october.weeks.length, 5);
  assert.ok(october.weeks.every((week) => week.length === 7));
  assert.deepEqual(
    october.weeks[0].slice(0, 4).map((cell) => cell?.date ?? null),
    [null, null, null, 1],
  );
  assert.deepEqual(
    october.weeks[4].map((cell) => cell?.date ?? null),
    [26, 27, 28, 29, 30, 31, null],
  );
});

test("a day has its edition, and the rest have none", () => {
  const edition = { day: "2026-10-03", stories: 4 };
  const [october] = calendarMonths([edition]);
  const days = october.weeks.flat().filter((cell) => cell !== null);
  assert.equal(days.length, 31);
  assert.deepEqual(
    days.filter((cell) => cell.edition).map((cell) => cell.edition),
    [edition],
  );
  assert.equal(days[2].day, "2026-10-03");
});

test("a leap February and a month starting on a Monday", () => {
  const [february] = calendarMonths([{ day: "2028-02-29" }]);
  assert.equal(february.weeks.flat().filter(Boolean).length, 29);
  // 1 June 2026 is a Monday: no blanks before it.
  const [june] = calendarMonths([{ day: "2026-06-10" }]);
  assert.equal(june.weeks[0][0]?.date, 1);
});

test("the month menu groups months by year, newest first", () => {
  const months = calendarMonths([
    { day: "2027-02-01" },
    { day: "2026-12-31" },
    { day: "2026-10-03" },
  ]);
  assert.deepEqual(
    calendarYears(months).map((group) => [
      group.year,
      group.months.map((month) => month.key),
    ]),
    [
      ["2027", ["2027-02"]],
      ["2026", ["2026-12", "2026-10"]],
    ],
  );
});
