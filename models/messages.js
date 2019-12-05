module.exports = function(sequelize, DataTypes) {
    var MessageData = sequelize.define("MessageData", {
      username:DataTypes.TEXT,
      content:DataTypes.STRING
    });

    MessageData.associate = function(models) {

      MessageData.belongsTo(models.ChatData, {
        foreignKey: {
          allowNull: false
        }
      });

      MessageData.belongsTo(models.EventData, {
        foreignKey: {
          allowNull: false
        }
      })
    };

    return MessageData;
  };