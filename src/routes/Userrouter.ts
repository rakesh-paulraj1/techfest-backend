import { Router } from "express";

import { EventController } from "../controllers/eventcontroller";


const router=Router();

const eventController=new EventController();

router.get('/getallevents',eventController.getallevents);

export default router;