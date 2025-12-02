import { UPLOAD } from '../../controller/enums'

import { post } from "@utils/request";
import { isMobile } from '../../utils/media'
import { preprocessImage, randomStr } from './preprocess'
import { uploadHub } from '@utils/uploadHub'

/**
 * 上传图片预处理逻辑
 **/
export default async function handleUpload(imgFile, fileType, otherOptions) {
  const {
    isCompress = false,
    isH5 = isMobile(),
    maxSize = UPLOAD.BACK_MAX_SIZE,
    asPNG = false,
    maxWidthHeight
  } = otherOptions || {}
  let file = imgFile
  let ratio = 0.5

  const { maxWidth = UPLOAD.MAX_IMAGE_WIDTH_PC, maxHeight = UPLOAD.MAX_IMAGE_HEIGHT_PC } =
    maxWidthHeight || {}

  // 1. 压缩图片
  if (isCompress) {
    const blobFile = await preprocessImage(imgFile, maxWidth, maxHeight, ratio, asPNG)
    // 转回文件类型
    file = new File([blobFile], randomStr(8), { type: blobFile.type })
  }
  // 压缩后再判断大小，防止高分辨率图片不通过, 上传大小为字节,后台限制为4M
  if (file.size > maxSize) {
    console.log('The file cannot exceed 4 MB!', file)
    throw new Error('The file cannot exceed 4 MB!')
  }

  const { fileId } = await uploadHub({ file, fileType })

  return { fileId, file }
}

async function uploadFace(imgFile, fileType) {
  // 1. 压缩图片
  const blobFile = await preprocessImage(
    imgFile,
    UPLOAD.MAX_IMAGE_WIDTH,
    UPLOAD.MAX_IMAGE_HEIGHT,
    0.5
  )
  // 转回文件类型
  const file = new File([blobFile], randomStr(8), { type: blobFile.type })

  // 2. 上传文件
  const { fileId } = await uploadHub({ file, fileType })

  // 3. 人脸检测
  const face = await userFaceDetection(fileId)

  return face
}

// 文件人脸检测
async function userFaceDetection(fileId) {
  const json = await post(`/v1/users/me/files/${fileId}/face-detections`)
  return json
}

export { preprocessImage, randomStr, uploadFace }
