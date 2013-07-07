var Merlion = (function($) {
	window.dispatch = _.clone(Backbone.Events);

	var updateLobby = function() {
		alert('wheee!');
	};

	var ws = new WebSocket('ws://10.0.0.13:11111/');

	// Message handler. Channel is first element of the array, payload is the second.
	// These are used to trigger events
	var handleMessage = function(message) {
		json = JSON.parse(message.data)
		chan = json['merlion'][0];
		data = json['merlion'][1];
		dispatch.trigger(chan, data);
	};

	ws.onmessage = handleMessage;

	var init = function() {
		// set up dispatch events
		dispatch.on('list', updateLobby);

		ws.onopen = function() {
			ws.send('list');
		}
	};

	return {
		'ws': ws,
		'init': init
	}
})(jQuery);
$(function() {
	Merlion.init();
});
