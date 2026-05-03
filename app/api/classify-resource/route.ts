import { generateText, Output } from 'ai'
import { z } from 'zod'

const classificationSchema = z.object({
  title: z.string().describe('A concise title for the resource'),
  stage: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  priority: z.enum(['read-first', 'read-later', 'optional']),
  reasoning: z.string().describe('Brief explanation of the classification'),
})

export async function POST(req: Request) {
  const { content, roadmapStages } = await req.json()

  const stagesContext = roadmapStages
    .map(
      (s: { stage: string; title: string; concepts: { name: string }[] }) =>
        `${s.stage.toUpperCase()}: ${s.title}\nConcepts: ${s.concepts.map((c) => c.name).join(', ')}`
    )
    .join('\n\n')

  const { output } = await generateText({
    model: 'openai/gpt-5-mini',
    output: Output.object({
      schema: classificationSchema,
    }),
    system: `You are an expert at analyzing learning resources and matching them to appropriate skill levels. 

Given a learning roadmap with stages (beginner, intermediate, advanced, expert) and their concepts, classify the provided resource:

1. Determine which stage it best fits based on the concepts covered
2. Assign a priority:
   - "read-first": Essential, foundational content for the stage
   - "read-later": Supplementary but valuable content
   - "optional": Nice to have, tangential, or very specific use cases

Be precise and practical in your assessment.`,
    prompt: `Here is the learning roadmap:

${stagesContext}

---

Classify this resource:

${content}

Provide a concise title, the appropriate stage, priority level, and brief reasoning.`,
  })

  return Response.json(output)
}

