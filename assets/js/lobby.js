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
			this.template = _.template($('#lobby-template').html());
		  this.listenTo(this.model, "change", this.render);
		},
		render: function() {
			// generic renderer. run the template with all model's attributes
    	this.$el.html(this.template(this.model.attributes));
    	return this;
		},
	});
})(jQuery);
