import jwt from "jsonwebtoken";
import fs from "fs";
import userModel from "../models/userModel.js";

const publicKey = fs.readFileSync("./certs/public.pem");

// update user
export const updateUser_post = async (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, publicKey, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        res.redirect("/");
      } else {
        console.log(decodedToken);

        // Yeni e-posta ve parola bilgilerini al
        const { email, password } = req.body;
        const userId = decodedToken.id;

        try {
          // Kullanıcıyı token bilgisinden bul
          const user = await userModel.findById(userId);

          if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
          }

          // Yeni e-posta ve parolayı güncelle
          if (email) {
            user.email = email;
          }

          if (password) {
            user.password = password;
          }

          // Kullanıcıyı veritabanında güncelle
          await user.save();

          res.locals.user = user;
          res.status(200).json({ user: user.email });
        } catch (error) {
          console.log(error.message);
          res
            .status(500)
            .json({ error: "Kullanıcı güncellenirken bir hata oluştu." });
        }
      }
    });
  } else {
    res.locals.user = null;
    res.redirect("/");
  }
};

// delete account
export const deleteUser_delete = async (req, res) => {
  const token = req.cookies.jwt;
  const userId = decodedToken.id;

  if (token) {
    jwt.verify(token, publicKey, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        res.redirect("/");
      } else {
        console.log(decodedToken);
        let user = await userModel.findByIdAndDelete(userId);
        res.locals.user = user;
        res.redirect("/");
      }
    });
  } else {
    res.locals.user = null;
    res.redirect("/");
  }
};

// get a user
export const getUser_get = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    const { password, updatedAt, _id, isAdmin, __v, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
};

// follow a user
export const followAUser_put = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.locals.user = null;
      return res.redirect("/");
    }

    const decodedToken = jwt.verify(token, publicKey);
    const userIdInToken = decodedToken.id;
    const userIdInParams = req.params.id;
    if (userIdInToken === userIdInParams) {
      return res.status(500).json("You can't follow yourself");
    }

    const user = await userModel.findById(userIdInParams);
    const currentUser = await userModel.findById(userIdInToken);

    if (!user.followers.includes(userIdInToken)) {
      await Promise.all([
        user.updateOne({ $push: { followers: userIdInToken } }),
        currentUser.updateOne({ $push: { following: userIdInParams } }),
      ]);
      return res.status(200).json("user has been followed");
    } else {
      return res.status(403).json("you already follow this user");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json("An error occurred");
  }
};

// unfollow a user 
export const unfollowAUser_put = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.locals.user = null;
      return res.redirect("/");
    }

    const decodedToken = jwt.verify(token, publicKey);
    const userIdInToken = decodedToken.id;
    const userIdInParams = req.params.id;
    if (decodedToken.id === req.params.id) {
      return res.status(500).json("You can't unfollow yourself");
    }

    const user = await userModel.findById(userIdInParams);
    const currentUser = await userModel.findById(userIdInToken);

    if (user.followers.includes(userIdInToken)) {
      await Promise.all([
        user.updateOne({ $pull: { followers: userIdInToken } }),
        currentUser.updateOne({ $pull: { following: userIdInParams } }),
      ]);
      return res.status(200).json("user has been unfollowed");
    } else {
      return res.status(403).json("you are not following this user");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json("An error occurred");
  }
};