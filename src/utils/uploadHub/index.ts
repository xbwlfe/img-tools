import type { IFilesSignatures, IFilesSignaturesResult } from './types'
import { PROVIDER_TYPE, UPLOADTYPE } from './types'

import { multipartUploadToAliyun, uploadToAliyun } from './aliyun-uploader'
import { uploadToS3 } from './aws-uploader'
import type { IUploadHubParams, UploadFunction } from './types'
export { UploadFileType } from './types'
import { post } from '@utils/request'
import { getExtentison as getFileExtension } from '@utils/upload/preprocess'

const UPLOAD_FN: {
  [key: string]: { [key: string]: UploadFunction }
} = {
  [UPLOADTYPE.DIRECT]: {
    [PROVIDER_TYPE.ALIYUN]: uploadToAliyun,
    [PROVIDER_TYPE.AWS_S3]: uploadToS3,
  },
  [UPLOADTYPE.MUTI_PART]: {
    [PROVIDER_TYPE.ALIYUN]: multipartUploadToAliyun,
  },
}

// 获取文件上传签名聚合接口
export const getFilesSignatures = async (params: IFilesSignatures) => {
  const json = await post<IFilesSignaturesResult>('/users/me/signatures/-/files', params)
  return json
}

async function uploadHub({ file, fileType, extension, duration, callback }: IUploadHubParams) {
  const ext = extension || getExtension(file)
  const params: IFilesSignatures = {
    fileSize: file.size,
    fileType: fileType,
    extension: ext,
  }
  if (duration) {
    params.parameters = btoa(
      JSON.stringify({
        duration: Math.floor(duration) || 1,
      }),
    )
  }
  const response = await getFilesSignatures(params)

  if (!response.success || !response.data) {
    return Promise.reject({ code: response.errorCode, errorMsg: response.errorMsg })
  }

  const { fileId, provider, sign, uploadType } = response.data

  const uploadFn = UPLOAD_FN[uploadType][provider]
  if (!uploadFn) {
    return Promise.reject(new Error(`Unsupported upload type: ${uploadType}`))
  }
  await uploadFn(file, sign, callback)

  return { fileId }
}

// 后台根据extension去配置上传文件，实际上允许的视频类型都会被配置为 "video/"
// 目前后台允许的视频extension有：mp4, mov, avi, webm, wmv, mpg, mpeg, m4v, ogv, mkv
// useDropzone选择的视频，useFsAccessApi配置不同，mime类型不同，avi为video/avi或者video/x-msvideo
function mapMIMEToExtension(mime: string) {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/gif':
      return 'gif'
    case 'video/x-ms-wmv':
      return 'wmv'
    case 'video/x-matroska':
      return 'mkv'
    case 'video/quicktime':
      return 'mov'
    case 'video/x-msvideo':
      return 'avi'
    case 'video/avi':
      return 'avi'
    case 'video/mp4':
      return 'mp4'
    case 'video/webm':
      return 'webm'
    case 'video/x-m4v':
      return 'm4v'
    case 'video/ogg':
      return 'ogv'
    case 'video/mpeg':
      return 'mpeg'
    default:
      return undefined
  }
}

function getExtension(file: File) {
  const type = mapMIMEToExtension(file.type)
  return type || getFileExtension(file?.name) || 'jpeg'
}



export { uploadHub }
