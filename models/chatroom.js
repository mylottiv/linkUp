module.exports = function(sequelize, DataTypes) {
    var ChatData = sequelize.define("ChatData", {
      username:DataTypes.TEXT,
      address:DataTypes.STRING,
      active:DataTypes.BOOLEAN
    });
    return ChatData;
  };
  