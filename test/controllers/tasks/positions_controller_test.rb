require "test_helper"

class Tasks::PositionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
    @task = tasks(:setup_ci)
  end

  test "update moves the task into a column before another task" do
    patch task_position_path(tasks(:setup_ci)), params: { status_id: statuses(:runwell_backlog).id, before_id: tasks(:write_docs).id }

    assert_redirected_to project_path(@task.project)
    assert_equal [ tasks(:setup_ci), tasks(:write_docs) ],
      @task.project.tasks.where(status: statuses(:runwell_backlog)).order(:position, :number).to_a
  end

  test "update rejects a status from another project" do
    other = Project.create!(name: "Other", identifier: "OTH", creator: users(:one)).statuses.first

    patch task_position_path(@task), params: { status_id: other.id }

    assert_response :not_found
    assert_equal statuses(:runwell_todo), @task.reload.status
  end
end
