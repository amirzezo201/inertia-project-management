ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "inertia_rails/minitest"
require_relative "test_helpers/session_test_helper"

# Build frontend assets once, before the parallel workers fork. Otherwise each
# worker starts its own Vite auto-build after a frontend change, and they race
# to empty public/vite-test (ENOTEMPTY). A no-op when the build is fresh.
ViteRuby.commands.build

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all
  end
end

class ActionDispatch::IntegrationTest
  include SessionTestHelper
end
