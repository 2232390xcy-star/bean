'use client'

import { useCallback, useEffect, useState } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { ImageUpload } from '@/components/image-upload'
import { SceneSelector } from '@/components/scene-selector'
import { ResultDisplay } from '@/components/result-display'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { ParseCharacterResponse, SceneType } from '@/types'

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [scene, setScene] = useState<SceneType>('daily')
  const [styleHint, setStyleHint] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const [result, setResult] = useState<ParseCharacterResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setLoadingSeconds(0)
      return
    }
    const id = window.setInterval(() => {
      setLoadingSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [isLoading])

  const handleParse = useCallback(async () => {
    if (!imageBase64) {
      setError('请先上传图片')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/parse-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          sceneSelected: scene,
          styleHintFromUser: styleHint,
        }),
      })

      const data = (await response.json()) as ParseCharacterResponse
      setResult(data)

      if (!response.ok || !data.success) {
        setError(data.message || `请求失败（${response.status}）`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求失败')
    } finally {
      setIsLoading(false)
    }
  }, [imageBase64, scene, styleHint])

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Wand2 className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                拼豆人物元素解析
              </h1>
              <p className="text-sm text-muted-foreground">
                上传图片后调用 Coze 工作流进行解析
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                上传图片
              </h2>
              <ImageUpload onImageChange={setImageBase64} disabled={isLoading} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-6">
                <SceneSelector value={scene} onChange={setScene} disabled={isLoading} />

                <div className="flex flex-col gap-2.5">
                  <label htmlFor="style-hint" className="text-sm font-medium text-foreground">
                    风格倾向
                    <span className="ml-1.5 text-muted-foreground">（可选）</span>
                  </label>
                  <Input
                    id="style-hint"
                    placeholder="例如：户外、日常、极简、通勤..."
                    value={styleHint}
                    onChange={(e) => setStyleHint(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                <Button
                  size="lg"
                  onClick={handleParse}
                  disabled={!imageBase64 || isLoading}
                  className="h-12 w-full gap-2.5 text-base shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="size-5" />
                      正在解析...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5" />
                      开始解析
                    </>
                  )}
                </Button>

                {isLoading && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Spinner className="size-4" />
                      工作流处理中，请稍候...
                    </div>
                    <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      已等待 {loadingSeconds}s，复杂图片通常需要 10-30s。
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-[400px] rounded-2xl border bg-card p-6 shadow-sm lg:p-8">
              <ResultDisplay data={result} isLoading={isLoading} error={error} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
