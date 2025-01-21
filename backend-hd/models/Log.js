module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define('Log', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING, // Tip akcije (npr. login, logout, task creation)
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT, // Opis radnje
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        },
    }, {
        tableName: 'Logs',
        timestamps: false,
    });

    Log.associate = function (models) {
        Log.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Log;
};
