import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { topic, stages } = await req.json()

    const stageNames = stages.map((s: { name: string }) => s.name).join(', ')

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are a learning resource curator. Generate search queries and resource recommendations for the given topic.
      
IMPORTANT: Return ONLY a valid JSON array, no markdown, no explanation.
Each resource must have: title, searchQuery, searchUrl, type (article/video/course/book/tutorial), stage, description.
Generate 2-3 resources per stage.

Instead of direct URLs (which may be outdated), provide Google search queries that will help users find the best current resources.
The searchUrl should be a Google search URL like: https://www.google.com/search?q=encoded+search+query

Stages available: ${stageNames}`,
      prompt: `Generate learning resource recommendations for: "${topic}"

Return JSON array like:
[
  {
    "title": "Official Documentation - Getting Started",
    "searchQuery": "${topic} official documentation getting started guide",
    "searchUrl": "https://www.google.com/search?q=${encodeURIComponent(topic)}+official+documentation+getting+started",
    "type": "article",
    "stage": "Beginner",
    "description": "Start with the official documentation to understand core concepts"
  }
]

Make the titles descriptive of what the user should look for. The searchQuery should be optimized to find high-quality resources.`,
    })

    // Parse JSON from response
    const text = result.text
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    
    if (!jsonMatch) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = JSON.parse(jsonMatch[0])
    
    // Ensure all suggestions have valid search URLs
    const validatedSuggestions = suggestions.map((s: { 
      title: string
      searchQuery?: string
      searchUrl?: string
      type: string
      stage: string
      description: string
    }) => ({
      ...s,
      searchUrl: s.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(s.searchQuery || s.title + ' ' + topic)}`,
      url: s.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(s.searchQuery || s.title + ' ' + topic)}`
    }))

    return NextResponse.json({ suggestions: validatedSuggestions })
  } catch (error) {
    console.error('Error suggesting resources:', error)
    return NextResponse.json(
      { error: 'Failed to suggest resources' },
      { status: 500 }
    )
  }
}
