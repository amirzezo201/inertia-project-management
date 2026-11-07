require "test_helper"

class Tasks::AttachmentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:one)
    @task = tasks(:setup_ci)
  end

  test "create attaches directly uploaded files" do
    assert_difference -> { @task.attachments.count }, 1 do
      post task_attachments_path(@task), params: { signed_ids: [ active_storage_blobs(:pixel).signed_id ] }
    end

    assert_redirected_to task_path(@task)
  end

  test "create refuses a file over the size limit" do
    assert_no_difference -> { @task.attachments.count } do
      post task_attachments_path(@task), params: { signed_ids: [ active_storage_blobs(:huge).signed_id ] }
    end

    assert_redirected_to task_path(@task)
  end

  test "destroy removes the attachment" do
    attachment = @task.attachments.sole

    delete task_attachment_path(@task, attachment)

    assert_redirected_to task_path(@task)
    assert_empty @task.reload.attachments
  end

  test "destroy only finds attachments of the task" do
    other = projects(:runwell).tasks.create!(title: "Other", creator: users(:one))

    delete task_attachment_path(other, @task.attachments.sole)

    assert_response :not_found
    assert_equal 1, @task.attachments.count
  end
end
