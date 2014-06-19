// 모듈을 변수에 저장합니다.
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var ejs = require('ejs');
var fs = require('fs');

// 생성자 선언합니다.
function Product(name) {
    this.name = name;
}

//더미데이터 집어넣음
var reservedList = [
    new Product('JavaScript'),
    new Product('JavaScript'),
    new Product('JavaScript'),
    new Product('JavaScript')
];

//서버 실행
var app = express();
var server = http.Server(app);
var indexPage = fs.readFileSync('index.html', 'utf8');

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
        reservedList.push(new Product(data.name));
        io.sockets.emit('reserve');
    });
});

// 서버를 실행합니다.
server.listen(9001, function () {
    console.log('Server Running at http://127.0.0.1:9001');
});