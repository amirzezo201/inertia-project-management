require "test_helper"

class ProjectTest < ActiveSupport::TestCase
  test "creating a project sets up the default workflow" do
    project = Project.create!(name: "Agents", identifier: "agt", creator: users(:one))

    assert_equal "AGT", project.identifier
    assert_equal [ "Backlog", "Todo", "In Progress", "Done", "Canceled" ], project.statuses.map(&:name)
    assert_equal project.statuses.backlog.first, project.default_status
  end

  test "identifier must be short, uppercase, and unique" do
    assert Project.new(name: "Dup", identifier: "RUN", creator: users(:one)).invalid?
    assert Project.new(name: "Bad", identifier: "1ABC", creator: users(:one)).invalid?
    assert Project.new(name: "Long", identifier: "ABCDEFGHIJK", creator: users(:one)).invalid?
  end

  test "next task number increments the sequence" do
    project = projects(:runwell)

    assert_equal 3, project.next_task_number
    assert_equal 4, project.next_task_number
  end
end
