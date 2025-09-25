import { db } from "../../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;


  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    // Build a dynamic SET clause so we don't overwrite with empty values
    const fields = [];
    const values = [];

    const allow = [
      "name",
      "email",
      "password",
      "profilePicture",
      "banner",
      "city",
    ];
    for (const key of allow) {
      const v = req.body[key];
      if (v !== undefined && v !== null && v !== "") {
        fields.push(`${key} = ?`);
        values.push(v);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const q = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`; // ✅ proper SQL
    values.push(userInfo.id);

    db.query(q, values, (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (result.affectedRows > 0) return res.json({ message: "Updated!" });
      return res
        .status(403)
        .json({ message: "You can update only your own profile" });
    });
  });
};
