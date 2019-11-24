module.exports = function(sequelize, DataTypes) {
    var ChatData = sequelize.define("ChatData", {
      username:DataTypes.TEXT,
      // chatroom_id:DataTypes.STRING,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });

    // ChatData.associate = function(models) {

    //   ChatData.hasMany(models.MessageData, {
    //     foreignKey: {
    //       allowNull: false
    //     }
    //   });

    //   ChatData.belongsTo(models.EventData, {
    //     foreignKey: {
    //       allowNull: false
    //     }
    //   })
    // };

    return ChatData;
  };
  