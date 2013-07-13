(function($) {

	Board = Backbone.Model.extend({
		defaults: {
			'status': ''
		},
		intialize: function() {
		},
		setState: function(data) {
			this.set(data);
		},
		// set the header, but only once
		setName: function() {
			if (this.get('name')) {
				$('#game-name').html(this.get('name'));
				this.off('change:name');
			}
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
		},
		setListeners: function() {
			this.listenTo(this.model, 'change:cards', this.render);
			this.listenTo(this.model, 'change:hand_type', this.render);
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
		isDealer: function() {
			return (this.get('seat') == Merlion.game.board.get('dealer'));
		},
		defaults: {
			cards: '',
			folded: false,
			hand_strength: '',
			hand_type: ''
		},
		updateAll: function() {
		},
		setHoleCards: function(data) {
			data.hand_strength = '';
			data.hand_type = '';
			this.set(data);
		},
		setHandInfo: function(data) {
			this.set(data);
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
			this.listenTo(this.model, 'change:last_action', this.updateFolded);
			this.listenTo(Merlion.game.playerList, 'reset', this.resetClasses);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(Merlion.game.board, 'set_dealer', this.toggleDealer);
			this.listenTo(Merlion.game.board, 'change:current_player', this.toggleCurrent);
		},
		resetClasses: function() {
			this.$el.removeClass('folded');
			this.render();
		},
		toggleDealer: function() {
			if (this.model.isDealer()) {
				this.$el.addClass('dealer');
			}
			else {
				this.$el.removeClass('dealer');
			}
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
		},
		updateFolded: function() {
			if (this.model.get('last_action') == 'fold') {
				this.$el.addClass('folded');
			}
		}
	});

	Game = Backbone.Model.extend({
		joinGame: function(id) {
			Merlion.send('join ' + id + ' ' + Merlion.userName());
		},
		setPlayerSeat: function(seat) {
			this.hero = this.playerList.at(seat);
			if (this.heroView) {
				this.heroView.model = this.hero;
				this.heroView.setListeners();
			}
			else {
				this.heroView = new HeroView({ el: $('#hero'), model: this.hero });
				this.heroView.setListeners();
			}
		},
		gameJoined: function(data) {
			// do nothing
		},
		holeCards: function(data) {
			this.heroView.model.setHoleCards(data);
		},
		handStarted: function(data) {
			this.board.setState(data);
			this.setPlayers(data.players);
			this.setPlayerSeat(data.hero_seat);
			this.board.trigger('set_dealer');
			this.hero.set({ cards: []});
		},
		playerMoved: function(data) {
			// set last player action
			var lp = data.last_player_to_act.seat;
			this.playerList.at(lp).set(data.last_player_to_act);
		},
		stateChanged: function(data) {
			// flash current player
			this.board.setState(data);
		},
		stageChanged: function(data) {
			this.board.setState(data);
			// reset players
			this.hero.setHandInfo({
				hand_strength: data.hand_strength,
				hand_type: data.hand_type
			});
			this.playerList.each(function(p) {
				p.set({'last_action':  '', put_in: 0})
			});
		},
		handFinished: function(data) {
			var us = this;
			var events = []
			_.each(data.winners, function(winner) {
				var winp = us.playerList.at(winner[0]);
				winstr = winp.get('name') + ' wins ' + '$' + winner[1] + ' with ' + winner[2].join('') + ' (' + winner[3] + ')';
				// flash winner
				events.push([function() {
					us.setStatusMsg({
						message: winstr
					})
				}, 3000]);
			});

			events.push([function() {
				Merlion.game.board.set({ 'status': ''})
			}, 0]);
			Merlion.delayEvents(events, true);
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
			dispatch.on('player_moved', this.playerMoved, this);
			dispatch.on('hole_cards', this.holeCards, this);
			dispatch.on('status_msg', this.setStatusMsg, this);
			this.board.on('change:name', this.board.setName);
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
		setStatusMsg: function(data) {
			Merlion.game.board.set({ 'status': data.message });
		},
		setPlayers: function(players) {
			this.playerList.each(function(p) { p.destroy() });
			this.playerList.reset(players);
			$('#player-list').empty();
			this.playerList.each(function(p) {
				var pv = new PlayerView({ model: p});
				$('#player-list').append(pv.render().el);
			});
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
