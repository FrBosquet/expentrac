import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { render } from 'react-email'
import React from 'react'
import * as templates from '../emails'
import { baseContract, basePeriod } from '../lib/mocks'

async function main() {
  const directory = join(tmpdir(), 'expentrac-email-previews')
  await mkdir(directory, { recursive: true })
  const fixture = {
    ...baseContract,
    name: 'Fixture subscription',
    periods: [{ ...basePeriod, from: new Date('2026-01-01'), feeCents: 1250 }]
  }
  const props = {
    username: 'Fixture <User>',
    sharer: 'Fixture owner',
    shareHolder: 'Fixture recipient',
    loanName: 'Fixture loan',
    loanAmount: 12.5,
    months: 6,
    subName: 'Fixture subscription',
    subAmount: 12.5,
    message: 'Fixture <script>alert(1)</script>',
    loans: [],
    subs: [fixture]
  }
  for (const [name, Component] of Object.entries(templates)) {
    const html = await render(
      React.createElement(Component as React.ComponentType<any>, props)
    )
    assert.match(html, /<html/)
    assert.match(html, /https:\/\/(?:www\.)?expentrac\.app\/dashboard/)
    assert.ok(
      !html.includes('<script>alert(1)</script>'),
      'Template must escape user content'
    )
    assert.ok(!/var\(--/.test(html), 'Email CSS must resolve custom properties')
    await writeFile(join(directory, `${name}.html`), html)
  }
  console.log(
    `Rendered and checked ${Object.keys(templates).length} email templates; synthetic previews at ${directory}`
  )
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
