import { Router } from "express";
import { AdminController } from "../controllers/admin.controllers";
import { EventController } from "../controllers/eventcontroller";


const router=Router();
const adminController=new AdminController();
const eventcontroller=new EventController();
router.post('/registeradmin',adminController.registeradmin);
router.post('/adminlogin',adminController.loginadmin);
router.use('/admin',adminController.adminmiddleware);
router.post('/admin/createevents',adminController.createevents);
router.get('/admin/getallregistrations',adminController.registrationdetails);
router.delete('/admin/deleteevent/:event_id',eventcontroller.deleteevent);
router.post('/admin/updateuserstatus',adminController.verifyeventregistration);
router.post('/adminlogout',adminController.adminlogout);
export default router;
 
