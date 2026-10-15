# Dependency security verification

Checked 2026-10-15 with pnpm 10.20.0 against the committed lockfile. `pnpm audit --prod` reports zero known vulnerabilities after the remediation batch. This is registry advisory coverage, not a proof that every dependency is safe.

- NextAuth stays on patched stable v4.24.15 with its official `@next-auth/prisma-adapter` 1.0.7 (declared peers include NextAuth v4 and Prisma >=3). Removed the obsolete `@auth/prisma-adapter` that pulled in Auth.js core 0.28.0. The removed core was flagged by [GHSA-7rqj-j65f-68wh](https://github.com/advisories/GHSA-7rqj-j65f-68wh); this app uses Google OAuth, not the advisory's passwordless email flow. Real-session browser checks pass; a real Google OAuth callback remains a release check.
- Sharp upgraded to 0.35.5. Compatible transitive patches refreshed. Explicit Webpack dev dependency resolves the previously stale MDX peer. Overrides pin Webpack 5.111.1, ws 8.22.0, mysql2 3.24.6 and deepmerge-ts 8.0.2 until upstream ranges catch up. Prisma generation, migration/restore tests, build and application regressions verify the overridden graph. Reassess/remove overrides as upstream releases permit.
- Blog frontmatter uses dependency-free `yaml` 2.9.1 with core schema, unique keys and disabled aliases. The old gray-matter/js-yaml/argparse chain is removed from runtime.

The full audit still reports two **development-only**, unpatched advisories:

| Package/path | Advisory | Exposure and action |
|---|---|---|
| braces 3.0.3 via @next/eslint-plugin-next → fast-glob → micromatch | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), high | Nested glob patterns can exhaust the stack. Lint globs/config come from this repository, never HTTP input. Do not run untrusted lint configuration with secrets. Track upstream fix. |
| sprintf-js 1.0.3 via Jest → load-nyc-config → js-yaml → argparse | [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c), moderate | Untrusted precision format strings can throw. Used by development config/CLI dependencies, not request handling. Keep config/CLI format input trusted; track upstream fix. |

No advisory is suppressed in pnpm configuration. CI checks runtime advisories; periodically run the full audit to review these remaining tool findings. Dependency scans require network access and can change independently of source changes.
