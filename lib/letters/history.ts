export interface DownloadRecord {
  letter_id: string
  downloaded_by: string
  ip?: string | null
}

/** Builds the download_history insert payload. Pure — easy to unit test. */
export function buildDownloadRecord(
  letterId: string,
  userId: string,
  ip?: string | null,
): DownloadRecord {
  return { letter_id: letterId, downloaded_by: userId, ip: ip ?? null }
}
