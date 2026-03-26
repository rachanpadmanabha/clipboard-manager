import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { getLicenseStatus, activateLicense, type LicenseStatus } from '../../shared/license'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface LicenseGateProps {
  readonly children: ReactNode
  readonly feature: string
}

export function LicenseGate({ children, feature }: LicenseGateProps) {
  const [license, setLicense] = useState<LicenseStatus | null>(null)

  useEffect(() => {
    getLicenseStatus().then(setLicense)
  }, [])

  if (license === null) return null

  if (license.isPro) {
    return <>{children}</>
  }

  return <UpgradePrompt feature={feature} onActivated={() => getLicenseStatus().then(setLicense)} />
}

interface UpgradePromptProps {
  readonly feature: string
  readonly onActivated: () => void
}

function UpgradePrompt({ feature, onActivated }: UpgradePromptProps) {
  const [keyInput, setKeyInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleActivate = useCallback(async () => {
    if (!keyInput.trim()) return
    setLoading(true)
    setError('')

    const success = await activateLicense(keyInput.trim())
    setLoading(false)

    if (success) {
      onActivated()
    } else {
      setError('Invalid license key')
    }
  }, [keyInput, onActivated])

  return (
    <div className="glass-panel rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">Pro Feature</p>
          <p className="text-[10px] text-muted-foreground">{feature}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <p className="text-[10px] text-foreground/80">
          Unlock unlimited history, all enrichers, export, and format-before-paste for a one-time payment of <strong className="text-amber-400">$19</strong>.
        </p>
      </div>

      {!showKeyInput ? (
        <div className="flex gap-2">
          <a
            href="https://clipmind.app/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium transition-colors"
          >
            Get ClipMind Pro <ArrowRight className="w-3 h-3" />
          </a>
          <button
            onClick={() => setShowKeyInput(true)}
            className="px-3 py-2 rounded-lg glass-panel text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            I have a key
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Enter license key..."
              className="flex-1 px-2.5 py-1.5 rounded-md bg-background border border-border text-xs font-mono placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={e => { if (e.key === 'Enter') handleActivate() }}
            />
            <button
              onClick={handleActivate}
              disabled={loading}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                loading
                  ? 'bg-muted text-muted-foreground cursor-wait'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {loading ? '...' : 'Activate'}
            </button>
          </div>
          {error && <p className="text-[10px] text-destructive">{error}</p>}
        </div>
      )}
    </div>
  )
}
