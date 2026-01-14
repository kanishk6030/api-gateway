import express from 'express';
import {getUserInfo} from '../controller.js/profile.js';

const router = express.Router();

router.get('/',getUserInfo);

export default router;