import { apiGet, apiUpload, isApiEnabled } from '@/lib/apiClient'

export type ApiDocument = {
  id: string
  workspace_id: string
  file_name: string
  file_type: string
  source_type: string
  storage_url: string
  status: 'pending' | 'processing' | 'parsed' | 'indexed' | 'failed'
  extracted_text: string
  metadata: Record<string, unknown>
  created_at: string
}

export async function uploadDocumentToApi(file: File): Promise<ApiDocument | null> {
  if (!isApiEnabled()) return null
  try {
    return await apiUpload<ApiDocument>('/api/v1/documents/upload', file)
  } catch {
    return null
  }
}

export async function listDocumentsFromApi(): Promise<ApiDocument[] | null> {
  if (!isApiEnabled()) return null
  try {
    return await apiGet<ApiDocument[]>('/api/v1/documents')
  } catch {
    return null
  }
}
