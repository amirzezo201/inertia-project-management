require "test_helper"

class TasksControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
    @task = tasks(:setup_ci)
  end

  test "index lists tasks across projects filtered by mode" do
    get tasks_path(mode: "backlog")

    assert_inertia_component "tasks/index"
    assert_equal "backlog", inertia.props[:mode]
    assert_equal [ "RUN-2" ], inertia.props[:tasks].map { it[:identifier] }
  end

  test "show renders the task with its subtasks" do
    get task_path(@task)

    assert_inertia_component "tasks/show"
    assert_equal "RUN-1", inertia.props[:task][:identifier]
    assert_equal users(:one).id, inertia.props[:task][:creator_id]
    assert_equal [ "RUN-2" ], inertia.props[:subtasks].map { it[:identifier] }
    assert_nil inertia.props[:parent]
  end

  test "create adds a numbered task to the project" do
    post project_tasks_path(projects(:runwell)), params: { title: "Ship it", priority: "urgent" }

    task = Task.last
    assert_redirected_to project_path(projects(:runwell))
    assert_equal "RUN-3", task.identifier
    assert task.urgent?
    assert_equal users(:one), task.creator
  end

  test "create with subtasks numbers them after the parent" do
    post project_tasks_path(projects(:runwell)), params: {
      title: "Launch", subtasks_attributes: [ { title: "Write post" }, { title: "Tweet" } ]
    }, as: :json

    parent = Task.find_by!(title: "Launch")
    assert_equal [ "RUN-4", "RUN-5" ], parent.subtasks.order(:number).map(&:identifier)
    assert_equal [ users(:one) ], parent.subtasks.map(&:creator).uniq
  end

  test "create without a title returns errors" do
    assert_no_difference -> { Task.count } do
      post project_tasks_path(projects(:runwell)), params: { title: "" }
    end
  end

  test "update changes status and clears the milestone" do
    patch task_path(@task), params: { status_id: statuses(:runwell_done).id, milestone_id: "" }

    assert_redirected_to task_path(@task)
    @task.reload
    assert @task.closed?
    assert_nil @task.milestone
  end

  test "destroy removes the task and its subtasks" do
    assert_difference -> { Task.count }, -2 do
      delete task_path(@task)
    end

    assert_redirected_to project_path(projects(:runwell))
  end
end
