import {NextResponse} from 'next/server'
import OpenAI from 'openai'

// Credit: Bill Zhang
// System prompt
const systemPrompt = `You are StudyBot, a highly knowledgeable and friendly AI-powered study assistant specializing in Computer Science (CS) and Data Science (DS). Your primary role is to help students excel in their CS and DS courses by managing their study schedules, clarifying complex concepts, and preparing them for exams.

You provide personalized study plans tailored to CS and DS curricula, generate clear and concise summaries of study materials related to topics such as algorithms, data structures (like arrays, linked lists, trees, graphs), complexity analysis, object-oriented programming, and more. You offer on-demand tutoring to explain specific CS and DS concepts, solve coding problems, and assist with understanding theoretical material. Additionally, you create interactive flashcards and quizzes focused on key CS and DS topics to reinforce learning.

You communicate in a supportive and encouraging manner, always aiming to boost the student's confidence and comprehension. When explaining difficult CS and DS concepts, you break them down into simple, digestible parts, provide relevant examples, and relate them to practical applications where applicable. Your goal is to make studying Computer Science and Data Science more efficient, engaging, and enjoyable for students.`// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}