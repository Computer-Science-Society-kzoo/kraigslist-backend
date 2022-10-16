module.exports = (sequelize, Sequelize) => 
{
    const User = sequelize.define("users", 
        {
        username: 
        {
            type: Sequelize.VARCHAR
        },
        email:
        {
                type: Sequelize.VARCHAR
        },
        password:
        {
                type: Sequelize.VARCHAR
        },
        first_name:
        {
                type: Sequelize.VARCHAR
        },
        last_name:
        {
            type: Sequelize.VARCHAR
        },
        preferred_name:
        {
            type: Sequelize.VARCHAR
        },
        year:
        {
            type: Sequelize.INTEGER
        }
    });
    
    return User;
}