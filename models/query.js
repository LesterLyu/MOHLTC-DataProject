var mysql = require('mysql');
var fs = require('fs');

// var pool = mysql.createPool({
//   host: 'gendataproj.mysql.database.azure.com',
//   user: 'iamtheadmin@gendataproj',
//   password: 'ThereIsNoCowLevel@2',
//   database: 'dataproject',
//   port: 3306,
//   ssl: {
//       ca: fs.readFileSync('./BaltimoreCyberTrustRoot.crt.pem')
//   }
// })
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dataproject'
});
module.exports = {
  newQuery: function(query, callback)
  {
      pool.getConnection(function(err, connection) {
      if (err) return callback(err);
      pool.query(query, function(error, data)
      {
      if(error)
      {
        connection.release();
        console.error(error);
        callback(error, data);
      }
      else
      {
          console.log("Query success: " + query);
          connection.release();
          callback(error, data);
      }
      })
      });

  }
}
