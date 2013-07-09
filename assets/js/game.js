(function($) {

	Board = Backbone.Model.extend({
		setState: function(data) {
			this.set(data);
		}
	});

	BoardView = Backbone.View.extend({
		el: $('#board'),
		initialize: function() {
			this.template = _.template($('#board-template').html());

			// set up listeners
			this.listenTo(this.model, 'change', this.render);
		},
		render: function() {
			this.$el.html(this.template(this.model.attributes));
			return this;
		}
	});

	HeroView = Backbone.View.extend({
		el: $('#hero'),
		events: {
			'click #fold': 'doFold',
			'click #call': 'doCall',
			'click #raise': 'doRaise'
		},
		initialize: function() {
			this.template = _.template($('#hero-template').html());
			// set up listeners
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(Merlion.game.board, 'change', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.attrs()));

			return this;
		},
		doFold: function() {
			Merlion.send('fold ' + Merlion.game.board.get('table_id'));
		},
		doCall: function() {
			Merlion.send('call ' + Merlion.game.board.get('table_id'));
		},
		doRaise: function() {
			Merlion.send('raise ' + Merlion.game.board.get('table_id'));
		}
	});

	Player = Backbone.Model.extend({
		toAct: function() {
			return (this.seat == Merlion.game.currentPlayer());
		},
		attrs: function() {
			var attrs = _.clone(this.attributes);
			attrs.to_act = this.toAct();
			return attrs;
		}
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
			this.$el.html(this.template(this.model.attrs()));
			return this;
		}
	});

	Game = Backbone.Model.extend({
		joinGame: function(id) {
			Merlion.send('join ' + id);
		},
		setPlayerSeat: function(seat) {
			var hero = this.playerList.at(seat);
			this.heroView = new HeroView({ el: $('#hero'), model: hero });
		},
		gameJoined: function(data) {
			this.board.setState(data);
			this.addPlayers(data.players);
			this.setPlayerSeat(data.hero_seat);
		},
		handStarted: function(data) {
			this.board.setState(data);
			this.updatePlayers(data.players);
		},
		stateChanged: function(data) {
			var cp = data.current_player;
			var lp = data.last_player.seat;
			// update board
			this.board.setState(data);

			// update prev player
			this.playerList.at(lp).set(data.last_player);

			// flash current player
		},
		stageChanged: function(data) {
			console.log(data);
			this.board.setState(data);
		},
		handFinished: function(data) {
			// flash winner
		},
		initialize: function() {
			this.playerList = new PlayerList();
			this.board = new Board();
			this.boardView = new BoardView({el: $('#board'), model: this.board});

			// set up listeners
			this.listenTo(this.playerList, 'add', this.addPlayer);
			this.on('join', this.gameJoined);
			this.on('hand_started', this.handStarted);
			this.on('hand_finished', this.handFinished);
			this.on('state_changed', this.stateChanged);
			this.on('stage_changed', this.stageChanged);
		},
		updatePlayers: function(players) {
			var us = this;
			_.each(players, function(p) {
				us.playerList.at(p.seat).set(p);
			});
		},
		addPlayers: function(players) {
			var us = this;
			_.each(players, function(p) {
				var player = new Player(p);
				us.playerList.add(player);
			});
		},
		addPlayer: function(player) {
			// creates a view for a player and renders it
			var pv = new PlayerView({model: player});
			$('#player-list').append(pv.render().el);
		},
		gotList: function(data) {
			// this.set({ 'games': data });
		},
		currentPlayer: function() {
			return this.board.current_player;
		}
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
