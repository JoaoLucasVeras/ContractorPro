import express from "express";
import cors from "cors";
import users from "./routes/users.js";
import contractor from "./routes/contractor.js";
import dotenv from "dotenv";
import jobTypeRoutes from "./routes/jobTypes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/contractors", contractor);
app.use("/users", users);
app.use("/job-types", jobTypeRoutes);
app.use("/rating-post", ratingRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});