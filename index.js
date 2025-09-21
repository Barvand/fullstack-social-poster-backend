import "dotenv/config";
import express from "express";
import authRoutes from "./src/routes/auth.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import postRoutes from "./src/routes/posts.js";
// import commentRoutes from "./routes/comments.js";
// import likeRoutes from "./routes/likes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth/", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/likes", likeRoutes);

app.listen(8800, () => {
  console.log("Connected to backend on http://localhost:8800");
});
