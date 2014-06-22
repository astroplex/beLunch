// 모듈을 변수에 저장합니다.
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var ejs = require('ejs');
var fs = require('fs');

// 생성자 선언합니다.
function Product(productName, userName) {
    this.productName = productName;
    this.userName = userName;
}

//더미데이터 집어넣음
var reservedList = [

];

//서버 실행
var app = express();
var server = http.Server(app);
var indexPage = fs.readFileSync('index.html', 'utf8');

app.use("/css", express.static(__dirname + '/css'));

//라우트
app.get('/', function (request, response) {
    fs.readFile('index.html', function (error, data) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(ejs.render(indexPage, {
            reservedList: reservedList
        }));
    });
});

// GET - /seats
app.get('/reserved', function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(reservedList));
});

// 소켓 서버를 생성 및 실행합니다.
var io = socketio.listen(server);
io.set('log level', 2);
io.sockets.on('connection', function (socket) {
    // reserve 이벤트
    socket.on('reserve', function (data) {
        reservedList.push(new Product(data.productName, data.userName));
        reservedList.sort(function (a, b) {
            if (a.productName > b.productName)
                return 1;
            if (a.productName < b.productName)
                return -1;
            // a must be equal to b
            return 0;
        });

        io.sockets.emit('drawlist');
    });
    socket.on('delete', function (data) {
        reservedList.splice(data.number, 1);
        io.sockets.emit('drawlist');
    });
});

// 서버를 실행합니다.
server.listen(9001, function () {
    console.log('Server Running at 9001');
});