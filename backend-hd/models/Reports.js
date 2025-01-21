const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      // Povezivanje sa modelima `Taskovi` i `PrijavaSmetnji`
      Report.belongsTo(models.Taskovi, { foreignKey: 'task_id', as: 'task' });
      Report.belongsTo(models.PrijavaSmetnji, { foreignKey: 'complaint_id', as: 'complaint' });
    }
  }

  Report.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    complaint_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    validation: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    verification: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Report',
    tableName: 'Reports',
    timestamps: true,
  });

  return Report;
};
