'use client'

import { cn } from '@/lib/utils'
import type { SceneType } from '@/types'
import { Coffee, Footprints, Snowflake } from 'lucide-react'

interface SceneSelectorProps {
  value: SceneType
  onChange: (scene: SceneType) => void
  disabled?: boolean
}

const scenes: {
  value: SceneType
  label: string
  icon: React.ReactNode
  description: string
}[] = [
  {
    value: 'hiking',
    label: '徒步',
    icon: <Footprints className="size-5" />,
    description: '户外徒步风格',
  },
  {
    value: 'skiing',
    label: '滑雪',
    icon: <Snowflake className="size-5" />,
    description: '滑雪运动风格',
  },
  {
    value: 'daily',
    label: '日常',
    icon: <Coffee className="size-5" />,
    description: '日常通勤风格',
  },
]

export function SceneSelector({ value, onChange, disabled }: SceneSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">场景选择</label>
      <div className="grid grid-cols-3 gap-3">
        {scenes.map((scene) => (
          <button
            key={scene.value}
            type="button"
            title={scene.description}
            disabled={disabled}
            onClick={() => onChange(scene.value)}
            className={cn(
              'group relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all duration-200',
              value === scene.value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <div
              className={cn(
                'rounded-xl p-2.5 transition-colors duration-200',
                value === scene.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}
            >
              {scene.icon}
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                value === scene.value ? 'text-primary' : 'text-foreground'
              )}
            >
              {scene.label}
            </span>
            {value === scene.value && (
              <div className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-card bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
