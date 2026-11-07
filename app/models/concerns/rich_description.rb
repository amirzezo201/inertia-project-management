# frozen_string_literal: true

# Descriptions written in the Tiptap editor (like Huly's issue and milestone
# descriptions) are stored as HTML, limited to what the editor can produce.
module RichDescription
  extend ActiveSupport::Concern

  ALLOWED_TAGS = %w[
    p br h1 h2 h3 strong b em i u s code pre blockquote hr a
    ul ol li label input span div img
  ].freeze

  ALLOWED_ATTRIBUTES = %w[
    href target rel type checked src alt
    data-type data-checked data-id data-label data-mention-suggestion-char
  ].freeze

  # Only images of this app's own attachments: an outside image would load from
  # (and report every reader to) someone else's server.
  OWN_FILES = %r{\A/rails/active_storage/}

  EMPTY_DOCUMENT = %r{\A(\s|<p>\s*</p>|<br>)*\z}
  TRAILING_EMPTY_PARAGRAPHS = %r{(<p>\s*</p>)+\z}

  included do
    normalizes :description, with: ->(html) { RichDescription.sanitize(html) }
  end

  def self.sanitize(html)
    sanitized = Rails::HTML5::SafeListSanitizer.new.sanitize(html, tags: ALLOWED_TAGS, attributes: ALLOWED_ATTRIBUTES)
    sanitized = drop_outside_images(sanitized)
    sanitized = sanitized.sub(TRAILING_EMPTY_PARAGRAPHS, "")
    sanitized unless sanitized.match?(EMPTY_DOCUMENT)
  end

  def self.drop_outside_images(html)
    if html.include?("<img")
      fragment = Nokogiri::HTML5.fragment(html)
      fragment.css("img").each { it.remove unless it["src"].to_s.match?(OWN_FILES) }
      fragment.to_html
    else
      html
    end
  end
end
