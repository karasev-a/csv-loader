let fs = require("fs");
const { Pool } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'csv_users',
  password: '',
  port: 5432,
})

getUserFromArray = (array, nameOfPropsUser) => {
  let user = {};
  for (let i = 0; i < array.length; i++) {
    if (isNaN(parseInt(array[i].trim()))) {
      user[`${nameOfPropsUser[i]}`] = array[i].trim();
    } else {
      user[`${nameOfPropsUser[i]}`] = parseInt(array[i].trim());
    }
  }
  return user;
}
getArrayUsersFromCsv = (path) => {
  let csvFile = fs.readFileSync(path).toString().trim();
  let arrOfRecord = csvFile.split('\n');
  let nameOfPropsUser = arrOfRecord.shift().split(', ');
  return arrOfRecord.map(arr => {
    let arrOfPropUser = arr.split(',');
    return getUserFromArray(arrOfPropUser, nameOfPropsUser);
  });
};

module.exports = {
 
  getUsersFromBd(req, res) {
    let jsonUsers = '';
    pool.connect((err, client, done) => {
      if (err) {
        console.log("not able to get connection " + err);
        res.status(400).res.send(err);
      };

      client.query("SELECT * from users", (err, result) => {
        
        if (err) {
          done();
          console.log(err);
          res.status(400).send(err);
        }
        let resultArray = result.rows.map(row => {
          delete row.id;
          return row;
        })
        jsonUsers = JSON.stringify(resultArray);

        let strUsers = resultArray.reduce((str, user) => {
          let line = "";
          for (var key in user) {
            if (line != "") line += ", "
            line += user[key];
          }
          return str + line + "\n";
        }, "UserName, FirstName, LastName, Age \n");

        fs.writeFile("usersFromDb.csv", strUsers, 'utf8', (err) => {
          if (err) {
            throw err;
          } else {
            console.log("The csv file from database was created");
            res.status(200);
            res.send(`<body><h1>Download users from DB to CSV file!</h1>
                      <div>${jsonUsers}</div>
                    </body>`);
          }
        });

      })
    });
  },

  getUsersFromDisk(req, res) {
    let users = getArrayUsersFromCsv("newCSV.csv");
    const textDropTable = "DROP TABLE IF EXISTS users";
    const createTable = `CREATE TABLE users(
      Id SERIAL PRIMARY KEY,
      UserName CHARACTER VARYING(30),
      FirstName CHARACTER VARYING(30),
      LastName CHARACTER VARYING(30),
      Age INTEGER
    );`;
    const textInsert = "INSERT INTO users(username, firstname, lastname, age) VALUES ($1, $2, $3, $4)";

    pool.connect(function (err, client, done) {
      if (err) {
        console.log("not able to get connection " + err);
        res.status(400).send(err);
      }

      client.query(textDropTable, function (err, result) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        res.status(200);
      });
     
      
      client.query(createTable, function (err, result) {
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        res.status(200);
      });
      users.forEach(user => {
        let { UserName, FirstName, LastName, Age } = user;
        let values = [UserName, FirstName, LastName, Age]
        client.query(textInsert, values, function (err, result) {
          if (err) {
            console.log(err);
            res.status(400).send(err);
          }
          res.status(200)
        });
      })
      res.send(`<body><h1>Download users from DB to CSV file!</h1>`)
    });
  }
}
