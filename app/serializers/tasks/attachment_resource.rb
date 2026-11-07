# frozen_string_literal: true

# A file attached to a task. The URLs are Active Storage's own, relative to the
# app, so they work in <img> tags and in the description.
class Tasks::AttachmentResource < BaseResource
  THUMBNAIL_SIZE = [ 320, 320 ].freeze

  attributes :id, :content_type, :byte_size, :created_at

  attribute(:filename) { |attachment| attachment.filename.to_s }
  attribute(:image) { |attachment| attachment.image? }
  attribute(:url) { |attachment| routes.rails_blob_path(attachment, only_path: true) }
  attribute(:download_url) { |attachment| routes.rails_blob_path(attachment, disposition: "attachment", only_path: true) }

  attribute :thumbnail_url do |attachment|
    if attachment.variable?
      routes.rails_representation_path(attachment.variant(resize_to_limit: THUMBNAIL_SIZE), only_path: true)
    end
  end

  private
    def routes
      Rails.application.routes.url_helpers
    end
end
