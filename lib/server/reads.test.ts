import { readAll } from './reads'

jest.mock('@lib/prisma', () => ({ prisma: {} }))
jest.mock('./api', () => ({
  requireUser: jest.fn(),
  ApiError: class extends Error {
    constructor(
      public status: number,
      message: string
    ) {
      super(message)
    }
  }
}))

test('server hydration reads every page before publishing a complete list', async () => {
  const first = Array.from({ length: 100 }, (_, i) => ({ id: `record-${i}` }))
  const reader = jest
    .fn()
    .mockResolvedValueOnce(first)
    .mockResolvedValueOnce([{ id: 'last' }])
  expect(await readAll(reader)).toHaveLength(101)
  expect(new URL(reader.mock.calls[1][0].url).searchParams.get('cursor')).toBe(
    'record-99'
  )
})

test('inconsistent server pagination is rejected rather than hydrated as a complete list', async () => {
  const first = Array.from({ length: 100 }, (_, i) => ({ id: `record-${i}` }))
  const reader = jest
    .fn()
    .mockResolvedValueOnce(first)
    .mockResolvedValueOnce([first[0]])
  await expect(readAll(reader)).rejects.toThrow('Inconsistent pagination')
})
