var Merlion = (function($) {

	var updateLobby = function(data) {
		this.lobby.trigger('list', data);
	};

	var gameJoined = function(data) {
		this.game.trigger('join', data);
	};

	var handStarted = function(data) {
		this.game.trigger('hand_started', data);
	};

	var handFinished = function(data) {
		this.game.trigger('hand_finished', data);
	};

	var stateChanged = function(data) {
		this.game.trigger('state_changed', data);
	}

	var stageChanged = function(data) {
		this.game.trigger('stage_changed', data);
	}

	// Message handler. Channel is first element of the array, payload is the second.
	// These are used to trigger events
	var handleMessage = function(message) {
		console.log(message);
		json = JSON.parse(message.data)
		chan = json['merlion'][0];
		data = json['merlion'][1];
		dispatch.trigger(chan, data);
	};

	var genericError = function(error) {
		alert(error.message);
	};

	var createWebSocket = function(url) {
		var ws = new WebSocket(url);
		ws.onmessage = handleMessage;
		this.ws = ws;
	};

	var getWS = function() {
		return this.ws
	};

	var getGame = function() {
		return this.game
	};

	var init = function(opts) {
		window.dispatch = _.clone(Backbone.Events);
		dispatch.on('error', genericError, this);
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
		this.game = new Game();

		dispatch.on('hand_started', handStarted, this);
		dispatch.on('state_changed', stateChanged, this);
		dispatch.on('stage_changed', stageChanged, this);
		dispatch.on('hand_finished', handFinished, this);

		ws.onopen = _.bind(function() {
			this.game.joinGame(opts.game_id);
		}, this);
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
		'ws': getWS,
		'game': getGame
	}
})(jQuery);
