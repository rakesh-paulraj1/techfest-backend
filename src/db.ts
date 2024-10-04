import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";


dotenv.config({path: path.join(__dirname, "../.env")});
export const sequelize = new Sequelize(
  process.env.DBNAME || "",
  process.env.DBUSER || "",
  process.env.DBPASSWORD || "",
  {
    host: process.env.DBHOST,
    dialect: "mysql",
    logging: false,
    port: Number(process.env.PORT) || 3306
  }
);
