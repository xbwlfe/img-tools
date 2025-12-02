import { useMemoizedFn } from 'ahooks'

import { getAudioDuration } from './utils/media'
import { uploadHub } from '@utils/uploadHub'


export default function useMultipartUpload(fileType) {
  

  const handleUpload = useMemoizedFn(async (file) => {
    if (!file) return
   
    let paramDuration = undefined
    if (file?.type.includes('audio') || file?.type.includes('video')) {
      const duration = await getAudioDuration(URL.createObjectURL(file))
      if (duration && duration !== Infinity && duration !== -Infinity) {
         paramDuration = duration
      } else {
         paramDuration = -1
      }
    }
    return await uploadHub({file: file, fileType: fileType, duration: paramDuration})
  })

  return { handleUpload }
}
