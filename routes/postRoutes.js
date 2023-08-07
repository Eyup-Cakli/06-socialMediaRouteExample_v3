import Router from "express";
import { createPost_post, updatePost_put, deletePost_delete, likePost_put, getPost_get, getTimelinePosts_get, getCommentsByPost_get } from "../controller/postController.js";

const router = Router();

router.post('/post', createPost_post);
router.put('/post/:id', updatePost_put);
router.delete('/post/:id', deletePost_delete);
router.put('/post/:id/like', likePost_put);
router.get('/post/:id', getPost_get);
router.get('/post/timeline/all', getTimelinePosts_get);
router.get('post/comments/:id', getCommentsByPost_get);

export default router;