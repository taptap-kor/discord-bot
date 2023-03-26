const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
	host: '127.0.0.1',
	user: process.env.MYSQL_ID,
	password: process.env.MYSQL_PW,
  });
  
connection.connect();

exports.create = () => {
  //@@@@@@@@ 데이터베이스 생성 @@@@@@@@
  connection.query(
    'CREATE DATABASE if not exists magiceden',
    (error, results, fields) => {
      if (error) throw error;
    }
  );
  connection.query('USE magiceden', function (error, results, fields) {
    if (error) throw error;
  });

  //@@@@@@@@ 테이블 생성 @@@@@@@@
  connection.query(
    'CREATE TABLE if not exists nft(id int NOT NULL AUTO_INCREMENT PRIMARY KEY, nickname varchar(255), link varchar(255))',
    function (error, results, fields) {
      if (error) throw error;
    }
  );
};

