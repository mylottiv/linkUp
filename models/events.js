module.exports = function(sequelize, DataTypes) {
  const EventData = sequelize.define("EventData", {
    creator_id:DataTypes.TEXT,
    eventname:DataTypes.TEXT,
    address:DataTypes.STRING,
    placeid:DataTypes.STRING,
    latitude:DataTypes.FLOAT,
    longitutde:DataTypes.FLOAT,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
  return EventData;
};
  