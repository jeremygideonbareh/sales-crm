export function exportToCsv(
  data: Record<string, unknown>[],
  filename: string
) {
  if (data.length === 0) return
  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h]
      if (val == null) return ""
      if (
        typeof val === "string" &&
        (val.includes(",") || val.includes('"'))
      ) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return String(val)
    })
  )
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
