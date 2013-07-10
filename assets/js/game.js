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
			return (this.get('seat') == Merlion.game.currentPlayer());
		},
		defaults: {
			cards: ''
		},
		initialize: function() {
		},
		updateAll: function() {

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
			this.listenTo(Merlion.game.playerList, 'reset', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(Merlion.game.board, 'change:current_player', this.toggleCurrent);
		},
		toggleCurrent: function() {
			if (this.model.toAct()) {
				this.$el.addClass('acting');
			}
			else {
				this.$el.removeClass('acting');
			}
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
			if (this.heroView) {
				this.heroView.model = hero
			}
			else {
				this.heroView = new HeroView({ el: $('#hero'), model: hero });
			}
		},
		gameJoined: function(data) {
			this.board.setState(data);
			this.setPlayers(data.players);
		},
		holeCards: function(data) {
			this.heroView.model.set(data);
		},
		handStarted: function(data) {
			this.board.setState(data);
			this.setPlayers(data.players);
			this.setPlayerSeat(data.hero_seat);
		},
		stateChanged: function(data) {
			console.log('got state changed');
			var cp = data.current_player;
			var lp = data.last_player.seat;
			// update board
			this.board.setState(data);

			// update prev player
			this.playerList.each(function(p) {
				p.set({'last_action':  ''})
			});
			this.playerList.at(lp).set(data.last_player);

			// flash current player
		},
		stageChanged: function(data) {
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
			dispatch.on('join', this.gameJoined, this);
			dispatch.on('hand_started', this.handStarted, this);
			dispatch.on('hand_finished', this.handFinished, this);
			dispatch.on('state_changed', this.stateChanged, this);
			dispatch.on('stage_changed', this.stageChanged, this);
			dispatch.on('hole_cards', this.holeCards, this);
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
		setPlayers: function(players) {
			this.playerList.each(function(p) { p.destroy() });
			this.playerList.reset(players);
			$('#player-list').empty();
			this.playerList.each(function(p) {
				var pv = new PlayerView({ model: p});
				$('#player-list').append(pv.render().el);
			});
			console.log(this.playerList);
			//this.playerList.set(_.map(players, function(p) { return new Player(p) }));
		},
		currentPlayer: function() {
			return this.board.get('current_player');
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
