'use strict';

let app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('a user connected: ', socket.id);

	socket.on('range change', function(value){
		console.log('range change: ' + value);

		io.emit('range change', value);
	});

	socket.on('disconnect', function(){
		console.log('user disconnected: ', socket.id);
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
