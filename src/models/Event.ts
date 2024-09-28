import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Event extends Model { }
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
      event_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    event_time:{
        type: DataTypes.TIME,
        allowNull: false
    },
    event_venue:{
        type: DataTypes.STRING,
        allowNull: false
    },
    event_description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    event_rules:{
        type: DataTypes.STRING,
        allowNull: false
    },
    event_image:{
      type: DataTypes.STRING,
      allowNull: false
    }
    },
    {
      sequelize,
      modelName: "Event",
      timestamps: false,
      underscored: true,
      tableName: "events"
    }
  );
  