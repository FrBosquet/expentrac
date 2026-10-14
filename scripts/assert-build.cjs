const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const manifest = JSON.parse(fs.readFileSync('.next/server/app-paths-manifest.json', 'utf8'))
for (const route of ['/dashboard/page', '/api/contract/route', '/(web)/blog/[slug]/page']) {
  assert.ok(manifest[route], `Compiled app route missing: ${route}`)
  assert.ok(fs.existsSync(path.join('.next/server', manifest[route])), `Compiled route file missing: ${route}`)
}
console.log(`Verified ${Object.keys(manifest).length} compiled app routes`)
