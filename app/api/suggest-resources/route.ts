import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { topic, stages } = await req.json()

    const stageNames = stages.map((s: { name: string }) => s.name).join(', ')

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a learning resource curator. Generate high-quality, real learning resources for the given topic.
      
IMPORTANT: Return ONLY a valid JSON array, no markdown, no explanation.
Each resource must have: title, url, type (article/video/course/book/tutorial), stage, description.
Generate 2-3 resources per stage. Use REAL URLs from reputable sources like:
- Documentation sites (MDN, official docs)
- Educational platforms (freeCodeCamp, Coursera, edX, Khan Academy)
- Video platforms (YouTube educational channels)
- Tutorial sites (tutorialspoint, w3schools, GeeksforGeeks)
- Books (link to Amazon or publisher)

Stages available: ${stageNames}`,
      prompt: `Generate learning resources for: "${topic}"

Return JSON array like:
[
  {
    "title": "Resource Title",
    "url": "https://real-url.com",
    "type": "article",
    "stage": "Beginner",
    "description": "Brief description of what this resource covers"
  }
]`,
    })

    // Parse JSON from response
    const text = result.text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    
    if (!jsonMatch) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = JSON.parse(jsonMatch[0])

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Error suggesting resources:', error)
    return NextResponse.json(
      { error: 'Failed to suggest resources' },
      { status: 500 }
    )
  }
}
