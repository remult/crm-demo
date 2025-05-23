import OpenAI from 'openai'
import fetch from 'node-fetch'
import { ChatMessage } from './ChatMessage.entity'

// Define the server-side implementation
export async function llmsChatServer(message: string, sessionId: string, user: any, entityMetadata: any): Promise<string> {
	try {
		// First, check if we should use a tool by calling the MCP server
		const mcpResponse = await fetch('http://localhost:3002/api/mcp', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message,
				sessionId,
				context: {
					user,
					entityMetadata
				}
			})
		})

		if (!mcpResponse.ok) {
			throw new Error('Failed to communicate with MCP server')
		}

		const mcpResult = await mcpResponse.json() as {
			shouldUseTool: boolean
			toolResponse?: string
		}

		// If MCP suggests using a tool, use it
		if (mcpResult.shouldUseTool && mcpResult.toolResponse) {
			return mcpResult.toolResponse
		}

		// Otherwise, use OpenAI for a general response
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		})

		const completion = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content: "You are a helpful assistant for a CRM system. Provide responses in markdown format to support rich text formatting like tables, code blocks, and lists."
				},
				{
					role: "user",
					content: message
				}
			],
			temperature: 0.7,
		})

		return completion.choices[0].message?.content || 'Sorry, I could not generate a response.'
	} catch (error) {
		console.error('Error in llmsChat:', error)
		return 'Sorry, there was an error processing your request. Please try again.'
	}
} 