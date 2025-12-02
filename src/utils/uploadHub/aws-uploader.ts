import kebabCase from 'lodash.kebabcase'

import { post } from '@utils/request'

import type { IS3Signature, UploadFunction } from './types'

// 目前不支持进度，以及分片上传
const uploadToS3: UploadFunction = async (file, data) => {
  const signature = data as IS3Signature
  return upload(file, signature)
}

async function upload(file: File, data: IS3Signature): Promise<any> {
  const { url, expire, fileId, ...uploadParams } = data
  const fd = getFormData(uploadParams, file, file.type)
  return post(url, fd)
}

function getFormData(
  data: Omit<IS3Signature, 'url' | 'expire' | 'fileId'>,
  file: File,
  contentType: string,
) {
  const { policy, ...rest } = data
  const fd = new FormData()
  if (contentType) {
    fd.append('content-type', contentType)
  }
  fd.append('Policy', policy)
  for (const field in rest) {
    fd.append(kebabCase(field).replace('xamz', 'x-amz'), rest[field])
  }
  // 要放到最后
  fd.append('file', file)
  return fd
}

export { uploadToS3 }
