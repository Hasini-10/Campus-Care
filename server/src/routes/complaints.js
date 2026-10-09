import { Router } from "express";
import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q = "", status = "", category = "" } = req.query;
    const filter = {};
    if (status && status !== "All statuses") filter.status = status;
    if (category && category !== "All categories") filter.category = category;
    if (q.trim()) {
      const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { location: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
        { reporter: { $regex: safe, $options: "i" } }
      ];
    }
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, category, location, description, reporter } = req.body;
    if (![title, category, location, description, reporter].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ message: "Please fill in every field." });
    }
    const complaint = await Complaint.create({ title, category, location, description, reporter });
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }
    const allowed = ["Submitted", "In Progress", "Resolved"];
    const update = {};
    if (req.body.status !== undefined) {
      if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status." });
      update.status = req.body.status;
    }
    for (const field of ["title", "category", "location", "description", "reporter"]) {
      if (typeof req.body[field] === "string" && req.body[field].trim()) update[field] = req.body[field].trim();
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json(complaint);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found." });
    res.json({ message: "Complaint deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
