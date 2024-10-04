import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Admin extends Model{
}
Admin.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull:false},
   
},{
    sequelize,
    modelName: "Admin",
    timestamps: false,
    underscored: true,
    tableName: "admins"
  })

  

