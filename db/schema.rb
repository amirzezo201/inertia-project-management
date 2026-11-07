# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_07_130001) do
  create_table "comments", force: :cascade do |t|
    t.string "commentable_type", null: false
    t.integer "commentable_id", null: false
    t.integer "creator_id", null: false
    t.text "body", null: false
    t.datetime "edited_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["commentable_type", "commentable_id"], name: "index_comments_on_commentable"
    t.index ["creator_id"], name: "index_comments_on_creator_id"
  end

  create_table "events", force: :cascade do |t|
    t.integer "project_id", null: false
    t.integer "creator_id", null: false
    t.string "eventable_type", null: false
    t.integer "eventable_id", null: false
    t.string "action", null: false
    t.json "particulars", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_events_on_creator_id"
    t.index ["eventable_type", "eventable_id"], name: "index_events_on_eventable"
    t.index ["project_id"], name: "index_events_on_project_id"
  end

  create_table "milestones", force: :cascade do |t|
    t.integer "project_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "status", default: "planned", null: false
    t.date "start_date"
    t.date "target_date"
    t.string "color"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "status"], name: "index_milestones_on_project_id_and_status"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.string "identifier", null: false
    t.text "description"
    t.integer "last_task_number", default: 0, null: false
    t.integer "creator_id", null: false
    t.integer "default_assignee_id"
    t.integer "default_status_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["creator_id"], name: "index_projects_on_creator_id"
    t.index ["default_assignee_id"], name: "index_projects_on_default_assignee_id"
    t.index ["default_status_id"], name: "index_projects_on_default_status_id"
    t.index ["identifier"], name: "index_projects_on_identifier", unique: true
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "user_agent"
    t.string "ip_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "statuses", force: :cascade do |t|
    t.integer "project_id", null: false
    t.string "name", null: false
    t.string "category", null: false
    t.string "color"
    t.integer "position", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id", "name"], name: "index_statuses_on_project_id_and_name", unique: true
  end

  create_table "tasks", force: :cascade do |t|
    t.integer "project_id", null: false
    t.integer "parent_id"
    t.integer "status_id", null: false
    t.integer "milestone_id"
    t.integer "assignee_id"
    t.integer "creator_id", null: false
    t.integer "number", null: false
    t.string "title", null: false
    t.text "description"
    t.integer "priority", default: 0, null: false
    t.date "start_date"
    t.date "due_date"
    t.decimal "estimation", precision: 8, scale: 2, default: "0.0", null: false
    t.integer "position", default: 0, null: false
    t.integer "subtasks_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assignee_id"], name: "index_tasks_on_assignee_id"
    t.index ["creator_id"], name: "index_tasks_on_creator_id"
    t.index ["milestone_id"], name: "index_tasks_on_milestone_id"
    t.index ["parent_id"], name: "index_tasks_on_parent_id"
    t.index ["project_id", "number"], name: "index_tasks_on_project_id_and_number", unique: true
    t.index ["project_id", "status_id", "position"], name: "index_tasks_on_project_id_and_status_id_and_position"
    t.index ["status_id"], name: "index_tasks_on_status_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.boolean "verified", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "sessions", "users"
end
