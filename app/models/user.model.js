module.exports = (sequelize, Sequelize) => 
{
    const User = sequelize.define("users", 
        {
        username: 
        {
            type: "varchar(50)",
            allowNull: false,
        },
        email:
        {
            type: "varchar(50)"
        },
        password:
        {
            type: "varchar(50)"
        },
        first_name:
        {
            type: "varchar(50)"
        },
        last_name:
        {
            type: "varchar(50)"
        },
        preferred_name:
        {
            type: "varchar(50)",
            allowNull: true,
        },
        year:
        {
            type: "tinyint(4)"
        }
    });
    
    return User;
}