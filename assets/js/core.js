var Merlion = (function($) {
	window.dispatch = _.clone(Backbone.Events);

	var updateLobby = function(data) {
		this.lobby.trigger('list', data);
	};

	// Message handler. Channel is first element of the array, payload is the second.
	// These are used to trigger events
	var handleMessage = function(message) {
		console.log(message);
		json = JSON.parse(message.data)
		chan = json['merlion'][0];
		data = json['merlion'][1];
		dispatch.trigger(chan, data);
	};

	var createWebSocket = function(url) {
		var ws = new WebSocket(url);
		ws.onmessage = handleMessage;
		this.ws = ws;
	};

	var getWS = function() {
		return this.ws
	};


	var init = function(opts) {
		createWebSocket(opts.wsurl);
	};

	var initLobby = function() {
		// set up websocket event listeners
		dispatch.on('list', updateLobby, this);

		// create lobby
		this.lobby = new Lobby();
		this.lobbyView = new LobbyView({ model: this.lobby, el: $('#lobby') });

		// update list when websocket is ready
		ws.onopen = _.bind(function() {
			this.lobby.updateList();
		}, this);
	};

	var initGame = function(opts) {
		new Game();
	};

	var send = function(msg) {
		console.log('>>> ' + msg);
		ws.send(msg);
	};

	return {
		'init': init,
		'initLobby': initLobby,
		'initGame': initGame,
		'send': send,
		'ws': getWS
	}
})(jQuery);
