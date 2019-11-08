module.exports = function(sequelize, DataTypes) {
    var EventData = sequelize.define("EventData", {
      username:DataTypes.TEXT,
      address:DataTypes.STRING,
      city:DataTypes.STRING,
      state:DataTypes.STRING,
      zipcode:DataTypes.INTEGER,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      eventname:DataTypes.TEXT
    });
    return EventData;
  };
  