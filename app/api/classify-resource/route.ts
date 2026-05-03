import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(req: Request) {
  try {
    const { content, roadmap, preferredStage } = await req.json()

    const stagesContext = roadmap.stages.join(', ')

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an expert at analyzing learning resources and matching them to appropriate skill levels. 

Given a learning roadmap with stages and their concepts, classify the provided resource:

1. Determine which stage it best fits (Beginner, Intermediate, Advanced, or Expert)
2. Assign a priority:
   - "Read First": Essential, foundational content for the stage
   - "Read Later": Supplementary but valuable content
   - "Optional": Nice to have, tangential, or very specific use cases
3. Extract or create a clear title from the content

IMPORTANT: You MUST respond with ONLY valid JSON, no markdown, no code blocks, no explanation. The JSON must follow this exact structure:
{
  "stage": "Beginner|Intermediate|Advanced|Expert",
  "priority": "Read First|Read Later|Optional",
  "reasoning": "Brief explanation of the classification",
  "extractedTitle": "A concise title for this resource"
}`,
      prompt: `Learning roadmap topic has these stages: ${stagesContext}
${preferredStage ? `\nThe user prefers to add this to the "${preferredStage}" stage if appropriate.` : ''}

Classify this resource:

${content.slice(0, 2000)}

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
