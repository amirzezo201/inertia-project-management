# frozen_string_literal: true

class CreateComments < ActiveRecord::Migration[8.1]
  def change
    create_table :comments do |t|
      t.references :commentable, polymorphic: true, null: false
      t.references :creator, null: false
      t.text :body, null: false
      t.datetime :edited_at

      t.timestamps
    end
  end
end
