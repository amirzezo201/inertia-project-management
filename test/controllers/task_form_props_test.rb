require "test_helper"

# The global "New task" dialog loads every project's statuses and milestones
# on demand (an optional Inertia prop), so pages don't pay for it up front.
class TaskFormPropsTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
  end

  test "task form options are not sent on a normal visit" do
    get projects_path

    assert_no_inertia_prop :task_form
  end

  test "a partial reload asking for them gets statuses, milestones, and people" do
    get projects_path
    version = inertia.view_data[:page]&.dig(:version) || InertiaRails.configuration.version

    get projects_path, headers: {
      "X-Inertia" => "true",
      "X-Inertia-Version" => version.to_s,
      "X-Inertia-Partial-Component" => "projects/index",
      "X-Inertia-Partial-Data" => "task_form"
    }

    form = response.parsed_body["props"]["task_form"]
    assert_equal statuses(:runwell_backlog).id, form["statuses"].first["id"]
    assert_equal projects(:runwell).id, form["statuses"].first["project_id"]
    assert_equal [ "Public launch" ], form["milestones"].map { it["name"] }
    assert_equal 2, form["users"].size
  end
end
