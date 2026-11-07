require "test_helper"

class MyTasksControllerTest < ActionDispatch::IntegrationTest
  test "assigned shows tasks assigned to me" do
    sign_in users(:two)
    get my_tasks_path

    assert_inertia_component "my_tasks/show"
    assert_equal "assigned", inertia.props[:mode]
    assert_equal [ "RUN-1" ], inertia.props[:tasks].map { it[:identifier] }
  end

  test "created shows tasks I created" do
    sign_in users(:one)
    get my_tasks_path(mode: "created")

    assert_equal [ "RUN-1", "RUN-2" ], inertia.props[:tasks].map { it[:identifier] }.sort
  end
end
