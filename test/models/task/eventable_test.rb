require "test_helper"

class Task::EventableTest < ActiveSupport::TestCase
  setup do
    Current.session = users(:one).sessions.create!
    @task = tasks(:setup_ci)
  end

  test "creating a task records who created it" do
    task = projects(:runwell).tasks.create!(title: "Ship it", creator: users(:two))

    event = task.events.sole
    assert_equal "task_created", event.action
    assert_equal users(:two), event.creator
  end

  test "creating a sub-task is recorded on the parent" do
    subtask = projects(:runwell).tasks.create!(title: "Lint", parent: @task, creator: users(:one))

    event = @task.events.find_by!(action: "task_subtask_added")
    assert_equal subtask.identifier, event.particulars["identifier"]
  end

  test "each changed attribute is recorded with readable before and after values" do
    @task.update!(status: statuses(:runwell_done), priority: "urgent", assignee: nil)

    changes = @task.events.where(action: "task_updated").map { it.particulars.values_at("attribute", "from", "to") }
    assert_includes changes, [ "status", "Todo", "Done" ]
    assert_includes changes, [ "priority", "high", "urgent" ]
    assert_includes changes, [ "assignee", "Another User", nil ]
    assert_equal [ users(:one) ], @task.events.where(action: "task_updated").map(&:creator).uniq
  end

  test "description changes are recorded without copying the text" do
    @task.update!(description: "<p>New plan</p>")

    event = @task.events.find_by!(action: "task_updated")
    assert_equal({ "attribute" => "description", "from" => nil, "to" => nil }, event.particulars)
  end

  test "unchanged saves record nothing" do
    assert_no_difference -> { Event.count } do
      @task.update!(title: @task.title)
    end
  end

  test "activity includes the task's events and its comments, oldest first" do
    assert_equal [ events(:setup_ci_created), events(:looks_good_created) ], @task.activity.to_a
  end
end
