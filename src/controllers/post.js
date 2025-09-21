import jwt from "jsonwebtoken";
import { db } from "../../connect.js";
import moment from "moment";

export const getPosts = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not logged in!" });

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    const q = `
  SELECT 
    p.*, 
    u.id AS userId, 
    u.name, 
    u.profilePicture
    FROM posts AS p
    JOIN users AS u ON u.id = p.userId
    LEFT JOIN relationships AS r 
    ON r.followedUserId = p.userId
    AND r.followerUserId = ?
    WHERE r.followerUserId IS NOT NULL  
    OR p.userId = ?                 
    ORDER BY p.createdAt DESC
`;

    db.query(q, [userInfo.id, userInfo.id], (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching posts, please try again" });
      }
      return res.status(200).json(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Not logged in!" });

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json({ message: "Token is not valid" });

    const q =
      "INSERT INTO posts (`description`, `img`, `createdAt`, `userId`) VALUES (?)";

    const values = [
      req.body.description,
      req.body.img,
      moment(Date.now()).format("YYYY=MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching posts, please try again" });
      }
      return res.status(200).json({ message: "Post has been created" });
    });
  });
};
