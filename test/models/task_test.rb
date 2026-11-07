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

  test "a blank estimation is stored as zero" do
    task = @project.tasks.create!(title: "No estimate", estimation: "", creator: users(:one))

    assert_equal 0, task.estimation
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

  test "subtasks can be created together with their parent" do
    task = @project.tasks.create!(
      title: "Launch",
      creator: users(:one),
      subtasks_attributes: [ { title: "Write post", creator: users(:one) }, { title: "", creator: users(:one) }, { title: "Tweet", creator: users(:one) } ]
    )

    assert_equal "RUN-3", task.identifier
    assert_equal [ "RUN-4", "RUN-5" ], task.subtasks.order(:number).map(&:identifier)
    assert_equal [ @project ], task.subtasks.map(&:project).uniq
    assert_equal 2, task.reload.subtasks_count
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

  test "active and backlog follow the status category, like Huly's views" do
    assert_equal [ tasks(:setup_ci) ], Task.active.to_a
    assert_equal [ tasks(:write_docs) ], Task.backlog.to_a

    tasks(:setup_ci).update!(status: statuses(:runwell_done))
    assert_empty Task.active
  end

  test "closed reflects the status category" do
    task = tasks(:setup_ci)
    assert_not task.closed?

    task.update!(status: statuses(:runwell_done))
    assert task.closed?
  end

  test "in_category_order lists tasks the way the board groups them" do
    started = projects(:runwell).tasks.create!(title: "Started", status: statuses(:runwell_in_progress), creator: users(:one))

    ordered = Task.in_category_order.to_a

    assert_equal [ tasks(:write_docs), tasks(:setup_ci), started ], ordered
  end
end
