require "test_helper"

class CommentTest < ActiveSupport::TestCase
  setup do
    Current.session = users(:one).sessions.create!
  end

  test "posting a comment adds it to the task's activity" do
    comment = tasks(:setup_ci).comments.create!(body: "<p>On it</p>")

    assert_equal users(:one), comment.creator
    assert_equal "comment_created", comment.events.sole.action
    assert_includes tasks(:setup_ci).activity, comment.events.sole
  end

  test "the body is sanitized rich text and can't be blank" do
    comment = tasks(:setup_ci).comments.create!(body: "<p onclick='x()'>Hi<script>bad()</script></p>")
    assert_equal "<p>Hibad()</p>", comment.body

    assert tasks(:setup_ci).comments.new(body: "<p></p>").invalid?
  end

  test "editing marks the comment as edited" do
    comment = comments(:looks_good)
    assert_nil comment.edited_at

    comment.edit("<p>Updated</p>")

    assert_equal "<p>Updated</p>", comment.reload.body
    assert comment.edited_at.present?
  end

  test "saving an unchanged comment doesn't mark it edited" do
    comment = comments(:looks_good)

    comment.edit(comment.body)

    assert_nil comment.reload.edited_at
  end

  test "deleting a comment removes it from the activity" do
    comment = comments(:looks_good)
    event_id = events(:looks_good_created).id

    comment.destroy!

    assert_not_includes tasks(:setup_ci).activity.ids, event_id
  end
end
