import { NextRequest, NextResponse } from 'next/server'
import type { ParseCharacterRequest, ParseCharacterResponse } from '@/types'

// User requested hard-coded Coze credentials.
const COZE_API_BASE = 'https://api.coze.cn'
const COZE_API_TOKEN =
  'pat_nm0BzBphIQAz91snlzW3Q8sEWh2OvpwljGvu2Uhi4Coq4G89vBG3V5ffmr7kX9ye'
const COZE_WORKFLOW_ID = '7620822024650407977'
const TEMP_IMAGE_UPLOAD_ENDPOINT = 'https://tmpfiles.org/api/v1/upload'

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function parseDataUrl(input: string): {
  mime: string
  base64Data: string
} {
  const match = input.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    return {
      mime: 'image/jpeg',
      base64Data: input,
    }
  }
  return {
    mime: match[1],
    base64Data: match[2],
  }
}

function inferImageExtension(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

async function toCozeImageUrl(imageBase64: string): Promise<string> {
  if (/^https?:\/\//i.test(imageBase64)) {
    return imageBase64
  }

  const { mime, base64Data } = parseDataUrl(imageBase64)
  const buffer = Buffer.from(base64Data, 'base64')
  const ext = inferImageExtension(mime)
  const fileName = `coze_upload_${Date.now()}.${ext}`

  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: mime }), fileName)

  const uploadResp = await fetch(TEMP_IMAGE_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  })

  if (!uploadResp.ok) {
    const text = await uploadResp.text()
    throw new Error(`图片临时上传失败：${uploadResp.status} - ${text}`)
  }

  const uploadData = (await uploadResp.json()) as {
    status?: string
    data?: { url?: string }
  }

  const pageUrl = uploadData?.data?.url
  if (uploadData?.status !== 'success' || !pageUrl) {
    throw new Error('图片临时上传返回数据异常。')
  }

  // tmpfiles API returns a page URL; Coze needs a direct image URL.
  return pageUrl.replace('http://tmpfiles.org/', 'https://tmpfiles.org/dl/')
}

function mapSceneSelected(sceneSelected: string): string {
  if (sceneSelected === 'hiking') return '徒步'
  if (sceneSelected === 'skiing') return '滑雪'
  if (sceneSelected === 'daily') return '日常'
  return sceneSelected
}

function createEmptyResponse(
  message: string,
  requestId = '',
  sceneSelected = ''
): ParseCharacterResponse {
  return {
    success: false,
    message,
    request_id: requestId,
    scene_selected: sceneSelected,
    scene_inferred: '',
    vibe_inferred: { value: '', confidence: 0 },
    detected_elements: {
      headwear: { type: '', color: { name: '', code: '' }, confidence: 0 },
      hair: { type: '', confidence: 0 },
      eyewear: { type: '', color: { name: '', code: '' }, confidence: 0 },
      top: { type: '', color: { name: '', code: '' }, confidence: 0 },
      bottom: { type: '', color: { name: '', code: '' }, confidence: 0 },
      accessories: [],
      shoes: { type: '', color: { name: '', code: '' }, confidence: 0 },
    },
    completed_elements: {
      headwear: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      hair: { type: '', source: 'detected_or_completed' },
      eyewear: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      top: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      bottom: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      accessories: [],
      shoes: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
    },
    filled_by_rules: [],
    visibility_notes: [],
  }
}

function createTextOutputResponse(
  outputText: string,
  requestId = '',
  sceneSelected = ''
): ParseCharacterResponse {
  const text = outputText.trim()
  return {
    success: true,
    message: '工作流执行成功',
    request_id: requestId,
    scene_selected: sceneSelected,
    scene_inferred: '',
    vibe_inferred: { value: '', confidence: 0 },
    detected_elements: {
      headwear: { type: '', color: { name: '', code: '' }, confidence: 0 },
      hair: { type: '', confidence: 0 },
      eyewear: { type: '', color: { name: '', code: '' }, confidence: 0 },
      top: { type: '', color: { name: '', code: '' }, confidence: 0 },
      bottom: { type: '', color: { name: '', code: '' }, confidence: 0 },
      accessories: [],
      shoes: { type: '', color: { name: '', code: '' }, confidence: 0 },
    },
    completed_elements: {
      headwear: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      hair: { type: '', source: 'detected_or_completed' },
      eyewear: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      top: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      bottom: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
      accessories: [],
      shoes: {
        type: '',
        color: { name: '', code: '' },
        source: 'detected_or_completed',
      },
    },
    filled_by_rules: text ? [{ field: 'output', reason: text }] : [],
    visibility_notes: text ? [text] : [],
  }
}

