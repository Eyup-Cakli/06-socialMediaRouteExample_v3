import Router from "express";
import { updateUser_post, deleteUser_delete, getUser_get, followAUser_put, unfollowAUser_put} from "../controller/userController.js";

const router = Router();

router.post('/user', updateUser_post);
router.delete('/user', deleteUser_delete);
router.get('/user/:id', getUser_get);
router.put('/user/:id/follow', followAUser_put);
router.put('/user/:id/unfollow', unfollowAUser_put);

export default router;