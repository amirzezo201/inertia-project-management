# frozen_string_literal: true

# Anything people can discuss, like Huly documents with comments in their
# activity. Commentables must respond to #project (comment events are scoped to it).
module Commentable
  extend ActiveSupport::Concern

  included do
    has_many :comments, as: :commentable, dependent: :destroy
  end
end
