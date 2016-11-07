'use strict';

const path = require('path');

const http = require('http');

const express = require('express');

const app = express();

const server = new http.Server(app);

const io = require('socket.io')(server);

const Poll = require('./poll')(io);

io.on('connection', socket => {
	console.log('user connected: ', socket.id);

	socket.on('room enter', function (data) {
		let room = path.parse(data).name;

		socket.join(room, () => {
			if (!io.sockets.adapter.rooms[room].poll) {
				io.sockets.adapter.rooms[room].poll = new Poll(room);
			}

			let currentPoll = io.sockets.adapter.rooms[room].poll;

			currentPoll.updateClient(socket.id, currentPoll.average);
			currentPoll.update();

			socket.on('range change', value => {
				console.log('range change: ' + value + ', user: ' + socket.id);

				currentPoll.updateClient(socket.id, parseInt(value, 10));
				currentPoll.updateNumbers();
			});

			socket.on('disconnect', function () {
				console.log('user disconnected: ', socket.id);
				currentPoll.deleteClient(socket.id);
				currentPoll.update();
			});
		});
	});
});

app.set('port', (process.env.PORT || 3000));

app.use(express.static('views'));
app.use('/scripts', express.static(path.join(__dirname, '../node_modules/')));

app.get('/poll/:pollId', function (req, res) {
	res.sendFile(path.join(__dirname, '../views/app.html'));
});

app.use(function (req, res) {
	res.status(404).send('Damn! 4-oh-4!');
});

server.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});
