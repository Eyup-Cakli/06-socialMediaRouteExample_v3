import jwt from "jsonwebtoken";
import fs from "fs";
import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import commentModel from "../models/commentModel.js";

const publicKey = fs.readFileSync("./certs/public.pem");

// create a comment
export const createComment_post = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const postId = req.params.id;
        const description = req.body.description;
        const post = await postModel.findById(postId);
        const user = await userModel.findById(userId);

        // created comment object
        const newComment = new commentModel({
            userId: userId,
            postId: postId,
            description: description
        });
        const savedComment = await newComment.save();
        await post.updateOne({ $push: { comments: savedComment._id } });
        await user.updateOne({ $push: { comments: savedComment._id} });
        res.status(200).json(savedComment);
    } catch (err) {
        res.status(500).json(err);
    }
}

// update a comment
export const updateComment_put = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const description = req.body.description;
        const commentId = req.params.id;

        // Fetch the existing comment from the database
        const existingComment = await commentModel.findById(commentId);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        if (existingComment.isDeleted) {
            return res.status(403).json({ error: 'You are not authorized to update this comment because it is deleted.' });
        }

        if (existingComment.userId === userId) {
            // Update the comment properties
            existingComment.description = description;

            // Save the updated comment
            const updatedComment = await existingComment.save();
            res.status(200).json(updatedComment);
        } else {
            return res.status(403).json({ error: 'You are not authorized to update this comment' });
        }

    } catch (err) {
        res.status(500).json(err);
    }
}

// delete a comment
export const deleteComment_delete = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const commentId = req.params.id;

        // Fetch the existing comment from the database
        const existingComment = await commentModel.findById(commentId);
        if (!existingComment) {
            return res.status(404).json({ error: "Comment is not found." });
        }

        if (existingComment.isDeleted) {
            return res.status(404).json({ error: "Comment is deleted." });
        }

        if (existingComment.userId === userId) {
            // "Soft delete" the comment
            existingComment.isDeleted = true;
            await existingComment.save();

            // Remove the comment reference from user's comments array
            await userModel.updateOne({ _id: userId }, { $pull: { comments: existingComment._id } });

            // Remove the comment reference from post's comments array
            await postModel.updateOne({ _id: existingComment.postId }, { $pull: { comments: existingComment._id } });

            res.status(200).json({ message: 'Comment deleted successfully' });
        } else {
            return res.status(403).json({ error: 'You are not authorized to delete this comment' });
        }

    } catch (err) {
        res.status(500).json(err);
    }
}

// get all comments
export const getAllcomments_get = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        // Fetch all comments from the database, excluding deleted comments
        const comments = await commentModel.find({ isDeleted: false });

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json(err);
    }
}

// get comments by postId 
export const getCommentsByPostId_get = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        const postId = req.params.id;

        // Fetch comments with the given postId, excluding deleted comments
        const comments = await commentModel.find({ isDeleted: false, postId: postId });

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json(err);
    }
}

// like an undo like a comment
export const commentLike_put = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const commentId = req.params.id;
        const user = await userModel.findById(userId);
        const comment = await commentModel.findById(commentId);
        if (!comment.likes.includes(userId)) {
            await user.updateOne({ $push: { likedComments: commentId } });
            await comment.updateOne({ $push: { likes: userId } }); 
            res.status(200).json('comment has been liked');
        } else {
            res.status(200).json('You already liked the comment');
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// undo like a comment
export const undoLikeAComment_put = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const commentId = req.params.id;
        const user = await userModel.findById(userId);
        const comment = await commentModel.findById(commentId);
        if (comment.likes.includes(userId)) {
            await user.updateOne({ $pull: { likedComments: commentId } });
            await comment.updateOne({ $pull: {likes: userId } });
            res.status(200).json('comment has been disliked');
        } else {
            res.status(200).json('You already disliked the comment');
        }
    } catch (err) {
        res.status(500).json(err);
    }
}