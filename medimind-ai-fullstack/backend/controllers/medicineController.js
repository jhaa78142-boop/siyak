import MedicineReminder from "../models/MedicineReminder.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createReminder = asyncHandler(async (req, res) => {
  const reminder = await MedicineReminder.create({ patient: req.user._id, ...req.body });
  return created(res, reminder);
});

export const listReminders = asyncHandler(async (req, res) => {
  const reminders = await MedicineReminder.find({ patient: req.user._id, active: true }).sort({ createdAt: -1 });
  return ok(res, reminders);
});

export const markTaken = asyncHandler(async (req, res) => {
  const reminder = await MedicineReminder.findOne({ _id: req.params.id, patient: req.user._id });
  if (!reminder) throw new ApiError(404, "Reminder not found");

  reminder.log.push({ date: new Date(), taken: true });
  if (reminder.stockRemaining > 0) reminder.stockRemaining -= 1;
  await reminder.save();
  return ok(res, reminder, "Marked as taken");
});

export const updateReminder = asyncHandler(async (req, res) => {
  const reminder = await MedicineReminder.findOneAndUpdate(
    { _id: req.params.id, patient: req.user._id },
    req.body,
    { new: true }
  );
  if (!reminder) throw new ApiError(404, "Reminder not found");
  return ok(res, reminder, "Reminder updated");
});

export const deleteReminder = asyncHandler(async (req, res) => {
  await MedicineReminder.findOneAndUpdate({ _id: req.params.id, patient: req.user._id }, { active: false });
  return ok(res, null, "Reminder removed");
});
