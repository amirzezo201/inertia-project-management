import { router } from "@inertiajs/react"
import { useState } from "react"

import { directUpload, type UploadedBlob } from "@/lib/directUpload"
import { taskAttachmentsPath } from "@/routes"
import { formatFileSize } from "@/utils/fileSize"

// Uploads files to a task: each goes straight to storage, then the task
// attaches them all in one request. The Attachments section, a paste on the
// page and the description editor share one instance. Resolves with the
// uploaded files, so the editor can embed the images it was given.
export function useTaskAttachmentUpload(taskId: number, maxBytes: number) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(files: FileList | File[]): Promise<UploadedBlob[]> {
    const chosen = Array.from(files)
    // Mirrors the server's limit, so an oversized file is refused before it is
    // sent rather than after.
    const tooLarge = chosen.filter((file) => file.size > maxBytes)
    const accepted = chosen.filter((file) => file.size <= maxBytes)
    setError(
      tooLarge.length > 0
        ? `${tooLarge.map((file) => file.name).join(", ")}: larger than ${formatFileSize(maxBytes)}`
        : null,
    )
    if (accepted.length === 0) return []

    setUploading(true)
    try {
      const blobs = await Promise.all(accepted.map(directUpload))
      await attach(blobs)
      return blobs
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      )
      return []
    } finally {
      setUploading(false)
    }
  }

  function attach(blobs: UploadedBlob[]) {
    return new Promise<void>((resolve) => {
      router.post(
        taskAttachmentsPath(taskId),
        { signed_ids: blobs.map((blob) => blob.signedId) },
        {
          // Async, so a description save running alongside does not cancel it.
          async: true,
          preserveScroll: true,
          preserveState: true,
          onFinish: () => resolve(),
        },
      )
    })
  }

  return { upload, uploading, error }
}
