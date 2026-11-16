import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchAll } from './fetchAll.js'

// A fake table of n rows, served in ranges like Supabase does.
const table = (n) => async (from, to) => ({ data: Array.from({ length: Math.max(0, Math.min(n, to + 1) - from) }, (_, i) => from + i), error: null })

test('fetchAll gets every row across pages', async () => {
  for (const n of [0, 5, 999, 1000, 1001, 2500]) {
    const { data } = await fetchAll(table(n))
    assert.equal(data.length, n, `${n} rows`)
    assert.equal(data[n - 1], n - 1 >= 0 ? n - 1 : undefined)
  }
})

test('fetchAll stops on an error', async () => {
  const { data, error } = await fetchAll(async () => ({ data: null, error: { message: 'boom' } }))
  assert.equal(data, null)
  assert.equal(error.message, 'boom')
})
