'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  Eye,
  MapPin,
  Compass,
  Palette,
  ArrowRight,
  Zap,
  AlertTriangle,
} from 'lucide-react'
import type {
  ParseCharacterResponse,
  DetectedElement,
  CompletedElement,
  ColorInfo,
} from '@/types'
import { cn } from '@/lib/utils'

interface ResultDisplayProps {
  data: ParseCharacterResponse | null
  isLoading: boolean
  error: string | null
}

// 颜色预览组件
function ColorSwatch({ color }: { color?: ColorInfo }) {
  if (!color?.code) return null

  return (
    <div className="flex items-center gap-2">
      <span
        className="size-5 rounded-md border border-border shadow-inner"
        style={{ backgroundColor: color.code }}
        title={`${color.name} (${color.code})`}
      />
      <span className="text-sm text-muted-foreground">
        {color.name}
        <span className="ml-1.5 font-mono text-xs opacity-70">{color.code}</span>
      </span>
    </div>
  )
}

// 置信度条
function ConfidenceBar({ confidence }: { confidence: number }) {
  if (!confidence) return null

  const percentage = Math.round(confidence * 100)
  const getColorClass = () => {
    if (confidence >= 0.8) return 'bg-success'
    if (confidence >= 0.6) return 'bg-primary'
    return 'bg-warning'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {percentage}%
      </span>
    </div>
  )
}

// 来源标签
function SourceBadge({ source }: { source: string }) {
  const isAutoCompleted = source === 'completed_by_scene'

  if (isAutoCompleted) {
    return (
      <Badge className="gap-1 bg-warning/15 text-warning-foreground border-warning/30 hover:bg-warning/20">
        <Zap className="size-3" />
        自动补齐
      </Badge>
    )
  }

  const getLabel = () => {
    switch (source) {
      case 'detected':
        return '已识别'
      case 'detected_or_completed':
        return '识别/补齐'
      default:
        return source
    }
  }

  return (
    <Badge variant="secondary" className="text-xs">
      {getLabel()}
    </Badge>
  )
}

// 元素名称映射
const elementNameMap: Record<string, string> = {
  headwear: '头饰',
  hair: '发型',
  eyewear: '眼镜',
  top: '上装',
  bottom: '下装',
  shoes: '鞋子',
}

