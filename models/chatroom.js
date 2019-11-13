module.exports = function(sequelize, DataTypes) {
    var ChatData = sequelize.define("ChatData", {
      username:DataTypes.TEXT,
      address:DataTypes.STRING,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });
    return ChatData;
  };
  