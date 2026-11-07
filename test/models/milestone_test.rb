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

  test "destroying a milestone keeps its tasks" do
    task = tasks(:setup_ci)

    milestones(:launch).destroy!

    assert_nil task.reload.milestone
  end
end
