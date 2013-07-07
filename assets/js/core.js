var Merlion = (function($) {
	ws = new WebSocket('ws://10.0.0.13:11111/');
	var handleMessage = function(message) {
		alert(message.data);
	};
	ws.onmessage = handleMessage;
	ws.onopen = function() {
		alert('hello');
		ws.send('blah');
	}
	return {
		'ws': ws
	}
})(jQuery);
$(function() {
});
