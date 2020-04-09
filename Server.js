const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const data = fs.readFileSync('./Database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const multer = require('multer');
const upload = multer({dest:'./upload'});

const connection = mysql.createConnection({
    host: conf.host, 
    user: conf.user, 
    password: conf.password, 
    port: conf.port, 
    database: conf.database
});
connection.connect();

app.get('/api/customers', (req, res) => {
    setTimeout(() => {
        connection.query('SELECT * FROM CUSTOMER WHERE isDeleted = 0', (err, rows, fields) => {
            res.send(rows);
        });    
    }, 1500);
});

app.use('/image', express.static('./upload'));

app.post('/api/customers', upload.single('image'), (req, res) => {
    var sql = "INSERT INTO CUSTOMER VALUES(null, ?,?,?,?,?, now(), 0)";
    var image = '/image/' + req.file.filename;
    var name = req.body.name;
    var birthday = req.body.birthday;
    var gender = req.body.gender;
    var job = req.body.job;

    console.log(req.pathname);

    console.log('image: ', image);
    console.log('name: ', name);
    console.log('birthday: ', birthday);
    console.log('gender: ', gender);
    console.log('job: ', job);
    
    var params = [image, name, birthday, gender, job];

    connection.query(sql, params, (err, rows, fields) => {
        if (null != err){
            console.log('error: ' + err);
            res.sendStatus(404);
            res.end();
            return;
        }
        res.send(rows);
    });
});

app.delete('/api/customers/:id', (req, res) => {
    var sql = 'UPDATE CUSTOMER SET isDeleted = 1 WHERE id = ?';
    console.log("delete id: " + req.params.id);
    var params = [req.params.id];
    connection.query(sql, params, (err, rows, fields) => {
        if (null != err){
            console.log('error: ' + err);
            res.sendStatus(404);
            res.end();
            return;
        }
        res.send(rows);
    });
})

app.listen(port, () => console.log(`Listening on port ${port}`));
