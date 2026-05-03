import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(req: Request) {
  try {
    const { content, roadmapStages } = await req.json()

    const stagesContext = roadmapStages
      .map(
        (s: { stage: string; title: string; concepts: { name: string }[] }) =>
          `${s.stage.toUpperCase()}: ${s.title}\nConcepts: ${s.concepts.map((c) => c.name).join(', ')}`
      )
      .join('\n\n')

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an expert at analyzing learning resources and matching them to appropriate skill levels. 

Given a learning roadmap with stages (beginner, intermediate, advanced, expert) and their concepts, classify the provided resource:

1. Determine which stage it best fits based on the concepts covered
2. Assign a priority:
   - "read-first": Essential, foundational content for the stage
   - "read-later": Supplementary but valuable content
   - "optional": Nice to have, tangential, or very specific use cases

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no explanation. The JSON must follow this exact structure:
{
  "title": "A concise title for the resource",
  "stage": "beginner|intermediate|advanced|expert",
  "priority": "read-first|read-later|optional",
  "reasoning": "Brief explanation of the classification"
}`,
      prompt: `Here is the learning roadmap:

${stagesContext}

---

Classify this resource:

${content}

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
    console.error('[v0] Classification error:', error)
    return Response.json(
      { error: 'Failed to classify resource' },
      { status: 500 }
    )
  }
}
