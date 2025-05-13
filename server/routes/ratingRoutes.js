import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// POST: Submit a new rating and update contractor's average rating
router.post("/", async (req, res) => {
  try {
    const { contractorId, userId, rating, comment } = req.body;

    if (!contractorId || !userId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRating = {
      contractorId: new ObjectId(contractorId),
      userId: new ObjectId(userId),
      rating: parseFloat(rating),
      comment,
      date: new Date(),
    };

    await db.collection("rating_posts").insertOne(newRating);

    const allRatings = await db
      .collection("rating_posts")
      .find({ contractorId: new ObjectId(contractorId) })
      .toArray();

    const averageRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await db.collection("contractors").updateOne(
      { _id: new ObjectId(contractorId) },
      { $set: { rating: averageRating } }
    );

    res.status(201).json({ message: "Rating submitted and average updated" });
  } catch (error) {
    console.error("Error saving rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Get all ratings for a contractor with user info
router.get("/contractor/:contractorId", async (req, res) => {
  try {
    const contractorId = new ObjectId(req.params.contractorId);

    const ratings = await db.collection("rating_posts").aggregate([
      { $match: { contractorId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $sort: { date: -1 } },
    ]).toArray();

    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Failed to fetch ratings" });
  }
});

// GET: Get all ratings posted by a specific user with contractor info
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);

    const ratings = await db.collection("rating_posts").aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "contractors", // Make sure this is the exact name of your collection
          localField: "contractorId",
          foreignField: "_id",
          as: "contractor"
        }
      },
      { $unwind: "$contractor" },
      { $sort: { date: -1 } }
    ]).toArray();
    res.status(200).json(ratings);
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    res.status(500).json({ message: "Failed to fetch user ratings" });
  }
});


// DELETE: Delete a rating by its ID
router.delete("/:ratingId", async (req, res) => {
  try {
    const ratingId = new ObjectId(req.params.ratingId);

    // Find the rating to get contractorId before deleting
    const rating = await db.collection("rating_posts").findOne({ _id: ratingId });
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    await db.collection("rating_posts").deleteOne({ _id: ratingId });

    // Recalculate average for contractor
    const remainingRatings = await db
      .collection("rating_posts")
      .find({ contractorId: rating.contractorId })
      .toArray();

    const newAverage = remainingRatings.length > 0
      ? remainingRatings.reduce((sum, r) => sum + r.rating, 0) / remainingRatings.length
      : null;

    await db.collection("contractors").updateOne(
      { _id: rating.contractorId },
      { $set: { rating: newAverage } }
    );

    res.status(200).json({ message: "Rating deleted and average updated" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Failed to delete rating" });
  }
});

export default router;
