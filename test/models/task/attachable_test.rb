require "test_helper"

class Task::AttachableTest < ActiveSupport::TestCase
  setup do
    Current.session = users(:one).sessions.create!
    @task = tasks(:setup_ci)
  end

  test "attaches files uploaded directly to storage by their signed ids" do
    assert @task.attach_files([ active_storage_blobs(:pixel).signed_id ])

    assert_equal %w[ notes.txt pixel.png ], @task.attachments.map { it.filename.to_s }.sort
  end

  test "rejects a file over the size limit" do
    assert_not @task.attach_files([ active_storage_blobs(:huge).signed_id ])

    assert @task.errors.of_kind?(:attachments, :too_large)
    assert_equal %w[ notes.txt ], @task.reload.attachments.map { it.filename.to_s }
  end

  test "removing an attachment also removes its images from the description" do
    attachment = @task.attachments.sole
    signed_id = attachment.blob.signed_id
    @task.update!(description: %(<p>Before</p><p><img src="/rails/active_storage/blobs/redirect/#{signed_id}/notes.txt"></p><p>After</p>))

    @task.remove_attachment(attachment)

    assert_empty @task.reload.attachments
    assert_equal "<p>Before</p><p></p><p>After</p>", @task.description
  end
end