function normalizeMaybeResponse(
  value: unknown,
  requestId: string,
  sceneSelected: string
): ParseCharacterResponse | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  if (typeof data.success !== 'boolean' || typeof data.message !== 'string') {
    return null
  }

  const empty = createEmptyResponse(data.message, requestId, sceneSelected)

  return {
    ...empty,
    success: data.success,
    message: data.message,
    request_id: typeof data.request_id === 'string' ? data.request_id : requestId,
    scene_selected:
      typeof data.scene_selected === 'string' ? data.scene_selected : sceneSelected,
    scene_inferred:
      typeof data.scene_inferred === 'string' ? data.scene_inferred : '',
    vibe_inferred:
      data.vibe_inferred &&
      typeof data.vibe_inferred === 'object' &&
      typeof (data.vibe_inferred as Record<string, unknown>).value === 'string' &&
      typeof (data.vibe_inferred as Record<string, unknown>).confidence ===
        'number'
        ? (data.vibe_inferred as { value: string; confidence: number })
        : empty.vibe_inferred,
    detected_elements:
      data.detected_elements && typeof data.detected_elements === 'object'
        ? (data.detected_elements as ParseCharacterResponse['detected_elements'])
        : empty.detected_elements,
    completed_elements:
      data.completed_elements && typeof data.completed_elements === 'object'
        ? (data.completed_elements as ParseCharacterResponse['completed_elements'])
        : empty.completed_elements,
    filled_by_rules: Array.isArray(data.filled_by_rules)
      ? (data.filled_by_rules as ParseCharacterResponse['filled_by_rules'])
      : [],
    visibility_notes: Array.isArray(data.visibility_notes)
      ? (data.visibility_notes as string[])
      : [],
  }
}

function parseCozeResult(
  raw: unknown,
  requestId: string,
  sceneSelected: string
): ParseCharacterResponse {
  let payload: unknown = raw
  let textOutput = ''

  if (payload && typeof payload === 'object' && 'data' in payload) {
    payload = (payload as { data?: unknown }).data
  }

  if (typeof payload === 'string') {
    textOutput = payload
    try {
      payload = JSON.parse(payload)
    } catch {
      return createTextOutputResponse(payload, requestId, sceneSelected)
    }
  }

  if (payload && typeof payload === 'object' && 'output' in payload) {
    const output = (payload as { output?: unknown }).output

    if (typeof output === 'string') {
      textOutput = output
      try {
        payload = JSON.parse(output)
      } catch {
        return createTextOutputResponse(output, requestId, sceneSelected)
      }
    } else if (output && typeof output === 'object') {
      payload = output
    } else {
      return createTextOutputResponse(String(output ?? ''), requestId, sceneSelected)
    }
  }

  if (!payload || typeof payload !== 'object') {
    return createTextOutputResponse(textOutput, requestId, sceneSelected)
  }

  const cozeError = payload as { code?: unknown; msg?: unknown }
  if (
    typeof cozeError.code === 'number' &&
    cozeError.code !== 0 &&
    typeof cozeError.msg === 'string'
  ) {
    return createEmptyResponse(
      `Coze 工作流错误 ${cozeError.code}: ${cozeError.msg}`,
      requestId,
      sceneSelected
    )
  }

  const result = payload as Partial<ParseCharacterResponse>

  const normalized = normalizeMaybeResponse(payload, requestId, sceneSelected)
  if (normalized) {
    return normalized
  }

  if (
    typeof result.success === 'boolean' &&
    typeof result.message === 'string' &&
    result.detected_elements &&
    result.completed_elements
  ) {
    return result as ParseCharacterResponse
  }

  return createTextOutputResponse(
    textOutput || JSON.stringify(payload),
    requestId,
    sceneSelected
  )
}

async function runCozeWorkflow(params: {
  imageUrl: string
  sceneSelected: string
  styleHintFromUser: string
  requestId: string
}): Promise<ParseCharacterResponse> {
  const response = await fetch(`${COZE_API_BASE}/v1/workflow/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${COZE_API_TOKEN}`,
    },
    body: JSON.stringify({
      workflow_id: COZE_WORKFLOW_ID,
      parameters: {
        image_url: params.imageUrl,
        scene_selected: params.sceneSelected,
        style_hint_from_user: params.styleHintFromUser,
        request_id: params.requestId,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Coze 请求失败：${response.status} - ${errorText}`)
  }

  const raw = await response.json()
  return parseCozeResult(raw, params.requestId, params.sceneSelected)
}

export async function POST(request: NextRequest) {
  try {
    const body: ParseCharacterRequest = await request.json()
    const { imageBase64, sceneSelected, styleHintFromUser } = body

    if (!imageBase64) {
      return NextResponse.json(createEmptyResponse('请先上传图片。'), {
        status: 400,
      })
    }

    if (!sceneSelected) {
      return NextResponse.json(createEmptyResponse('请选择场景。'), {
        status: 400,
      })
    }

    const requestId = generateRequestId()
    const imageUrl = await toCozeImageUrl(imageBase64)
    const workflowScene = mapSceneSelected(sceneSelected)

    const result = await runCozeWorkflow({
      imageUrl,
      sceneSelected: workflowScene,
      styleHintFromUser: styleHintFromUser || '',
      requestId,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('解析失败:', error)
    const message = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json(createEmptyResponse(message), { status: 500 })
  }
}
