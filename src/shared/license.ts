const LICENSE_KEY = 'clipmind_license_key'
const LICENSE_VALID_KEY = 'clipmind_license_valid'
const LICENSE_CHECKED_AT_KEY = 'clipmind_license_checked_at'
const VALIDATION_ENDPOINT = 'https://api.clipmind.app/validate'
const RECHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

export interface LicenseStatus {
  readonly isPro: boolean
  readonly licenseKey: string | null
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  try {
    const result = await chrome.storage.local.get([LICENSE_KEY, LICENSE_VALID_KEY, LICENSE_CHECKED_AT_KEY])
    const key = (result[LICENSE_KEY] as string) ?? null
    const valid = (result[LICENSE_VALID_KEY] as boolean) ?? false
    const checkedAt = (result[LICENSE_CHECKED_AT_KEY] as number) ?? 0

    if (!key) return { isPro: false, licenseKey: null }

    const needsRecheck = Date.now() - checkedAt > RECHECK_INTERVAL_MS
    if (needsRecheck) {
      revalidateInBackground(key)
    }

    return { isPro: valid, licenseKey: key }
  } catch {
    return { isPro: false, licenseKey: null }
  }
}

export async function activateLicense(key: string): Promise<boolean> {
  try {
    const valid = await validateWithServer(key)
    await chrome.storage.local.set({
      [LICENSE_KEY]: key,
      [LICENSE_VALID_KEY]: valid,
      [LICENSE_CHECKED_AT_KEY]: Date.now(),
    })
    return valid
  } catch {
    return false
  }
}

export async function deactivateLicense(): Promise<void> {
  await chrome.storage.local.remove([LICENSE_KEY, LICENSE_VALID_KEY, LICENSE_CHECKED_AT_KEY])
}

async function validateWithServer(key: string): Promise<boolean> {
  try {
    const response = await fetch(VALIDATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key }),
    })

    if (!response.ok) return false

    const data = (await response.json()) as { valid: boolean }
    return data.valid === true
  } catch {
    // Network error — assume previously validated key is still valid
    return true
  }
}

function revalidateInBackground(key: string): void {
  validateWithServer(key)
    .then(async (valid) => {
      await chrome.storage.local.set({
        [LICENSE_VALID_KEY]: valid,
        [LICENSE_CHECKED_AT_KEY]: Date.now(),
      })
    })
    .catch(() => {
      // Silent failure — keep existing validation state
    })
}
