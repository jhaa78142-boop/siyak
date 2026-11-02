function zonedParts(date, timeZone) {
  const values = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(values.map(({ type, value }) => [type, Number(value)]));
}

export function localDateTimeToISOString(value, timeZone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || "");
  if (!match) throw new Error("Choose a valid date and time.");
  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const desired = {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
    hour: Number(hourText),
    minute: Number(minuteText),
  };
  const target = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute);
  let guess = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedParts(new Date(guess), timeZone);
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    guess += target - represented;
  }
  const actual = zonedParts(new Date(guess), timeZone);
  if (actual.year !== desired.year || actual.month !== desired.month || actual.day !== desired.day
      || actual.hour !== desired.hour || actual.minute !== desired.minute) {
    throw new Error("That local time is not valid in the selected timezone.");
  }
  return new Date(guess).toISOString();
}

export function isoToLocalDateTime(value, timeZone) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  const parts = zonedParts(date, timeZone);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}
