import { readdirSync, statSync, readFileSync, createReadStream } from "fs"
import { join, relative } from "path"

const ACCOUNT_ID = "86822207a3e81b46ffc1eaec4dc69b5f"
const PROJECT = "sales-crm"
const BRANCH = "production"
const DIST = join(process.cwd(), "frontend", "dist")

const TOKEN = process.env.CLOUDFLARE_API_TOKEN
if (!TOKEN) {
  console.error("Missing CLOUDFLARE_API_TOKEN")
  process.exit(1)
}

async function main() {
  // Collect all files from dist
  const files = []
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else files.push(full)
    }
  }
  walk(DIST)

  console.log(`Found ${files.length} files to upload`)

  // Build manifest and form data
  const manifest = {}
  const formData = []

  for (const filePath of files) {
    const relPath = relative(DIST, filePath).replace(/\\/g, "/")
    const content = readFileSync(filePath)
    const { createHash } = await import("crypto")
    const hash = createHash("sha256").update(content).digest("hex")
    manifest[hash] = relPath
    formData.push({ key: `files[${relPath}]`, value: content, options: { filename: relPath } })
  }

  formData.push({ key: "manifest", value: JSON.stringify(manifest) })
  formData.push({ key: "branch", value: BRANCH })

  console.log("Creating deployment...")

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}/deploy`

  const resp = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    // @ts-ignore
    duplex: "half",
    body: createMultipart(formData),
  })

  const result = await resp.json()

  if (result.success) {
    const deployUrl = result.result?.url || ""
    const aliases = result.result?.aliases?.join(", ") || ""
    console.log(`\nDeploy succeeded!`)
    console.log(`URL: ${deployUrl}`)
    if (aliases) console.log(`Aliases: ${aliases}`)
  } else {
    console.error(`\nDeploy failed!`)
    console.error(JSON.stringify(result.errors || result, null, 2))
    process.exit(1)
  }
}

function createMultipart(fields) {
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).slice(2)
  const parts = []

  for (const field of fields) {
    parts.push(`--${boundary}`)

    if (field.options && field.options.filename) {
      parts.push(
        `Content-Disposition: form-data; name="${field.key}"; filename="${field.options.filename}"`
      )
      parts.push("Content-Type: application/octet-stream")
    } else {
      parts.push(`Content-Disposition: form-data; name="${field.key}"`)
    }
    parts.push("")
    parts.push(field.value)
  }

  parts.push(`--${boundary}--`)

  return new Blob(parts.map(p => (typeof p === "string" ? Buffer.from(p, "utf-8") : p)))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
