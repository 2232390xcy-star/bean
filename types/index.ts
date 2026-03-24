// 颜色信息
export interface ColorInfo {
  name: string
  code: string
}

// 带置信度的元素（检测结果）
export interface DetectedElement {
  type: string
  color?: ColorInfo
  confidence: number
}

// 带来源的元素（补齐结果）
export interface CompletedElement {
  type: string
  color?: ColorInfo
  source: 'detected' | 'detected_or_completed' | 'completed_by_scene'
}

// 头发元素（无颜色）
export interface HairElement {
  type: string
  confidence?: number
  source?: string
}

// 配件元素
export interface AccessoryElement extends DetectedElement {}
export interface CompletedAccessoryElement extends CompletedElement {}

// 检测到的元素集合
export interface DetectedElements {
  headwear: DetectedElement
  hair: HairElement
  eyewear: DetectedElement
  top: DetectedElement
  bottom: DetectedElement
  accessories: AccessoryElement[]
  shoes: DetectedElement
}

// 补齐后的元素集合
export interface CompletedElements {
  headwear: CompletedElement
  hair: HairElement & { source: string }
  eyewear: CompletedElement
  top: CompletedElement
  bottom: CompletedElement
  accessories: CompletedAccessoryElement[]
  shoes: CompletedElement
}

// 填充规则说明
export interface FilledByRule {
  field: string
  reason: string
}

// 风格推断
export interface VibeInferred {
  value: string
  confidence: number
}

// API 响应结构
export interface ParseCharacterResponse {
  success: boolean
  message: string
  request_id: string
  scene_selected: string
  scene_inferred: string
  vibe_inferred: VibeInferred
  detected_elements: DetectedElements
  completed_elements: CompletedElements
  filled_by_rules: FilledByRule[]
  visibility_notes: string[]
}

// API 请求结构
export interface ParseCharacterRequest {
  imageBase64: string
  sceneSelected: string
  styleHintFromUser: string
}

// 场景类型
export type SceneType = 'hiking' | 'skiing' | 'daily'

// Mock 数据
export const mockParseResult: ParseCharacterResponse = {
  success: true,
  message: '解析成功',
  request_id: 'mock-req-001',
  scene_selected: '徒步',
  scene_inferred: '户外运动',
  vibe_inferred: {
    value: '机能户外',
    confidence: 0.85,
  },
  detected_elements: {
    headwear: {
      type: '渔夫帽',
      color: { name: '卡其色', code: '#C3B091' },
      confidence: 0.92,
    },
    hair: {
      type: '短发',
      confidence: 0.88,
    },
    eyewear: {
      type: '运动墨镜',
      color: { name: '黑色', code: '#1A1A1A' },
      confidence: 0.95,
    },
    top: {
      type: '冲锋衣',
      color: { name: '深蓝色', code: '#1E3A5F' },
      confidence: 0.91,
    },
    bottom: {
      type: '工装裤',
      color: { name: '军绿色', code: '#4A5D23' },
      confidence: 0.87,
    },
    accessories: [
      {
        type: '登山包',
        color: { name: '橙色', code: '#FF6B35' },
        confidence: 0.89,
      },
      {
        type: '登山杖',
        color: { name: '银色', code: '#C0C0C0' },
        confidence: 0.82,
      },
    ],
    shoes: {
      type: '登山鞋',
      color: { name: '棕色', code: '#8B4513' },
      confidence: 0.94,
    },
  },
  completed_elements: {
    headwear: {
      type: '渔夫帽',
      color: { name: '卡其色', code: '#C3B091' },
      source: 'detected',
    },
    hair: {
      type: '短发',
      source: 'detected',
    },
    eyewear: {
      type: '运动墨镜',
      color: { name: '黑色', code: '#1A1A1A' },
      source: 'detected',
    },
    top: {
      type: '冲锋衣',
      color: { name: '深蓝色', code: '#1E3A5F' },
      source: 'detected',
    },
    bottom: {
      type: '工装裤',
      color: { name: '军绿色', code: '#4A5D23' },
      source: 'detected',
    },
    accessories: [
      {
        type: '登山包',
        color: { name: '橙色', code: '#FF6B35' },
        source: 'detected',
      },
      {
        type: '登山杖',
        color: { name: '银色', code: '#C0C0C0' },
        source: 'detected',
      },
      {
        type: '水壶',
        color: { name: '灰色', code: '#808080' },
        source: 'completed_by_scene',
      },
    ],
    shoes: {
      type: '登山鞋',
      color: { name: '棕色', code: '#8B4513' },
      source: 'detected',
    },
  },
  filled_by_rules: [
    {
      field: 'accessories',
      reason: '根据徒步场景自动补充水壶配件，户外徒步通常需要携带水壶',
    },
    {
      field: 'vibe',
      reason: '基于整体装备风格推断为机能户外风格',
    },
    {
      field: 'scene',
      reason: '根据冲锋衣、登山鞋等元素推断为户外运动场景',
    },
  ],
  visibility_notes: [
    '图片中人物下半身部分被遮挡，裤子颜色识别可能存在偏差',
    '配件识别基于图片可见区域，可能存在未识别到的配件',
  ],
}
