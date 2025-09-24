// controllers/like.js
import { db } from "../../connect.js";
import jwt from "jsonwebtoken";

export const getRelationship = (req, res) => {
  const followedUserId = req.query.followedUserId ?? req.params.followedUserId;
  if (!followedUserId)
    return res.status(400).json({ message: "followedUserId required" });

  const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";
  db.query(q, [followedUserId], (err, rows) => {
    if (err)
      return res.status(500).json({ message: "Error fetching relationships" });
    // rows look like [{ followerUserId: 2 }, ...]
    return res.status(200).json(rows.map((r) => r.followerUserId)); // ✅ correct field
  });
};

export const addRelationship = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not logged in!" });

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    const { userId } = req.body; // the user you want to follow
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const q =
      "INSERT INTO relationships (`followerUserId`, `followedUserId`) VALUES (?)";
    const values = [userInfo.id, userId];

    db.query(q, [values], (e) => {
      if (e?.code === "ER_DUP_ENTRY") {
        // already following — return ok to keep idempotent
        return res.status(200).json({ ok: true });
      }
      if (e) return res.status(500).json({ message: "Error following user" });
      return res.status(201).json({ ok: true });
    });
  });
};

export const deleteRelationship = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not logged in!" });

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    const userId = req.query.userId ?? req.body.userId; // the user you want to unfollow
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const q =
      "DELETE FROM relationships WHERE followerUserId = ? AND followedUserId = ?";

    db.query(q, [userInfo.id, userId], (e, result) => {
      if (e) return res.status(500).json({ message: "Error unfollowing user" });
      // 204 No Content is standard for a successful DELETE
      return res.status(204).end();
    });
  });
};
