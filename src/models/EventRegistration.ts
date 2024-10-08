import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";
import { Event } from './Event';  // Import Event model
import { User } from './User';   // Import User model for foreign key association

export class EventRegistration extends Model {
    [x: string]: any;
}

EventRegistration.init(
    {
        registration_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        upi_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        event_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Event, 
                key: 'event_id'
            },
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,  
                key: 'user_id'
            },
            allowNull: false
        },verification_status: {
            type: DataTypes.ENUM('verified', 'pending', 'rejected'), 
            defaultValue: 'pending',
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "EventRegistration",
        timestamps: true,
        underscored: true,
        tableName: "event_registrations"
    }
);


Event.hasMany(EventRegistration, { foreignKey: 'event_id' });
EventRegistration.belongsTo(Event, { foreignKey: 'event_id' });


User.hasMany(EventRegistration, { foreignKey: 'user_id' });
EventRegistration.belongsTo(User, { foreignKey: 'user_id' });
