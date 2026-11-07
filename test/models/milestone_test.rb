require "test_helper"

class MilestoneTest < ActiveSupport::TestCase
  test "defaults to planned" do
    assert projects(:runwell).milestones.create!(name: "Beta").planned?
  end

  test "target date cannot be before the start date" do
    milestone = milestones(:launch)
    milestone.target_date = milestone.start_date - 1.day

    assert milestone.invalid?
  end

  test "counts completed tasks for progress" do
    milestone = milestones(:launch)
    assert_equal 0, milestone.completed_tasks_count

    tasks(:setup_ci).update!(status: statuses(:runwell_done))
    assert_equal 1, milestone.completed_tasks_count
  end

  test "closed covers completed and canceled milestones" do
    beta = projects(:runwell).milestones.create!(name: "Beta", status: "canceled")

    assert_equal [ beta ], Milestone.closed.to_a
  end

  test "destroying a milestone keeps its tasks" do
    task = tasks(:setup_ci)

    milestones(:launch).destroy!

    assert_nil task.reload.milestone
  end
end
