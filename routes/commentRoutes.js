import Router from "express";
import { createComment_post, updateComment_put, deleteComment_delete, getAllcomments_get, getCommentsByPostId_get, commentLike_put, undoLikeAComment_put } from "../controller/commentController.js";

const router = Router();

router.post('/comments/:id', createComment_post);
router.put('/comments/:id', updateComment_put);
router.delete('/comments/:id', deleteComment_delete);
router.get('/comments', getAllcomments_get);
router.get('/commentsbypost/:id', getCommentsByPostId_get);
router.put('/comments/like/:id', commentLike_put);
router.put('/comments/undolike/:id', undoLikeAComment_put)

export default router;