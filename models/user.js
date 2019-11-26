module.exports = function(sequelize, DataTypes) {
  var UserData = sequelize.define("UserData", {
    firstName:DataTypes.TEXT,
    lastName:DataTypes.TEXT,
    username:DataTypes.TEXT,
    password:DataTypes.TEXT,
    email:DataTypes.TEXT,
    token: {
      type: DataTypes.TEXT,
      defaultValue: null
    }
  });
  return UserData;
};
