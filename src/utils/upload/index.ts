
import { UPLOAD } from './enums'

import { preprocessImage, randomStr } from './preprocess'
import { uploadHub } from '@utils/uploadHub'
import { UploadFileType } from '@utils/uploadHub/types'

interface IOptions {
  isCompress?: boolean
  isEdit?: boolean
  isH5?: boolean
  maxSize?: number
  asPNG?: boolean
}

/**
 * 参考 DS 上传逻辑,fileType约定如下：INPAINTING_IMAGE: 待编辑图片文件INPAINTING_IMAGE_MASK: 待编辑图片mask文件
 * isCompress - 分辨率超出才压缩，大小在压缩后判断
 * isH5 - pc为2048*2048，H5为1280*1280
 *  * */
export default async function handleUpload(
  imgFile: File,
  fileType: UploadFileType,
  otherOptions?: IOptions
) {
  const {
    isCompress = false,
    isH5 = isMobile(),
    maxSize = UPLOAD.BACK_MAX_SIZE,
    asPNG = false
  } = otherOptions || {}
  let file = imgFile
  let ratio = 0.5

  // 最小分辨率限制
  if (16 * 16 > file.size) {
    Promise.reject('Resolution needs to be greater than 16x16 !')
  }

  // 控制缩放像素
  const maxResolution = isH5
    ? UPLOAD.MAX_IMAGE_WIDTH * UPLOAD.MAX_IMAGE_HEIGHT
    : UPLOAD.MAX_IMAGE_WIDTH_PC * UPLOAD.MAX_IMAGE_HEIGHT_PC //区分H5及Pc端分辨率限制
  // 计算缩放比例
  if (file.size > maxResolution) {
    ratio = +(maxResolution / file.size + 0.01).toFixed(2) //+0.01是为了向上取整保证压缩后小于目标像素
  }

  // 1. 压缩图片
  if (isCompress) {
    const blobFile = await preprocessImage(
      imgFile,
      UPLOAD.MAX_IMAGE_WIDTH_PC,
      UPLOAD.MAX_IMAGE_HEIGHT_PC,
      ratio,
      asPNG
    )
    // 转回文件类型
    file = new File([blobFile as Blob], randomStr(8), { type: (blobFile as Blob).type })
  }

  // 压缩后再判断大小，防止高分辨率图片不通过, 上传大小为字节,后台限制为4M
  if (file.size > maxSize) {
    console.log('The file cannot exceed 4 MB!', file)
    return Promise.reject(new Error('The file cannot exceed 4 MB!'))
  }

  const { fileId } = await uploadHub({ file, fileType })

  return { fileId, file }
}

// 判断是否是H5
export function isMobile() {
  try {
    ; /Mobi|Android|iPhone/i.test(navigator.userAgent) || document.createEvent('TouchEvent')
    return true
  } catch (e) {
    return false
  }
}

export { randomStr }


