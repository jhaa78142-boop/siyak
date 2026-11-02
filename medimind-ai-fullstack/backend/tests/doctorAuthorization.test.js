import test from "node:test";
import assert from "node:assert/strict";
import { assertApprovedDoctor } from "../utils/doctorAccess.js";
import { bookingKeys, intervalsOverlap } from "../utils/appointmentSlots.js";

const approvedDoctor = {
  role: "DOCTOR",
  status: "APPROVED",
  doctorProfile: { verification: { status: "approved" } },
};

test("allows an approved active doctor", () => {
  assert.doesNotThrow(() => assertApprovedDoctor(approvedDoctor));
  assert.doesNotThrow(() => assertApprovedDoctor({
    ...approvedDoctor,
    role: "doctor",
    status: "ACTIVE",
    doctorProfile: { verification: { status: "verified" } },
  }));
});

test("appointment slot claims protect every occupied minute and detect overlap", () => {
  const first = bookingKeys("doctor-a", "2026-03-10T09:00:00.000Z", 30);
  const overlap = bookingKeys("doctor-a", "2026-03-10T09:15:00.000Z", 30);
  const adjacent = bookingKeys("doctor-a", "2026-03-10T09:30:00.000Z", 30);

  assert.ok(first.some((key) => overlap.includes(key)));
  assert.equal(first.some((key) => adjacent.includes(key)), false);
  assert.equal(intervalsOverlap("2026-03-10T09:00:00.000Z", 30, "2026-03-10T09:15:00.000Z", 15), true);
  assert.equal(intervalsOverlap("2026-03-10T09:00:00.000Z", 30, "2026-03-10T09:30:00.000Z", 15), false);
  assert.deepEqual(bookingKeys("doctor-a", "invalid-date", 30), []);
});

test("denies missing identity, non-doctor roles, and non-approved states", () => {
  for (const user of [
    null,
    { ...approvedDoctor, role: "PATIENT" },
    { ...approvedDoctor, status: "PENDING" },
    { ...approvedDoctor, doctorProfile: { verification: { status: "pending" } } },
    { ...approvedDoctor, doctorProfile: { verification: { status: "rejected" } } },
    { ...approvedDoctor, status: "SUSPENDED", doctorProfile: { verification: { status: "suspended" } } },
    { ...approvedDoctor, status: "ACTIVE", doctorProfile: { verification: { status: "suspended" } } },
  ]) {
    assert.throws(() => assertApprovedDoctor(user), { statusCode: user ? 403 : 401 });
  }
});
