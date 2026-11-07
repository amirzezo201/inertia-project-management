# frozen_string_literal: true

# A choice for a select or picker: { label, value } with the id as a string.
class OptionResource < BaseResource
  def self.with_label(attribute_name)
    Class.new(BaseResource) do
      attribute(:label) { |item| item.public_send(attribute_name) }
      attribute(:value) { |item| item.id.to_s }
    end
  end

  def self.from_enum(values, &label_fn)
    label_fn ||= ->(v) { v.to_s.humanize }
    values.map { |v| { label: label_fn.call(v.to_s), value: v } }
  end

  attribute(:label) { |item| item.name }
  attribute(:value) { |item| item.id.to_s }
end
