(function($) {
	Lobby = Backbone.Model.extend({
		updateList: function() {
			Merlion.send('list');
		},
		initialize: function() {
			// set up events
			this.on('list', this.gotList);
		},
		gotList: function(data) {
			this.set({ 'games': data });
		}
	});

	LobbyView = Backbone.View.extend({
		el: $('#lobby'),
		initialize: function() {
			// listen to changes in the model
			_.bindAll(this, 'render');
		  this.listenTo(this.model, "change", this.render);
		},
		render: function() {
			// generic renderer. run the template with all model's attributes
    	this.$el.html(this.templates.lobby_list(this.model.attributes));
    	return this;
		},
		// the templates
		templates: {
			'lobby_list': _.template('<ul><% _.each(games, function(game) { %> <li><%= game.id %> (<%= game.players %>/<%= game.max_players %>)</li> <% }) %></ul>')
		}
	});
})(jQuery);
