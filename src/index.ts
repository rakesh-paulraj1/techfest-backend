import express,{Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { User } from "./models/User";
import {Event} from "./models/Event";
import { Admin } from "./models/Admin";
import AdminRouter  from "./routes/Adminrouter";
import UserRouter from "./routes/Userrouter";

dotenv.config();

const app: Express = express();
const port=3000;
app.use(express.json());
app.use(cookieParser());
app.use(express.static(__dirname + "/files", { index: false }));
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173"
}));


User.sync()
Event.sync()
Admin.sync()

  .then(() => console.log("All models synced with the database"))
  .catch((err) => console.error("Unable to sync  all models:", err));
   
  app.use(AdminRouter);
  app.use(UserRouter);


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port!}`);
});