require 'sinatra/base'
require 'sinatra/synchrony'
require 'sinatra/asset_pipeline'
require 'slim'
class MerlionWeb < Sinatra::Base
	register Sinatra::Synchrony
	register Sinatra::AssetPipeline
	set :assets_precompile, %w(app.js app.css)
	set :assets_css_compressor, :sass
	set :assets_js_compressor, :uglifier

	configure do
		set :server, 'ws://peanut.mikec.me:11111'
	end

	get '/' do
		@server = settings.server
		slim :lobby
	end

	get '/game/:id' do |id|
		@server = settings.server
		@game_id = id
		slim :game
	end
end
