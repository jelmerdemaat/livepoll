'use strict';

let app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

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

app.set('port', (process.env.PORT || 3000));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
