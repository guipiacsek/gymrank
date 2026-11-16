const PAGE = 1000 // Supabase's default cap on rows per request

// page(from, to) runs one query for that row range. Keeps asking until a short page comes back.
export async function fetchAll(page) {
  const rows = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1)
    if (error) return { data: null, error }
    rows.push(...data)
    if (data.length < PAGE) return { data: rows, error: null }
  }
}
