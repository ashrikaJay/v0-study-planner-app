import { generateText, Output } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'

const roadmapSchema = z.object({
  stages: z.array(
    z.object({
      stage: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      title: z.string(),
      concepts: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
})

export async function POST(req: Request) {
  const { topic } = await req.json()

  const { output } = await generateText({
    model: groq('llama-3.3-70b-specdec'),
    output: Output.object({
      schema: roadmapSchema,
    }),
    system: `You are an expert educator and curriculum designer. Create comprehensive, practical learning roadmaps that take learners from complete beginner to expert level.

For each stage, provide 4-6 key concepts that build on previous stages. Concepts should be specific, actionable, and relevant to the topic.

The stages are:
- Beginner: Foundational concepts, basic terminology, getting started
- Intermediate: Building on basics, practical applications, common patterns
- Advanced: Deep dives, optimization, complex scenarios
- Expert: Mastery topics, cutting-edge techniques, contribution to the field`,
    prompt: `Create a detailed zero-to-expert learning roadmap for: "${topic}"

Include 4 stages (beginner, intermediate, advanced, expert) with 4-6 key concepts per stage. Each concept should have a clear name and a brief description (1-2 sentences) explaining what the learner will understand or be able to do.`,
  })

  return Response.json(output)
}
