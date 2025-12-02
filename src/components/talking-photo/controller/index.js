
import { get, post } from "@utils/request";

// 获取文字转语音设置
export const getTextToSpeechTaskSetting = async () => {
  const res = await get('/settings/text-to-speech')
  return res.data
}

// 获取语音翻译设置
export const getVoiceTranslateSetting = async () => {
  const res = await get('/settings/voice-translate')
  return res.data
}

// 创建文字转语音任务
export const createTextToSpeechTask = async (data) => {
  const res = await post('/users/me/models/tts/tasks', data)
  return res.data
}

// 创建变声任务
export const createVoiceChangerTask = async (data) => {
  const res = await post('/users/me/models/voice-change/tasks', data)
  return res.data
}

// 创建语音翻译任务
export const createVoiceTranslateTask = async (data) => {
  const res = await post(`/users/me/models/voice-translate/tasks`, data)
  return res.data
}

// 获取音色更换设置
export const getVoiceChangeSetting = async () => {
  const res = await get('/settings/voice-change')
  return res.data
}

// 查询处理中的任务
export async function queryTaskStatus(taskIds) {
  const { data } = await get(`/users/me/processing/tasks`, { taskIds })
  return data
}

// 获取AI头像生成设置
export const getTalkingPhotoSettings = async () => {
  const res = await get('/settings/talking-photo')
  return res.data
}

// 创建talking photo任务
export const createTalkingPhotoTask = async (data) => {
  const res = await post('/users/me/models/talking-photo/tasks', data)
  return res.data
}

// 进行人脸embedding
export const embeddingFace = async (faceId) => {
  const res = await post(`/v1/users/me/faces/${faceId}/embedding`)
  return res.data
}
