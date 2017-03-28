const opts = {
	version: 1,
	name: 'serviceworker',
	files: [
		'js',
		'css',
		'woff',
		'woff2',
		'otf',
		'ttf',
		'svg',
		'ico'
	].join('|')
};

opts.regex = new RegExp('\.(' + opts.files + ')$|^data\:image\/');
opts.cacheName = opts.name + '-v' + opts.version;

self.addEventListener('install', (event) => {
	// We pass a promise to event.waitUntil to signal how
	// long install takes, and if it failed
	if (self.skipWaiting) {
		self.skipWaiting();
	}

	event.waitUntil(
		// We open a cache…
		caches.open(opts.cacheName).then((cache) => {
			// And add resources to it
			return cache.addAll([
				'.'
			]);
		})
	);
});

// Deleting old caches
// The 'activate' event is generally used to do stuff that would have broken
// the previous version while it was still running, for example
// getting rid of old caches.
this.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(keyList) {
			// For all cache names, run this promise
			return Promise.all(keyList.map(function(key) {
				// If the key (name) doesn't match our current version,
				// throw it away
				if (key !== opts.cacheName) {
					return caches.delete(key);
				}
			}));
		})
	);
});

self.addEventListener('fetch', function(event) {
	// Calling event.respondWith means we're in charge
	// of providing the response. We pass in a promise
	// that resolves with a response object
	event.respondWith(
		// First we look for something in the caches that
		// matches the request
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request).then(function(response) {
				if (opts.regex.test(event.request.url) || event.request.mode === 'navigate') {
					return caches.open(opts.cacheName).then(function(cache) {
						cache.put(event.request, response.clone());
						return response;
					});
				} else {
					return response;
				}
			});
		})
	);
});
