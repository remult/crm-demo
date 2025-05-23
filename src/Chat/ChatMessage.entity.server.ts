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
			"gpt-4o"
			// "gpt-3.5-turbo",
			// "gpt-3.5-turbo-16k",
			// "gpt-4",
			// "gpt-4-turbo-preview"
		]

		let lastError: any = null
		for (const model of models) {
			try {
				const completion = await openai.responses.create({
					tools: [{
						type: 'mcp',
						server_label: "remult-mcp",
						server_url: 'http://localhost:3002/api/mcp',
						headers: {
							'Authorization': `Bearer plop`
						},
						require_approval: "never"
						// allowed_tools: tools,
					}],
					model: model,
					input: message,
				})
				// const completion = await openai.chat.completions.create({
				// 	model: model,
				// 	// tools
				// 	messages: [
				// 		{
				// 			role: "system",
				// 			content: `You are a helpful assistant for a CRM system. You have access to the following tools: ${JSON.stringify(tools)}. 
				// 			If the user's request can be handled by one of these tools, respond with the tool name and parameters in JSON format.
				// 			Otherwise, provide a general response in markdown format.`
				// 		},
				// 		{
				// 			role: "user",
				// 			content: message
				// 		}
				// 	],
				// 	temperature: 0.7,
				// })

				// const response = completion.choices[0].message?.content || 'Sorry, I could not generate a response.'

				// // Try to parse the response as a tool call
				// try {
				// 	const toolCall = JSON.parse(response)
				// 	if (toolCall.name && toolCall.params) {
				// 		const result = await callTools(toolCall.name, toolCall.params)
				// 		return JSON.stringify(result, null, 2)
				// 	}
				// } catch (e) {
				// 	// If parsing fails, return the response as is
				// 	return response
				// }

				// return response
				return JSON.stringify(completion, null, 2)
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