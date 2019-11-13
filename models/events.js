module.exports = function(sequelize, DataTypes) {
  const EventData = sequelize.define("EventData", {
    creator_id:DataTypes.TEXT,
    eventname:DataTypes.TEXT,
    address:DataTypes.STRING,
    placeid:DataTypes.STRING,
    groupsize:DataTypes.INTEGER,
    latitude:DataTypes.FLOAT,
    longitutde:DataTypes.FLOAT,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  EventData.associate = function(models) {
    EventData.hasMany(models.ChatData, {
      onDelete: "cascade"
    });
  };

  return EventData;
};
  