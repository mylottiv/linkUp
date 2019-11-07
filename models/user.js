module.exports = function(sequelize, DataTypes) {
  var UserData = sequelize.define("UserData", {
    firstname:DataTypes.TEXT,
    lastname:DataTypes.TEXT,
    username:DataTypes.TEXT,
    password:DataTypes.TEXT,
    email:DataTypes.TEXT
  });
  return UserData;
};
