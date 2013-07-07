(function($) {
	LobbyView = Backbone.View.extend({
		el: $('#lobby'),
		initialize: function() {
			_.bindAll(this, 'render');
			this.render();
		},
		render: function() {
			$(this.el).append('oh hai');
		}
	});
	var lobbyView = new LobbyView();
})(jQuery);
