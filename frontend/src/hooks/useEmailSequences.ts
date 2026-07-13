import { useState, useEffect, useCallback } from "react"
import { emailSequencesApi } from "@/api/client"
import type { EmailSequence } from "@/types"

export function useEmailSequences() {
  const [sequences, setSequences] = useState<EmailSequence[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await emailSequencesApi.list()
      setSequences(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { sequences, loading, refetch: fetch }
}

export function useEmailSequence(id: number | null) {
  const [sequence, setSequence] = useState<EmailSequence | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) { setSequence(null); return }
    setLoading(true)
    emailSequencesApi.get(id).then(setSequence).finally(() => setLoading(false))
  }, [id])

  return { sequence, loading }
}
