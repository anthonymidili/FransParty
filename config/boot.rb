ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.

# Load .env before anything else so DATABASE_URL etc. are available
require "dotenv"
Dotenv.load(File.expand_path("../.env", __dir__))
