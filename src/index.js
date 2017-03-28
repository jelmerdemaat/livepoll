'use strict';

const path = require('path');

const http = require('http');

const express = require('express');

const app = express();

const server = new http.Server(app);

const io = require('socket.io')(server);

const Poll = require('./poll')(io);

app.set('view engine', 'twig');

io.on('connection', socket => {
	socket.on('room enter', data => {
		let room = path.parse(data).name;

		socket.join(room, () => {
			if (!io.sockets.adapter.rooms[room].poll) {
				io.sockets.adapter.rooms[room].poll = new Poll(room);
			}

			let currentPoll = io.sockets.adapter.rooms[room].poll;

			currentPoll.updateClient(socket.id, currentPoll.average);
			currentPoll.update();

			socket.on('range change', value => {
				currentPoll.updateClient(socket.id, parseInt(value, 10));
				currentPoll.updateNumbers();
			});

			socket.on('disconnect', function () {
				currentPoll.deleteClient(socket.id);
				currentPoll.update();
			});
		});
	});
});

app.set('port', (process.env.PORT || 3000));

app.use('/scripts', express.static(path.join(__dirname, '../node_modules/')));
app.use('/static', express.static(path.join(__dirname, '../static/')));

app.get('/', (req, res) => {
	res.render(path.join(__dirname, '../views/', req.baseUrl));
});

app.get('/poll/:pollId', (req, res) => {
	res.render(path.join(__dirname, '../views/app', req.baseUrl));
});

app.get('/sw.js', (req, res) => {
	res.sendFile(path.join(__dirname, '../static/sw.js'));
});

app.use((req, res) => {
	res.status(404).send('Damn! 4-oh-4!');
});

server.listen(app.get('port'), () => {
	console.log('Node app is running on port', app.get('port'));
});
