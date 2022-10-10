 const mariadb = require( 'mariadb' );

 const pool = mariadb.createPool({
    host: 'localhost' ,
    user: 'root' ,
    password: '1234' ,
    database: 'nodedb' ,
});

async function main(){
    try{
        let conn = await pool.getConnection();
        let rows = await conn.query( "SELECT * FROM users" );
        console.log(rows)

    } catch (err) {
        console.log(err);
    }
}
