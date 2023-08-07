import jwt from "jsonwebtoken";
import fs from "fs";
import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import commentModel from "../models/commentModel.js";

const publicKey = fs.readFileSync("./certs/public.pem");

// create a post
export const createPost_post = async (req, res) => {
    try {
        const token = req.cookies.jwt; 
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const description = req.body.description;
        const image = req.body.image;

        // Created post object
        const newPost = new postModel({
            userId: userId,
            description: description,
            image: image
        });

        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
}

// update a post
export const updatePost_put = async (req, res) => {
    try {
        const token = req.cookies.jwt; 
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const description = req.body.description;
        const postId = req.params.id; // Assuming postId is passed in the URL or request body

        // Fetch the existing post from the database
        const existingPost = await postModel.findById(postId);

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (existingPost.isDeleted) {
            return res.status(403).json({ error: 'You are not authorized to update this post because it is deleted' });
        }

        if (existingPost.userId === userId) {
            // Update the post properties
            existingPost.description = description;

            // Save the updated post
            const savedPost = await existingPost.save();

            res.status(200).json(savedPost);
        } else {
            return res.status(403).json({ error: 'You are not authorized to update this post' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// delete a post
export const deletePost_delete = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const postId = req.params.id; // Assuming postId is passed in the URL or request body

        // Fetch the existing post from the database
        const existingPost = await postModel.findById(postId);

        if (!existingPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (existingPost.userId === userId) {
            // Set isDeleted to true to "soft delete" the post
            existingPost.isDeleted = true;
            await existingPost.save();

            res.status(200).json({ message: 'Post deleted successfully' });
        } else {
            return res.status(403).json({ error: 'You are not authorized to delete this post' });
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

// like and undo like a post
export const likePost_put = async (req,res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const decodedToken = jwt.verify(token, publicKey);
        const userId = decodedToken.id;
        const postId = req.params.id;
        const user = await userModel.findById(userId);
        const post = await postModel.findById(postId);
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } });
            await user.updateOne({ $push: { likedPosts: postId }});
            res.status(200).json('The post has been liked');
        } else {
            await post.updateOne({ $pull: { likes: userId } });
            await user.updateOne({ $pull: { likedPosts: postId } });
            res.status(200).json('The post has been disliked');
        }

    } catch (err) {
        res.status(500).json(err);
    }
}

// get a post
export const getPost_get = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const postId = req.params.id;
        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.isDeleted) {
            return res.status(404).json({ error: 'Post is deleted' });
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
}

// get timeline post
export const getTimelinePosts_get = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }

        const decodedToken = jwt.verify(token, publicKey);
        const currentUserId = decodedToken.id;
        const currentUser = await userModel.findById(currentUserId);

        // Find user posts and friend posts, excluding deleted posts
        const userPosts = await postModel.find({ userId: currentUser._id, isDeleted: false });

        const friendPosts = await Promise.all(
            currentUser.following.map(async (friendId) => {
                const friendUser = await userModel.findById(friendId);
                if (friendUser && !friendUser.isDeleted) {
                    return postModel.find({ userId: friendId, isDeleted: false });
                }
            })
        );

        res.json(userPosts.concat(...friendPosts.filter(Boolean)));
    } catch (err) {
        res.status(500).json(err);
    }
}

//get comments by post
export const getCommentsByPost_get = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.locals.user = null;
            return res.redirect('/');
        }
        const postId = req.params.id;

        // Fetch the post from the database
        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Find the comments for the post, excluding deleted comments
        const comments = await commentModel.find({ postId: postId, isDeleted: false });

        res.status(200).json({comments: [comments]});
    } catch (err) {
        res.status(500).json(err);
    }
}