module.exports = function(sequelize, DataTypes) {
    var EventData = sequelize.define("EventData", {
      username:DataTypes.TEXT,
      address:DataTypes.STRING,
      active:DataTypes.BOOLEAN,
      eventname:DataTypes.TEXT
    });
    return EventData;
  };
  