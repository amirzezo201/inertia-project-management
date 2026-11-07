require "test_helper"

class Task::PositionedTest < ActiveSupport::TestCase
  setup do
    Current.session = users(:one).sessions.create!
    @project = projects(:runwell)
    @todo = statuses(:runwell_todo)
    @backlog = statuses(:runwell_backlog)
    @first = tasks(:setup_ci)
    @second = @project.tasks.create!(title: "Second", status: @todo, creator: users(:one))
    @third = @project.tasks.create!(title: "Third", status: @todo, creator: users(:one))
  end

  test "move_to reorders a task within its column" do
    @third.move_to(@todo, before: @first)

    assert_equal [ @third, @first, @second ], column(@todo)
  end

  test "move_to puts a task into another column at the index" do
    @second.move_to(@backlog, before: tasks(:write_docs))

    assert_equal @backlog, @second.reload.status
    assert_equal @second, column(@backlog).first
    assert_equal [ @first, @third ], column(@todo)
  end

  test "move_to without a task to go before puts it last" do
    @first.move_to(@todo)

    assert_equal @first, column(@todo).last
  end

  test "move_to records a status change only when the column changes" do
    assert_no_difference -> { Event.count } do
      @third.move_to(@todo, before: @first)
    end

    assert_difference -> { Event.count }, 1 do
      @third.move_to(@backlog)
    end
  end

  private
    def column(status)
      @project.tasks.where(status: status).order(:position, :number).to_a
    end
end
