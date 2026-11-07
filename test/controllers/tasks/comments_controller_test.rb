require "test_helper"

class Tasks::CommentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
    @task = tasks(:setup_ci)
  end

  test "create posts a comment" do
    assert_difference -> { @task.comments.count }, 1 do
      post task_comments_path(@task), params: { body: "<p>Done soon</p>" }
    end

    assert_redirected_to task_path(@task)
    assert_equal users(:one), @task.comments.last.creator
  end

  test "create with an empty body returns errors" do
    assert_no_difference -> { Comment.count } do
      post task_comments_path(@task), params: { body: "<p></p>" }
    end

    assert_redirected_to task_path(@task)
  end

  test "authors can edit their comments" do
    sign_in users(:two)
    patch comment_path(comments(:looks_good)), params: { body: "<p>Edited</p>" }

    assert_redirected_to task_path(@task)
    assert_equal "<p>Edited</p>", comments(:looks_good).reload.body
  end

  test "others can't edit or delete a comment" do
    patch comment_path(comments(:looks_good)), params: { body: "<p>Hijacked</p>" }
    assert_response :not_found

    delete comment_path(comments(:looks_good))
    assert_response :not_found
    assert Comment.exists?(comments(:looks_good).id)
  end

  test "authors can delete their comments" do
    sign_in users(:two)

    assert_difference -> { Comment.count }, -1 do
      delete comment_path(comments(:looks_good))
    end
  end
end
