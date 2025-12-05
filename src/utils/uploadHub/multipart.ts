import OSS, { type Checkpoint } from 'ali-oss'

// 全局变量
export const PARALLEL = 3 // 设置并发上传的分片数量
export const PARTSIZE = 10 // / 设置分片大小。这里的单位为MB，最小值为100 KB。
export const TIMEOUT = 15 * 60 * 1000 //设置超时时间,当前设置为15分钟

export interface IMultipartResult {
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

// 初始化 Client的函数
export async function initOSSClient({
  accessKeyId,
  accessKeySecret,
  stsToken,
  bucket,
  host,
  region,
}: IMultipartResult) {
  return new OSS({
    // 使用自定义域名作为Endpoint。
    endpoint: host,
    cname: true,
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: region,
    // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    // 从STS服务获取的安全令牌（SecurityToken）。
    stsToken: stsToken,
    // refreshSTSToken: async () => {
    //   // 向您搭建的STS服务获取临时访问凭证。
    //   const { data: info } = await refreshFn()
    //   return {
    //     accessKeyId: info.accessKeyId,
    //     accessKeySecret: info.accessKeySecret,
    //     stsToken: info.stsToken
    //   }
    // },
    // 刷新临时访问凭证的时间间隔，单位为毫秒。
    refreshSTSTokenInterval: 60 * 60 * 1000, //1h刷新一次
    // 填写Bucket名称，例如examplebucket。
    bucket: bucket,
  })
}

export const abortUpload = async (client: OSS, checkpoint: Checkpoint) => {
  try {
    if (!checkpoint) return
    const { name, uploadId } = checkpoint
    // 中断分片上传。
    const result = await client.abortMultipartUpload(name, uploadId)
    console.log(result)
    return result
  } catch (error) {
    console.log('abortUpload-error:', error)
  }
}
