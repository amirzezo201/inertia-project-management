# frozen_string_literal: true

class StatusResource < ApplicationResource
  attributes :id, :project_id, :name, :category, :color, :position
end
