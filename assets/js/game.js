(function($) {

	Player = Backbone.Model.extend({
	});

	PlayerList = Backbone.Collection.extend({
		model: Player
	});

	PlayerView = Backbone.View.extend({
		tagName: 'li',
		initialize: function() {
			this.template = _.template($('#player-template').html());

			// set up listeners
			this.listenTo(this.model, 'change', this.render);
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		}
	});

	Game = Backbone.Model.extend({
		joinGame: function(id) {
			Merlion.send('join ' + id);
		},
		initialize: function() {
			this.playerList = new PlayerList();
			// set up listeners
			this.listenTo(this.playerList, 'add', this.addPlayer);

			// test it
			var player = new Player();
			player.set({ name: 'mike' });
			var player2 = new Player();
			player2.set({ name: 'meer' });
			this.playerList.add(player);
			this.playerList.add(player2);
		},
		addPlayer: function(player) {
			// creates a view for a player and renders it
			var pv = new PlayerView({model: player});
			$('#player-list').append(pv.render().el);
		},
		gotList: function(data) {
			// this.set({ 'games': data });
		},
	});

	GameView = Backbone.View.extend({
		el: $('#game'),
		initialize: function() {
		},
		render: function() {
		},
		// the templates
		templates: {
		}
	});
})(jQuery);
