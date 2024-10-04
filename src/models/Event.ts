import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Event extends Model {
    [x: string]: any;
}
Event.init(
    {
      event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
      },
      event_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
    event_description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    event_image:{
      type: DataTypes.STRING,
      allowNull: false
    },
    event_price:{
      type: DataTypes.INTEGER,
      allowNull: false
    }},
    {
      sequelize,
      modelName: "Event",
      timestamps: false,
      underscored: true,
      tableName: "events"
    }
  );
  