import OpenAI from 'openai'
export async function extractMetadata(base: any) {
  const apiKey = process.env.OPENAI_API_KEY
  const hasAI = !!apiKey
  const tagsJoined = (base.tags || []).join(', ')
  const prompt = `Given a scanned document image filename and optional user tags, infer a plausible title, one category, 3-6 entities, and a 1-2 sentence summary. Return JSON with keys: title, category, entities (array), summary. Be conservative; if unsure, title can be the filename.`
  if (!hasAI) {
    const guess = {
      title: base.filename,
      category: (tagsJoined.match(/receipt|invoice|bill/i) ? 'Finance' :
                tagsJoined.match(/insurance|policy/i) ? 'Insurance' :
                tagsJoined.match(/medical|doctor|clinic|rx/i) ? 'Medical' :
                'Uncategorized'),
      entities: (tagsJoined ? tagsJoined.split(/\s*,\s*/).slice(0,4) : []),
      summary: tagsJoined ? `User provided tags: ${tagsJoined}` : ''
    }
    return { ...base, ...guess }
  }
  try {
    const client = new OpenAI({ apiKey })
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that returns strictly valid JSON."},
        { role: "user", content: `${prompt}\nFilename: ${base.filename}\nTags: ${tagsJoined || '(none)'}`}
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
    const content = resp.choices[0].message.content || "{}"
    const meta = JSON.parse(content)
    return { ...base, ...meta }
  } catch (e) {
    return { ...base, title: base.filename, summary: tagsJoined ? `User provided tags: ${tagsJoined}` : '' }
  }
}