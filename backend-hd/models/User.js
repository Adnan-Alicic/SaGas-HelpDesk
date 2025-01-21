module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: DataTypes.STRING,
        role: {
            type: DataTypes.STRING, // Ovaj deo definiše kolonu `role`
            allowNull: false
        },
        sector: {
            type: DataTypes.STRING,
            allowNull: false, // Ukoliko želiš da sektor bude obavezan
        },

        pozicija: {
            type: DataTypes.STRING,
            allowNull: true, // Ili false ako je obavezno
            defaultValue: 'User',
          },
          
        salt: DataTypes.STRING
    });

    User.associate = function(models) {
        User.hasMany(models.Taskovi, { foreignKey: 'userId', as: 'tasks' });
    };

    return User;
};