module.exports = (sequelize, DataTypes) => {
    const PrijavaSmetnji = sequelize.define('PrijavaSmetnji', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sektor: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        opis: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Nije ovjereno',
        },
        validacija: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Ovo će pohraniti 'Odobreno' ili 'Odbijeno'
        },
        comment: {
            type: DataTypes.TEXT,  // Dodaj kolonu comment
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        hasTask: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Pretpostavljamo da nema taska na početku
        },
    }, {
        tableName: 'PrijavaSmetnji', // Naziv tabele u bazi podataka (poštujte velikim slovom ako je tako u bazi)
        timestamps: true, // Automatski će raditi sa `createdAt` i `updatedAt` kolonama
    });

    PrijavaSmetnji.associate = function(models) {
        PrijavaSmetnji.hasMany(models.Taskovi, { foreignKey: 'prijavaSmetnjiId', as: 'Taskovi' });  // Veza s Taskovi
    };

    return PrijavaSmetnji;
};