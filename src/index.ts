import express,{Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { User } from "./models/User";
import {Event} from "./models/Event";
import { Admin } from "./models/Admin";
import AdminRouter  from "./routes/Adminrouter";
import UserRouter from "./routes/Userrouter";
import { EventRegistration } from "./models/EventRegistration";

dotenv.config();

const app: Express = express();
const port=3000;
app.use(express.json());
app.use(cookieParser());
const path = require('path');
app.use(express.static('uploads'))
app.use('/uploads', express.static('uploads')) 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(cors({
  credentials: true,
  origin: `${process.env.FRONTEND_URL}`,
}));


User.sync()
Event.sync()
Admin.sync()
EventRegistration.sync()


  .then(() => console.log("All models synced with the database"))
  .catch((err) => console.error("Unable to sync  all models:", err));
  app.use(UserRouter);
  app.use(AdminRouter);
app.listen(port, () => {
});

