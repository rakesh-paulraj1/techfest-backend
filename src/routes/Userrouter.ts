import { Router } from "express";
import { Usercontroller } from "../controllers/student.controller";

const router=Router();
const usercontroller=new Usercontroller();
router.post('/userlogin',usercontroller.loginuser);
router.use('/user',usercontroller.usermiddleware);
router.post('/addwaste',usercontroller.wasteinput);
router.post("/createcomplaint",usercontroller.createcomplaint);
router.get("/complaints/:id",usercontroller.yourcomplaints);
export default router;
