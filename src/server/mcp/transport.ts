import { callTools, getTools, sendSSE } from './mcp'
import express from 'express'

const mcpTransportRouter = express.Router()

mcpTransportRouter.post(
	'/',
	async (req: express.Request, res: express.Response) => {
		// In stateless mode, create a new instance of transport and server for each request
		// to ensure complete isolation. A single instance would cause request ID collisions
		// when multiple clients connect concurrently.

		try {
			res.on('close', () => {
				// console.log("Request closed");
			})
			console.log(`MCP method:`, req.body?.method)

			if (req.body?.method === 'initialize') {
				sendSSE(req, res, {
					protocolVersion: '2025-03-26',
					capabilities: {
						// logging: {},
						// prompts: {},
						// resources: {},
						tools: {
							listChanged: true
						}
					},
					serverInfo: {
						name: 'remult-app-mcp',
						version: '0.0.1'
					},
					instructions: `These tools enables you to: 
- Create, Read, Update, Delete on all your entities
- Generate SQL queries
- execute SQL queries.`
				})
			} else if (req.body?.method === 'notifications/initialized') {
				sendSSE(req, res, {})
			} else if (req.body?.method === 'ping') {
				sendSSE(req, res, {})
			} else if (req.body?.method === 'tools/list') {
				const tools = await getTools()
				// console.dir(tools, { depth: null })
				sendSSE(req, res, {
					tools: tools,
					_meta: {
						total: tools.length
					}
				})
			} else if (req.body?.method === 'tools/call') {
				try {
					const result = await callTools(
						req.body?.params?.name,
						req.body?.params?.arguments ?? {}
					)
					sendSSE(req, res, {
						content: [
							{
								type: 'text',
								text: JSON.stringify(result, null, 2)
							}
						]
					})
				} catch (error) {
					sendSSE(req, res, {
						isError: true,
						content: [
							{
								type: 'text',
								text: JSON.stringify((error as Error).message, null, 2)
							}
						]
					})
				}
			}

			// await transport.handleRequest(req, res, req.body);
		} catch (error) {
			console.error('Error handling MCP request:', error)
			if (!res.headersSent) {
				res.status(500).json({
					jsonrpc: '2.0',
					error: {
						code: -32603,
						message: 'Internal server error'
					},
					id: null
				})
			}
		}
	}
)

mcpTransportRouter.get(
	'/',
	async (req: express.Request, res: express.Response) => {
		console.log('Received GET MCP request')
		res.status(405).json({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Method not allowed.'
			},
			id: null
		})
	}
)

mcpTransportRouter.delete(
	'/',
	async (req: express.Request, res: express.Response) => {
		console.log('Received DELETE MCP request')
		res.status(405).json({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Method not allowed.'
			},
			id: null
		})
	}
)

export const mcpTransport = mcpTransportRouter
