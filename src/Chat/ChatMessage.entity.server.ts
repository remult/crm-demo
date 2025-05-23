import OpenAI from 'openai'
import { getTools, callTools } from '../server/mcp/mcp'
import { ChatMessage } from './ChatMessage.entity'

// Define the server-side implementation
export async function llmsChatServer(message: string, sessionId: string, user: any, entityMetadata: any): Promise<string> {
	try {
		// Get available tools
		const tools = await getTools()

		// Use OpenAI to determine which tool to use
		const openai = new OpenAI({
			// apiKey: process.env.OPENAI_API_KEY,
		})

		// List of models to try in order
		const models = [
			"gpt-3.5-turbo",
			// "gpt-4o"
			// "gpt-3.5-turbo-16k",
			// "gpt-4",
			// "gpt-4-turbo-preview"
		]

		let lastError: any = null
		for (const model of models) {
			try {
				const host = await openai.responses.create({
					// @ts-ignore
					tools: tools.map(tool => ({
						type: 'function',
						...tool
					})),
					// tools: [{
					// 	type: 'function',
					// 	// server_label: "remult-mcp",
					// 	// server_url: 'http://127.0.0.1:3002/api/mcp',
					// 	// headers: {
					// 	// 	'Content-Type': 'application/json'
					// 	// },
					// 	// require_approval: "never"
					// 	parameters: {
					// 	}
					// }],
					model: model,
					input: message,
					// previous_response_id: "resp"
				})

				const toolFound = host.output[0]
				console.info(`toolFound`, toolFound)

				if (toolFound) {
					// @ts-ignore
					const result = await callTools(toolFound.name, toolFound.parameters)
					console.info(`toolresultFound`, JSON.stringify(result, null, 2))

					const completion = await openai.chat.completions.create({
						model: model,
						messages: [
							{
								role: "system",
								content: `You got json data out of a nice remult mcp server. Turn this into meaningful markdown. when it's an image don't hesitate to display an image. 
								Sometime it make sense to display a table or even a chart.
								Knowing that de width will be about 700px, so display thing accordingly. (a table should not have things on the left or right, but on top or bottom)`
							},
							{
								role: "user",
								content: JSON.stringify(result, null, 2)
							}
						],
					})
					return completion.choices[0].message?.content || 'Sorry, I could not generate a response.'
				} else {
					return "Hummm ?"
				}
			} catch (error: any) {
				lastError = error
				// If it's not a quota error, throw immediately
				if (!error.message?.includes('quota') && !error.message?.includes('429')) {
					throw error
				}
				// Otherwise, continue to the next model
				console.log(`Model ${model} failed, trying next model...`)
			}
		}

		// If we've tried all models and they all failed
		throw lastError || new Error('All models failed')
	} catch (error) {
		console.error('Error in llmsChat:', error)
		return 'Sorry, there was an error processing your request. Please try again.'
	}
} 