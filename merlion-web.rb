require 'sinatra/base'
require 'sinatra/asset_pipeline'
require 'slim'
require 'sinatra/config_file'

class MerlionWeb < Sinatra::Base
	register Sinatra::AssetPipeline
	register Sinatra::ConfigFile

	set :assets_precompile, %w(app.js app.css *.gif *.woff)
	set :assets_css_compressor, :sass
	set :assets_js_compressor, :uglifier

	config_file 'config.yml'

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
