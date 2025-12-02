import { useMemoizedFn, useUnmount } from 'ahooks'
import { useEffect, useRef } from 'react'

import alert from '@components/Toast'
import handleUpload from '@utils/upload'


import { createImageToVideoTask, createTextToVideoTask, getProcessingTask, getTaskDetails } from './controllers'
import { BizType, TaskStatus } from './controllers/enums'
import type { FnCreateParams, ILocaleFile } from './controllers/interfaces'
import { useImageToVideo } from './controllers/context'
import { UploadFileType } from '@utils/uploadHub/types'
interface IUseHandlers {
  create: (params: FnCreateParams) => Promise<void>
}
/**
 * 处理创建任务的相关逻辑
 */
const useHandlers = (): IUseHandlers => {
  const timer = useRef(null)
  const {
    setGenerating,
    setTaskDetail,
    reset,
    setTaskCategory,
    setPrompt,
    setLocaleFile
  } = useImageToVideo()

  const params = new URLSearchParams(window.location.search)
  const categoryId = params.get('categoryId')
  const text = params.get('text')
  const fileId = params.get('fileId')
  const fileUrl = params.get('fileUrl')

  /**
   * 处理图片转视频的任务
   * @param prompt 提示文本
   * @param localeFile 本地文件信息
   * @returns 创建任务的结果
   */
  const handleImageToVideo = async (prompt: string, localeFile: ILocaleFile, duration: number) => {
    let fileId = localeFile.fileId
    if (!fileId) {
      // 如果没有 fileId，需要先上传文件
      const { fileId: _fileId } = await handleUpload(localeFile.file, UploadFileType.HUMAN_FOUNDATION, {
        isCompress: false
      })
      fileId = _fileId
    }

    return createImageToVideoTask({
      prompt,
      duration,
      fileId
    })
  }

  /**
   * 创建任务
   * @param category 任务类型
   * @param prompt 提示文本
   * @param localeFile 本地文件信息
   */
  const create = useMemoizedFn(async ({ category, prompt, localeFile, duration }) => {
    try {
      setGenerating(true)

      // 根据任务类型选择不同的处理方法
      const res = await (category === BizType.IMAGE_TO_VIDEO
        ? handleImageToVideo(prompt, localeFile, duration)
        : createTextToVideoTask({
          prompt,
          duration
        }))
      getTaskStatus(res.taskId)
    } catch (err) {
      setGenerating(false)
      alert.error(err.message)
    }
  })

  // 获取任务状态
  const getTaskStatus = useMemoizedFn(async (taskId: string) => {
    try {
      const res = await getProcessingTask(taskId)
      const task = res[0]
      if ([TaskStatus.CREATING, TaskStatus.WAITING].includes(task.status)) {
        timer.current = setTimeout(() => getTaskStatus(taskId), 2000)
        return
      } else if (task.status === TaskStatus.SUCCEED) {
        // 设置任务详情
        const res = await getTaskDetails(taskId)
        setGenerating(false)
        setTaskDetail(res)
      } else {
        setGenerating(false)
        alert('Failed to generate video')
      }
    } catch (err) {
      setGenerating(false)
      alert(err.message)
    }
  })

  useEffect(() => {
    if (categoryId) {
      setTaskCategory(categoryId as BizType)
    }
    if (text) {
      setPrompt(text as string)
    }
    if (fileId) {
      setLocaleFile({
        fileId: fileId as string,
        file: null,
        url: fileUrl as string
      })
    }

  }, [categoryId, fileId, fileUrl, setLocaleFile, setPrompt, setTaskCategory, text])

  useUnmount(() => {
    reset()
  })

  return {
    create
  }
}

export default useHandlers
