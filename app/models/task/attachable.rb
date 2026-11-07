# frozen_string_literal: true

# Files attached to a task: uploaded straight to storage by the browser
# (Active Storage direct uploads), then attached here by their signed ids. An
# image can also be embedded in the description, so removing an attachment
# removes its embeds too.
module Task::Attachable
  extend ActiveSupport::Concern

  MAX_ATTACHMENT_SIZE = 25.megabytes

  included do
    has_many_attached :attachments
    validate :attachments_within_size_limit
  end

  def attach_files(signed_ids)
    attachments.attach(signed_ids)
  end

  def remove_attachment(attachment)
    update!(description: description_without_images_of(attachment.blob))
    attachment.purge_later
  end

  private
    def attachments_within_size_limit
      attachments.each do |attachment|
        if attachment.blob.byte_size > MAX_ATTACHMENT_SIZE
          errors.add(:attachments, :too_large, message: "#{attachment.filename} is larger than #{MAX_ATTACHMENT_SIZE / 1.megabyte} MB")
        end
      end
    end

    def description_without_images_of(blob)
      if description&.include?(blob.signed_id)
        fragment = Nokogiri::HTML5.fragment(description)
        fragment.css("img").each { it.remove if it["src"].to_s.include?(blob.signed_id) }
        fragment.to_html
      else
        description
      end
    end
end
