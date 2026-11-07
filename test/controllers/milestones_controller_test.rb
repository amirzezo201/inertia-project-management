require "test_helper"

class MilestonesControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
    @milestone = milestones(:launch)
  end

  test "index lists the project's milestones with progress" do
    get project_milestones_path(projects(:runwell))

    assert_inertia_component "milestones/index"
    assert_equal 1, inertia.props[:milestones].first[:tasks_count]
  end

  test "index filters milestones by mode" do
    get project_milestones_path(projects(:runwell), mode: "closed")

    assert_equal "closed", inertia.props[:mode]
    assert_empty inertia.props[:milestones]
  end

  test "show renders the milestone and its tasks" do
    get milestone_path(@milestone)

    assert_inertia_component "milestones/show"
    assert_equal [ "RUN-1" ], inertia.props[:tasks].map { it[:identifier] }
  end

  test "create adds a planned milestone" do
    post project_milestones_path(projects(:runwell)), params: { name: "Beta", target_date: "2027-01-15" }

    milestone = Milestone.last
    assert_redirected_to project_milestones_path(projects(:runwell))
    assert milestone.planned?
    assert_equal Date.new(2027, 1, 15), milestone.target_date
  end

  test "update changes the status" do
    patch milestone_path(@milestone), params: { status: "completed" }

    assert_redirected_to milestone_path(@milestone)
    assert @milestone.reload.completed?
  end

  test "destroy keeps the tasks" do
    delete milestone_path(@milestone)

    assert_redirected_to project_milestones_path(projects(:runwell))
    assert_nil tasks(:setup_ci).reload.milestone_id
  end
end
