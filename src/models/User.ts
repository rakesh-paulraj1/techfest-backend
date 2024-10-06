import { DataTypes, Model } from "sequelize";
import { sequelize } from "../db";

export class User extends Model {
    user_id: any;
    id: any;
}

User.init({
    user_id: {  
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    collegename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    registrationnumber: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "User",
    timestamps: false,
    underscored: true,
    tableName: "users"
});
