export interface IUploadOptions {
  duration?: number
  onUploadProgress?: (progress: number) => void
}

export interface IUploadCallback {
  onUploadProgress?: (progress: number) => void
}

// extension为可选参数，如果未提供，则自动根据file.type和file.name获取
// fileType为上传文件类型，枚举值为UploadFileType
export interface IUploadHubParams {
  file: File
  fileType: string
  extension?: string
  duration?: number
  callback?: IUploadCallback
}
export type UploadSignature = IS3Signature | IAliyunSignature | IAliyunMultipartSignature

export type UploadFunction = (
  file: File,
  signature: UploadSignature,
  callback?: IUploadCallback,
) => Promise<any>

export interface IS3Signature {
  url: string
  fileId: string
  expire: string
  policy: string
  key: string
  xamzMetaParameters: string
  xamzAlgorithm: string
  xamzCredential: string
  xamzDate: string
  xamzMetaBucket: string
  xamzMetaFiletype: string
  xamzMetaUserid: string
  xamzSignature: string
}

export interface IFilesSignatures {
  extension: string
  fileSize: number
  fileType: string
  parameters?: string
}

export interface IFilesSignaturesResult {
  fileId: string
  provider: PROVIDER_TYPE
  sign: IS3Signature & IAliyunSignature & IAliyunMultipartSignature
  uploadType: UPLOADTYPE
}

// 服务商类型
export enum PROVIDER_TYPE {
  ALIYUN = 0,
  TENCENT_CLOUD = 1,
  AWS_S3 = 2,
}

export interface IAliyunMultipartSignature {
  accessKeyId: string
  accessKeySecret: string
  bucket: string
  callbackBody: string
  callbackBodyType: string
  callbackUrl: string
  expire: number
  fileName: string
  fileType: string
  host: string
  parameters: string
  region: string
  stsToken: string
  userId: number
  file?: File
}

export interface IAliyunSignature {
  accessId: string
  bizId: number
  callback: string
  expire: number
  fileId: number
  fileType: string
  filename: string
  host: string
  policy: string
  region: string
  signature: string
  userId: number
}

export enum UPLOADTYPE {
  DIRECT = 0,
  MUTI_PART = 1,
}

export enum UploadFileType {
  // 素材
  MATERIAL = 'MATERIAL',

  // 人脸
  FACE = 'FACE',

  // Reference Image
  REFERENCE_IMAGE = 'REFERENCE_IMAGE',

  // 图片编辑素材
  EDIT_IMAGE = 'INPAINTING_IMAGE',

  // 图片编辑素材的mask
  EDIT_IMAGE_MASK = 'INPAINTING_IMAGE_MASK',

  // 图片转视频素材
  IMAGE_TO_VIDEO = 'IMAGE2VIDEO',

  // 视频扩展素材
  VIDEO_EXTEND = 'VIDEO_EXTEND',

  // 视频编辑素材
  VIDEO_EDIT = 'VIDEO_EDIT',

  // 视频编辑素材的mask
  VIDEO_EDIT_REF_MASK = 'VIDEO_EDIT_REF_MASK',

  HUMAN_FOUNDATION = 'HUMAN_FOUNDATION',
}
