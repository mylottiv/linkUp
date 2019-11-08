module.exports = function(sequelize, DataTypes) {
    var MessageData = sequelize.define("MessageData", {
      username:DataTypes.TEXT,
      content:DataTypes.STRING
    });
    return MessageData;
  };