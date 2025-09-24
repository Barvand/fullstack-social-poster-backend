// controllers/like.js
import { db } from "../../connect.js";
import jwt from "jsonwebtoken";

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";
  db.query(q, [req.query.postId], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching likes" });
    return res.status(200).json(rows.map((like) => like.userId));
  });
};

export const addLike = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not logged in!" });

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    const { postId } = req.body;
    if (!postId) return res.status(400).json({ message: "postId is required" });

    const q = "INSERT INTO likes (userId, postId) VALUES (?, ?)";
    db.query(q, [user.id, postId], (e) => {
      if (e?.code === "ER_DUP_ENTRY") return res.status(200).json({ ok: true }); // already liked
      if (e) return res.status(500).json({ message: "Error liking post" });
      return res.status(201).json({ ok: true });
    });
  });
};

export const deleteLike = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not logged in!" });

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    const postId = req.query.postId ?? req.body.postId; // support both
    if (!postId) return res.status(400).json({ message: "postId is required" });

    const q = "DELETE FROM likes WHERE userId = ? AND postId = ?";
    db.query(q, [user.id, postId], (e, result) => {
      if (e) return res.status(500).json({ message: "Error unliking post" });
      // 204 No Content is idiomatic for a successful DELETE
      return res.status(204).end();
    });
  });
};
