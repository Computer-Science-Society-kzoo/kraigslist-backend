 const mariadb = require( 'mariadb' );

 const pool = mariadb.createPool({
    host: 'http://127.0.0.1:3306/' ,
    user: 'root' ,
    password: '1234' ,
    database: 'nodedb' ,
});

async function main(){
    try{
        let conn = await pool.getConnection();
        let rows = await conn.query( "SELECT * FROM user" );
        console.log(rows)

    } catch (err) {
        console.log(err);
    }
}

main();