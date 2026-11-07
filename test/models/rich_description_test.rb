require "test_helper"

class RichDescriptionTest < ActiveSupport::TestCase
  test "keeps the formatting the editor produces" do
    html = '<h2>Plan</h2><p><strong>Bold</strong> <em>it</em> <a href="https://huly.io" target="_blank" rel="noopener noreferrer nofollow">link</a></p>' \
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Done</p></div></li></ul>'

    task = tasks(:setup_ci)
    task.update!(description: html)

    assert_equal html, task.description
  end

  test "strips scripts, event handlers, and javascript links" do
    task = tasks(:setup_ci)
    task.update!(description: '<p onclick="steal()">Hi<script>alert(1)</script> <a href="javascript:alert(1)">x</a></p>')

    assert_equal "<p>Hialert(1) <a>x</a></p>", task.description # script tag removed, its text is inert
  end

  test "an empty editor document is stored as nil" do
    milestone = milestones(:launch)
    milestone.update!(description: "<p></p>")

    assert_nil milestone.description
  end

  test "trailing empty paragraphs from the editor are dropped" do
    task = tasks(:setup_ci)
    task.update!(description: "<p>Hello</p><p></p><p></p>")

    assert_equal "<p>Hello</p>", task.description
  end

  test "plain text keeps working" do
    task = tasks(:setup_ci)
    task.update!(description: "Just text")

    assert_equal "Just text", task.description
  end
end
