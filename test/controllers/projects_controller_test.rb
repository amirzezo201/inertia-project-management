require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
    @project = projects(:runwell)
  end

  test "index lists projects" do
    get projects_path

    assert_inertia_component "projects/index"
    assert_equal [ "RUN" ], inertia.props[:projects].map { it[:identifier] }
    assert_equal "Backlog", inertia.props[:default_statuses].first[:name]
  end

  test "show renders the project with its tasks and lookups" do
    get project_path(@project)

    assert_inertia_component "projects/show"
    assert_equal [ "RUN-1", "RUN-2" ], inertia.props[:tasks].map { it[:identifier] }
    assert_equal 5, inertia.props[:statuses].size
    assert_equal [ @project.id ], inertia.props[:statuses].map { it[:project_id] }.uniq
    assert_equal [ "Public launch" ], inertia.props[:milestones].map { it[:name] }
  end

  test "show filters tasks by mode" do
    get project_path(@project, mode: "active")

    assert_equal "active", inertia.props[:mode]
    assert_equal [ "RUN-1" ], inertia.props[:tasks].map { it[:identifier] }
  end

  test "the sidebar lists projects on every page" do
    get projects_path

    assert_equal [ "RUN" ], inertia.props[:sidebar_projects].map { it[:identifier] }
  end

  test "create makes a project owned by the current user" do
    assert_difference -> { Project.count }, 1 do
      post projects_path, params: { name: "Agents", identifier: "agt" }
    end

    project = Project.last
    assert_redirected_to project_path(project)
    assert_equal "AGT", project.identifier
    assert_equal users(:one), project.creator
  end

  test "create with a taken identifier returns errors" do
    assert_no_difference -> { Project.count } do
      post projects_path, params: { name: "Dup", identifier: "RUN" }
    end

    assert_redirected_to projects_path
  end

  test "update changes settings but not the identifier" do
    patch project_path(@project), params: { name: "Renamed", identifier: "NEW", default_assignee_id: users(:two).id }

    assert_redirected_to edit_project_path(@project)
    @project.reload
    assert_equal "Renamed", @project.name
    assert_equal "RUN", @project.identifier
    assert_equal users(:two), @project.default_assignee
  end

  test "destroy removes the project and its tasks" do
    assert_difference -> { Task.count }, -2 do
      delete project_path(@project)
    end

    assert_redirected_to projects_path
  end

  test "requires sign in" do
    sign_out
    get projects_path
    assert_redirected_to sign_in_path
  end
end
