# frozen_string_literal: true

class Settings::Sessions::IndexResource < BaseResource
  attributes :id, :user_agent, :ip_address, :created_at
end
