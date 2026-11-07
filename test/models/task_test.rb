require "test_helper"

class TaskTest < ActiveSupport::TestCase
  setup do
    @project = projects(:runwell)
  end

  test "new tasks get the next number and an identifier" do
    task = @project.tasks.create!(title: "Ship it", creator: users(:one))

    assert_equal 3, task.number
    assert_equal "RUN-3", task.identifier
  end

  test "new tasks default to the project's status and assignee" do
    @project.update!(default_assignee: users(:two))

    task = @project.tasks.create!(title: "Triage", creator: users(:one))

    assert_equal statuses(:runwell_backlog), task.status
    assert_equal users(:two), task.assignee
  end

  test "status and milestone must belong to the same project" do
    other = Project.create!(name: "Other", identifier: "OTH", creator: users(:one))
    other_milestone = other.milestones.create!(name: "Elsewhere")

    task = @project.tasks.new(title: "Mixed", creator: users(:one), status: other.statuses.first, milestone: other_milestone)

    assert task.invalid?
    assert task.errors.of_kind?(:status, :invalid)
    assert task.errors.of_kind?(:milestone, :invalid)
  end

  test "a task cannot become a subtask of its own subtask" do
    parent = tasks(:setup_ci)
    parent.parent = tasks(:write_docs)

    assert parent.invalid?
    assert parent.errors.of_kind?(:parent, :invalid)
  end

  test "subtasks are counted on the parent" do
    parent = tasks(:setup_ci)

    assert_difference -> { parent.reload.subtasks_count }, 1 do
      @project.tasks.create!(title: "Add lint step", parent: parent, creator: users(:one))
    end
  end

  test "closed reflects the status category" do
    task = tasks(:setup_ci)
    assert_not task.closed?

    task.update!(status: statuses(:runwell_done))
    assert task.closed?
  end
end
