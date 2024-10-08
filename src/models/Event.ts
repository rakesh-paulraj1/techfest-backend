import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class Event extends Model {
    static findById(eventId: string) {
        throw new Error('Method not implemented.');
    }
    event_id: any;
    event_image: any;
    event_qr: any;
}
Event.init({
    event_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    event_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    event_description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    event_image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    event_price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    event_qr: {
        type: DataTypes.STRING,
        allowNull: true
    },
    event_teamsize: {
        type: DataTypes.INTEGER,
        allowNull: false 
    }
}, {
    sequelize,
    modelName: "Event",
    timestamps: false,
    underscored: true,
    tableName: "events"
});
