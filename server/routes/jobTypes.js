import express from "express";
import db from "../db/connection.js";

const router = express.Router();

// Get all job types grouped by category
router.get("/", async (req, res) => {
  try {
    // Fetch all job types from the "job_types" collection
    const jobTypes = await db.collection("job_types").find({}).toArray();

    // Group job types by category
    const groupedJobTypes = jobTypes.reduce((acc, job) => {
      if (!acc[job.category]) {
        acc[job.category] = [];
      }
      acc[job.category].push({
        _id: job._id,
        jobName: job.jobName,
        description: job.description,
      });
      return acc;
    }, {});

    res.status(200).json(groupedJobTypes);
  } catch (err) {
    console.error("Error fetching job types:", err);
    res.status(500).send("Error fetching job types");
  }
});

export default router;
