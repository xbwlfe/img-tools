import type { Checkpoint } from 'ali-oss'

import { PARALLEL, PARTSIZE, TIMEOUT, abortUpload, initOSSClient } from './multipart'
import type {
  IAliyunMultipartSignature,
  IAliyunSignature,
  IUploadCallback,
  UploadSignature,
} from './types'

import type { UploadFunction } from './types'

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

const uploadToAliyun: UploadFunction = async (file: File, data: UploadSignature) => {
  const signature = data as IAliyunSignature
  return upload(file, signature)
}

const multipartUploadToAliyun: UploadFunction = async (
  file: File,
  data: UploadSignature,
  callback?: IUploadCallback,
) => {
  const signature = data as IAliyunMultipartSignature
  return multipartUpload(file, signature, callback)
}

// 阿里云普通上传
const upload = async (file: File, data: IAliyunSignature) => {
  // 参考useMultipartUpload
  return fetch(data.host, {
    method: 'post',
    headers: {
      ...(data?.userId && { 'x-user-id': `${data.userId}` }),
    },
    body: getFormData(file, data),
  })
}

// 阿里云分片上传
// 不支持重复调用时断点续传，支持出错时能够重试并续传
const multipartUpload = async (
  file: File,
  data: IAliyunMultipartSignature,
  callback?: IUploadCallback,
) => {
  const { onUploadProgress } = callback || {}
  const client = await initOSSClient(data)
  let checkpoint: Checkpoint | undefined = undefined
  let uploadId: string | null = null

  const mulUpload = (key: string, file: File, options?: { headers?: Record<string, string> }) => {
    return client.multipartUpload(key, file, {
      // 获取分片上传进度、断点和返回值。
      progress: (p, cpt) => {
        if (onUploadProgress) {
          onUploadProgress(p)
        }
        if (!cpt) {
          return
        }
        if (p === 0 && !uploadId) {
          uploadId = cpt.uploadId
        }
        if (uploadId === cpt.uploadId) {
          checkpoint = cpt //保存断点
        }
      },
      parallel: PARALLEL, // 设置并发上传的分片数量。
      partSize: 1024 * 1024 * PARTSIZE, // 设置分片大小。默认值设为10 MB，最小值为100 KB。
      timeout: TIMEOUT, //设置超时时间,
      headers: options?.headers,
      checkpoint: checkpoint, //有则为断点续传
      // 设置上传回调。如果不涉及回调服务器，请删除callback相关设置。
      // callback: callback.current,
    })
  }

  // 需求【1003913】，添加x-user-id
  const options = {
    headers: { ...(data?.userId && { 'x-user-id': `${data.userId}` }) },
  }
  const maxRetryCount = 3
  for (let retryCount = 0; retryCount < maxRetryCount; retryCount++) {
    try {
      let res: any
      if (!checkpoint) {
        res = await mulUpload(data.fileName, file, options)
      } else {
        // 这个file和传进来的有区别吗？
        // uploadId和data.fileName是否相同
        const { file } = checkpoint
        res = await mulUpload(data.fileName, file, options)
      }

      // 没有配置回调，这里的数据结构不会有success
      /*
      if (!res?.data?.success) {
        alert(res?.data?.errorMsg)
        return Promise.reject(new Error(res?.data?.errorMsg))
      }
      */

      // 这里要用返回值再看需要返回什么，目前外部不会用到这个返回值
      return res?.data?.data
    } catch (error) {
      console.log('upload err:', error)
      if (isRetriableError(error) && retryCount < maxRetryCount - 1) {
        console.log('Retrying upload...')
        await sleep(5000) // 等待一段时间再重试
      } else {
        if (checkpoint) {
          abortUpload(client, checkpoint)
        }
        return Promise.reject(error)
      }
    }
  }
  return Promise.reject(new Error('upload failed'))
}

// FormData 浏览器自动设置
function getFormData(file: File, data: IAliyunSignature) {
  const fd = new FormData()
  fd.append('key', data.filename)
  fd.append('OSSAccessKeyId', data.accessId)
  fd.append('policy', data.policy)
  fd.append('success_action_status', '200')
  fd.append('signature', data.signature)
  fd.append('x:user', String(data.userId))
  fd.append('x:type', data.fileType)
  fd.append('x-oss-forbid-overwrite', 'true')
  fd.append('x:region', data.region)
  if (data.bizId) {
    fd.append('x:parameters', String(data.bizId))
  }
  if (data.callback) {
    fd.append('callback', data.callback)
  }
  // 要放到最后
  fd.append('file', file)
  return fd
}

// 新增错误类型判断函数, 以下错误类型为可重试错误类型
// 可根据具体错误类型进行调整
function isRetriableError(err: any): boolean {
  // 断网，RequestError
  if (err?.code) {
    console.log('upload err.code:', err.code)
  }

  // 先都重试
  return true
}

export { uploadToAliyun, multipartUploadToAliyun }
