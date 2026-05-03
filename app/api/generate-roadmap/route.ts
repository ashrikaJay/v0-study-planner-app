import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(req: Request) {
  try {
    const { topic } = await req.json()

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an expert educator and curriculum designer. Create comprehensive, practical learning roadmaps that take learners from complete beginner to expert level.

For each stage, provide 4-6 key concepts that build on previous stages. Concepts should be specific, actionable, and relevant to the topic.

The stages are:
- beginner: Foundational concepts, basic terminology, getting started
- intermediate: Building on basics, practical applications, common patterns
- advanced: Deep dives, optimization, complex scenarios
- expert: Mastery topics, cutting-edge techniques, contribution to the field

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no explanation. The JSON must follow this exact structure:
{
  "stages": [
    {
      "stage": "beginner",
      "title": "Stage title here",
      "concepts": [
        { "name": "Concept name", "description": "Brief description" }
      ]
    }
  ]
}`,
      prompt: `Create a detailed zero-to-expert learning roadmap for: "${topic}"

Include exactly 4 stages (beginner, intermediate, advanced, expert) with 4-6 key concepts per stage. Each concept should have a clear name and a brief description (1-2 sentences) explaining what the learner will understand or be able to do.

Respond with ONLY the JSON object, nothing else.`,
    })

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const output = JSON.parse(jsonMatch[0])
    return Response.json(output)
  } catch (error) {
    console.error('[v0] Roadmap generation error:', error)
    return Response.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
