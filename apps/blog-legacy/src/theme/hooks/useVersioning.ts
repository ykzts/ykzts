function useVersioning(): {
  versioningEnabled: boolean
  versions: string[]
  latestVersion: string
} {
  return {
    latestVersion: undefined,
    versioningEnabled: false,
    versions: []
  }
}

export default useVersioning
