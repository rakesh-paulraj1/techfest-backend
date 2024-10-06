import { Router } from "express";

import { EventController } from "../controllers/eventcontroller";


const router=Router();

const eventController=new EventController();

router.get('/getallevents',eventController.getallevents);
router.post('/registeruser',eventController.registeruser);
router.post('/loginuser',eventController.loginuser);
router.use('/user',eventController.usermiddleware);
router.post('/user/eventregistration',eventController.eventregistration);
router.get('/user/getregisterdevents',eventController.getregisterdevents);
router.post('/userlogout',eventController.userlogout);
export default router;