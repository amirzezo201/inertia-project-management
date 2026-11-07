// Active Storage's direct-upload endpoint (built into Rails).
const DIRECT_UPLOADS_URL = "/rails/active_storage/direct_uploads"

export interface UploadedBlob {
  signedId: string
  filename: string
  contentType: string
  // The file's permanent URL, the same one rails_blob_path gives.
  url: string
}

// Uploads a file straight to storage and resolves with the stored blob. The
// blob belongs to nothing until a record attaches it by its signed id.
export async function directUpload(file: File): Promise<UploadedBlob> {
  // Imported on first use, never at module load: @rails/activestorage starts a
  // timer that reads `window` as soon as it is imported, which crashes the
  // server-side render (Node has no window). An upload only happens in the
  // browser, so loading it here keeps it out of SSR entirely.
  const { DirectUpload } = await import("@rails/activestorage")

  return new Promise((resolve, reject) => {
    new DirectUpload(file, DIRECT_UPLOADS_URL).create((error, blob) => {
      if (error || !blob) {
        reject(new Error(error ?? `Could not upload ${file.name}`))
      } else {
        resolve({
          signedId: blob.signed_id,
          filename: blob.filename,
          contentType: blob.content_type,
          url: `/rails/active_storage/blobs/redirect/${blob.signed_id}/${encodeURIComponent(blob.filename)}`,
        })
      }
    })
  })
}
