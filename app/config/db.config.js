module.exports = 
{
    HOST: process.env.HOST,
    USER: process.env.USER,
    PASSWORD: process.env.PASSWORD,
    DB: "kraigslist_sql",
    dialect: "mysql",
    pool:
        {
            max: 5,
            min: 0,
            aquire: 30000,
            idle: 10000
        }
};