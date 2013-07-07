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

	get '/' do
		slim :lobby
	end
end
