import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get all contractors
router.get("/", async (req, res) => {
  try {
    const collection = await db.collection("contractors");
    const results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch contractors");
  }
});

// Get contractor by ID
router.get("/:id", async (req, res) => {
  try {
    const collection = await db.collection("contractors");
    const query = { _id: new ObjectId(req.params.id) };
    const contractor = await collection.findOne(query);

    if (!contractor) {
      res.status(404).send("Contractor not found");
    } else {
      res.status(200).send(contractor);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching contractor");
  }
});

// Add new contractor
router.post("/", async (req, res) => {
  try {
    const newContractor = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      organizationName: req.body.organizationName,
      phone: req.body.phone,
      email: req.body.email,
      photo: req.body.photo,
      jobTypes: req.body.jobTypes.map(id => new ObjectId(id)),
      userId: new ObjectId(req.body.userId),
    };

    const collection = await db.collection("contractors");
    const result = await collection.insertOne(newContractor);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding contractor");
  }
});

// Update contractor
router.patch("/:id", async (req, res) => {
  try {
    const contractorId = new ObjectId(req.params.id);

    const updates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      organizationName: req.body.organizationName,
      phone: req.body.phone,
      email: req.body.email,
      photo: req.body.photo,
      jobTypes: req.body.jobTypes.map(id => new ObjectId(id)),
    };

    const collection = await db.collection("contractors");

    const result = await collection.updateOne(
      { _id: contractorId },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Contractor not found" });
    }

    // Fetch and return updated contractor
    const updatedContractor = await collection.findOne({ _id: contractorId });
    res.status(200).json(updatedContractor);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating contractor", error: err.message });
  }
});

// Delete contractor
router.delete("/:id", async (req, res) => {
  try {
    const collection = await db.collection("contractors");
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting contractor");
  }
});

// Get contractors by job type
router.get("/by-job-type/:jobTypeId", async (req, res) => {
  try {
    const { jobTypeId } = req.params;
    const objectId = new ObjectId(jobTypeId);
    const contractors = await db
      .collection("contractors")
      .find({ jobTypes: objectId })
      .toArray();
    res.status(200).json(contractors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch contractors", error: err.message });
  }
});

// Get contractors by user ID
router.get("/by-user/:userId", async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);
    const contractors = await db.collection("contractors").aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "job_types",
          localField: "jobTypes",
          foreignField: "_id",
          as: "jobTypesDetails",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          organizationName: 1,
          phone: 1,
          email: 1,
          photo: 1,
          jobTypesDetails: {
            $map: {
              input: "$jobTypesDetails",
              as: "job",
              in: { jobName: "$$job.jobName" },
            },
          },
        },
      },
    ]).toArray();

    res.status(200).json(contractors);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch contractors",
      error: err.message,
    });
  }
});

export default router;
