import { useEffect, useState, useCallback } from 'react'
import { getSettings, updateSettings, exportClips, importClips, clearAllClips, type ClipMindSettings } from '../shared/storage'
import { Settings, Download, Upload, Trash2 } from 'lucide-react'

export function OptionsApp() {
  const [settings, setSettings] = useState<ClipMindSettings | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handleMaxHistoryChange = useCallback(async (value: number) => {
    await updateSettings({ maxHistory: value })
    const updated = await getSettings()
    setSettings(updated)
  }, [])

  const handleToggleEnricher = useCallback(async (key: string) => {
    if (!settings) return
    const updated = {
      ...settings.enabledEnrichers,
      [key]: !settings.enabledEnrichers[key],
    }
    await updateSettings({ enabledEnrichers: updated })
    const refreshed = await getSettings()
    setSettings(refreshed)
  }, [settings])

  const handleExport = useCallback(async () => {
    const json = await exportClips()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clipmind-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Exported successfully')
    setTimeout(() => setStatus(''), 2000)
  }, [])

  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const count = await importClips(text)
        setStatus(`Imported ${count} items`)
      } catch {
        setStatus('Import failed: invalid file')
      }
      setTimeout(() => setStatus(''), 2000)
    }
    input.click()
  }, [])

  const handleClearAll = useCallback(async () => {
    if (confirm('Delete all clipboard history? This cannot be undone.')) {
      await clearAllClips()
      setStatus('All clips cleared')
      setTimeout(() => setStatus(''), 2000)
    }
  }, [])

  if (!settings) {
    return <div className="p-8 text-muted-foreground text-sm">Loading settings...</div>
  }

  const enricherKeys = Object.keys(settings.enabledEnrichers)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ClipMind Settings</h1>
            <p className="text-xs text-muted-foreground">Configure your clipboard manager</p>
          </div>
        </div>

        {status && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs">
            {status}
          </div>
        )}

        <section className="mb-6">
          <h2 className="text-sm font-medium mb-3">History</h2>
          <div className="glass-panel rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Max items</label>
              <select
                value={settings.maxHistory}
                onChange={e => handleMaxHistoryChange(Number(e.target.value))}
                className="bg-background border border-border rounded-md px-2 py-1 text-xs"
              >
                <option value={25}>25 (Free)</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-medium mb-3">Enrichers</h2>
          <div className="glass-panel rounded-lg p-4 space-y-2">
            {enricherKeys.map(key => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground capitalize">{key}</span>
                <button
                  onClick={() => handleToggleEnricher(key)}
                  className={`w-8 h-5 rounded-full transition-colors relative ${
                    settings.enabledEnrichers[key] ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.enabledEnrichers[key] ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-medium mb-3">Data</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel hover:bg-white/10 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel hover:bg-white/10 text-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Import JSON
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel hover:bg-destructive/20 text-xs text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