// 元素卡片组件
function ElementCard({
  title,
  element,
  showConfidence = false,
  showSource = false,
}: {
  title: string
  element: DetectedElement | CompletedElement
  showConfidence?: boolean
  showSource?: boolean
}) {
  if (!element?.type) return null

  const hasColor = 'color' in element && element.color?.name
  const isAutoCompleted = 'source' in element && element.source === 'completed_by_scene'

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md',
        isAutoCompleted && 'border-warning/30 bg-warning/5'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {showConfidence && 'confidence' in element && (
          <ConfidenceBar confidence={element.confidence} />
        )}
        {showSource && 'source' in element && (
          <SourceBadge source={element.source} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-base font-semibold text-foreground">{element.type}</span>
        {hasColor && <ColorSwatch color={element.color} />}
      </div>
    </div>
  )
}

// 配件列表组件
function AccessoriesList({
  accessories,
  showConfidence = false,
  showSource = false,
}: {
  accessories: (DetectedElement | CompletedElement)[]
  showConfidence?: boolean
  showSource?: boolean
}) {
  if (!accessories?.length) return null

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        配件
      </span>
      <div className="flex flex-col gap-3">
        {accessories.map((acc, index) => {
          const isAutoCompleted = 'source' in acc && acc.source === 'completed_by_scene'
          return (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors',
                isAutoCompleted
                  ? 'border-warning/30 bg-warning/5'
                  : 'border-transparent bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3">
                {acc.color && (
                  <span
                    className="size-4 rounded border border-border shadow-inner"
                    style={{ backgroundColor: acc.color.code }}
                  />
                )}
                <span className="font-medium text-foreground">{acc.type}</span>
                {acc.color && (
                  <span className="text-sm text-muted-foreground">
                    {acc.color.name}
                    <span className="ml-1 font-mono text-xs opacity-70">{acc.color.code}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {showConfidence && 'confidence' in acc && (
                  <ConfidenceBar confidence={acc.confidence} />
                )}
                {showSource && 'source' in acc && (
                  <SourceBadge source={acc.source} />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 加载骨架屏
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* 顶部信息条骨架 */}
      <div className="flex items-center gap-6 rounded-2xl border bg-card p-5">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>
      {/* 识别结果骨架 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
      {/* 补齐建议骨架 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

// 空状态
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative rounded-full bg-gradient-to-br from-muted to-muted/50 p-6 shadow-lg">
          <Sparkles className="size-10 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-foreground">等待解析</h3>
      <p className="mt-2 max-w-sm text-balance text-muted-foreground">
        上传人物图片，选择场景后点击开始解析，AI 将自动识别角色元素并提供补齐建议
      </p>
    </div>
  )
}

// 错误状态
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <AlertCircle className="size-10 text-destructive" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">解析失败</h3>
      <p className="mt-2 max-w-sm text-balance text-muted-foreground">{message}</p>
    </div>
  )
}

// 摘要信息条
function SummaryBar({ data }: { data: ParseCharacterResponse }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/5 via-card to-success/5 shadow-sm">
      {/* 装饰性背景 */}
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-success/10 to-transparent" />
      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
        {/* 成功标识 */}
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-success/15 p-1.5">
            <CheckCircle2 className="size-4 text-success" />
          </div>
          <span className="font-medium text-foreground">解析成功</span>
        </div>
        <div className="h-6 w-px bg-border" />
        {/* 用户选择场景 */}
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-muted p-1.5">
            <MapPin className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">选择场景</span>
            <span className="font-medium text-foreground">{data.scene_selected}</span>
          </div>
        </div>
        {/* 模型推断场景 */}
        {data.scene_inferred && (
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-muted p-1.5">
              <Compass className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">推断场景</span>
              <span className="font-medium text-foreground">{data.scene_inferred}</span>
            </div>
          </div>
        )}
        {/* 风格倾向 */}
        {data.vibe_inferred?.value && (
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Palette className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">风格倾向</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{data.vibe_inferred.value}</span>
                {data.vibe_inferred.confidence > 0 && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {Math.round(data.vibe_inferred.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 时间线规则说明
function RulesTimeline({ rules }: { rules: { field: string; reason: string }[] }) {
  if (!rules?.length) return null

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-foreground">
        <div className="rounded-lg bg-muted p-1.5">
          <Info className="size-4 text-muted-foreground" />
        </div>
        补齐说明
      </h3>
      <div className="relative space-y-0">
        {/* 时间线竖线 */}
        <div className="absolute bottom-2 left-3 top-2 w-px bg-border" />
        {rules.map((rule, index) => (
          <div key={index} className="relative flex gap-5 pb-5 last:pb-0">
            {/* 时间线节点 */}
            <div className="relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card">
              <ArrowRight className="size-3 text-primary" />
            </div>
            {/* 内容 */}
            <div className="flex-1 rounded-xl bg-muted/50 px-4 py-3">
              <span className="mb-1 block text-sm font-medium text-foreground">
                {elementNameMap[rule.field] || rule.field}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">{rule.reason}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 可见性提示
function VisibilityNotes({ notes }: { notes: string[] }) {
  if (!notes?.length) return null

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
      <div className="flex gap-4">
        <div className="shrink-0 rounded-lg bg-warning/15 p-2">
          <AlertTriangle className="size-5 text-warning-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-foreground">识别提示</h4>
          <ul className="space-y-1.5">
            {notes.map((note, index) => (
              <li key={index} className="text-sm leading-relaxed text-muted-foreground">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// Section 标题
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="mb-5 flex items-center gap-2.5 text-base font-semibold text-foreground">
      <div className="rounded-lg bg-muted p-1.5">{icon}</div>
      {title}
    </h3>
  )
}

export function ResultDisplay({ data, isLoading, error }: ResultDisplayProps) {
  // 加载中状态
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // 错误状态
  if (error) {
    return <ErrorState message={error} />
  }

  // 空状态
  if (!data) {
    return <EmptyState />
  }

  // API 返回错误
  if (!data.success) {
    return <ErrorState message={data.message || '解析失败，请重试'} />
  }

  return (
    <div className="flex flex-col gap-8">
      {/* 摘要信息条 */}
      <SummaryBar data={data} />

      {/* 识别结果 */}
      <div>
        <SectionTitle icon={<Eye className="size-4 text-muted-foreground" />} title="识别结果" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.detected_elements).map(([key, value]) => {
            if (key === 'accessories') {
              return (
                <div key={key} className="sm:col-span-2 lg:col-span-3">
                  <AccessoriesList
                    accessories={value as DetectedElement[]}
                    showConfidence
                  />
                </div>
              )
            }
            return (
              <ElementCard
                key={key}
                title={elementNameMap[key] || key}
                element={value as DetectedElement}
                showConfidence
              />
            )
          })}
        </div>
      </div>

      {/* 补齐建议 */}
      <div>
        <SectionTitle icon={<Sparkles className="size-4 text-muted-foreground" />} title="补齐建议" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.completed_elements).map(([key, value]) => {
            if (key === 'accessories') {
              return (
                <div key={key} className="sm:col-span-2 lg:col-span-3">
                  <AccessoriesList
                    accessories={value as CompletedElement[]}
                    showSource
                  />
                </div>
              )
            }
            return (
              <ElementCard
                key={key}
                title={elementNameMap[key] || key}
                element={value as CompletedElement}
                showSource
              />
            )
          })}
        </div>
      </div>

      {/* 补齐规则说明 */}
      <RulesTimeline rules={data.filled_by_rules} />

      {/* 可见性提示 */}
      <VisibilityNotes notes={data.visibility_notes} />
    </div>
  )
}
