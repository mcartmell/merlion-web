var Merlion = (function($) {

	var updateLobby = function(data) {
		this.lobby.trigger('list', data);
	};

	var gameJoined = function(data) {
		this.game.trigger('join', data);
	};

	// specify UI delays for certain types of event
	var chanDelays = {
		player_moved: 1000,
		hand_started: 2000,
		hand_finished: 0
	};

	// Message handler. Channel is first element of the array, payload is the second.
	// These are used to trigger events
	var handleMessage = function(message) {
		var json = JSON.parse(message.data)
		var chan = json['merlion'][0];
		var data = json['merlion'][1];
		var delay = chanDelays[chan] || 0;
		var immediate = false;
		if (typeof delay == 'object') {
			immediate = delay.immediate;
			delay = delay.delay;
		}
		var cb = function() {
			dispatch.trigger(chan, data);
		}
		delayEvent(cb, delay, immediate);
	};

	var x = 0;

	var delayEvent = function(e, delay, immediate) {
		delayEvents([[e, delay]], immediate);
	}

	var delayEvents = function(events, immediate) {
		x = x + 1;
		var our_id = x;
		if (events) {
			if (immediate) {
				// these events must happen at the next tick (but still in order)
				Merlion.waitingEvents = events.concat(Merlion.waitingEvents)
			}
			else {
				// these events are processed after everything else is done
				Merlion.waitingEvents = Merlion.waitingEvents.concat(events);
			}
		}
		else {
			Merlion.waiting = false;
		}
		//console.log([Merlion.waiting, our_id]);
		our_id = our_id + 1;
		if (!Merlion.waiting) {
			var next = Merlion.waitingEvents.shift();
			if (next) {
				setTimeout(Merlion.delayEvents, next[1]);
				Merlion.waiting = true;
				// console.log(['executing', our_id]);
				next[0].call();
			}
		}
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
		this.waitingEvents = [];
		this.waiting = false;
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
		'game': getGame,
		'delayEvent': delayEvent,
		'delayEvents': delayEvents
	}
})(jQuery);
