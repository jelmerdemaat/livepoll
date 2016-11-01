'use strict';

module.exports = io => {
	return class Poll {
		constructor(id) {
			this.id = id;
			this.average = 50;
			this.numbers = {};
			this.total = this.average;
		}

		update() {
			this.updateUsers();
			this.updateNumbers();
		}

		updateUsers() {
			if (io.sockets.adapter.rooms[this.id]) {
				io.in(this.id).emit('update users', io.sockets.adapter.rooms[this.id].length);
			}
		}

		updateClient(clientId, value) {
			this.numbers[clientId] = value;
		}

		deleteClient(clientId) {
			delete this.numbers[clientId];
		}

		updateNumbers() {
			this.total = 0;

			if (Object.keys(this.numbers).length > 0) {
				for (let client in this.numbers) {
					if (!Object.hasOwnProperty.call(this.numbers, client)) {
						continue;
					}

					this.total += this.numbers[client];
				}

				this.average = this.total / Object.keys(this.numbers).length;
			} else {
				this.average = 50;
			}

			io.in(this.id).emit('average change', Math.round(this.average));
		}
	};
};
