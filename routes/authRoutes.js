import Router from "express";
import {login_get, loin_post, signup_get, signup_post, logout_get} from "../controller/authController.js";

const router = Router();

router.get('/signup', signup_get);
router.post('/signup', signup_post);
router.get('/login', login_get);
router.post('/login', loin_post);
router.get('/logout', logout_get);

export default router;