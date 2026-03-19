import { google } from 'googleapis'
import { Readable } from 'stream'

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive']
})

const drive = google.drive({ version: 'v3', auth })

export interface UploadResult {
  fileId: string
  url: string
  webViewLink: string
}

export async function uploadToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  treeCode: string
): Promise<UploadResult> {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!

  const folderRes = await drive.files.list({
    q: `name='${treeCode}' and mimeType='application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed=false`,
    fields: 'files(id)'
  })

  let folderId: string
  if (folderRes.data.files?.length) {
    folderId = folderRes.data.files[0].id!
  } else {
    const folder = await drive.files.create({
      requestBody: { name: treeCode, mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] },
      fields: 'id'
    })
    folderId = folder.data.id!
  }

  const stream = Readable.from(buffer)
  const uploaded = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: 'id, webViewLink'
  })

  const fileId = uploaded.data.id!
  await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } })

  return {
    fileId,
    url: `https://drive.google.com/uc?id=${fileId}`,
    webViewLink: uploaded.data.webViewLink!
  }
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  await drive.files.delete({ fileId })
}
