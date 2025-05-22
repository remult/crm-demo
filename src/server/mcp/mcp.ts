import { ClassType, remult, repo, withRemult } from 'remult'
import { Tool } from './MCPSchema.js'
import { getRelationFieldInfo } from 'remult/internals'
import { entities } from '../api.js'
import { SqlCommandFactory } from 'remult/src/sql-command.js'
// import { isOfType } from 'remult/src/isOfType.js'

export const sendSSE = (req: any, res: any, result: any) => {
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Connection', 'keep-alive')

	const message = JSON.stringify({
		jsonrpc: '2.0',
		id: req.body?.id ?? 0,
		result: result || null
	})

	res.write(`data: ${message}\n\n`)
	res.end()
}

export const getTools = async () => {
	return await withRemult(async () => {
		const nestedTools = entities.map((entity: ClassType<any>) => {
			const tools: Tool[] = []

			const properties = repo(entity)
				.metadata.fields.toArray()
				.reduce((acc, field) => {
					const relationInfo = getRelationFieldInfo(field)
					if (relationInfo) {
						return acc
					}
					acc[field.key] = {
						description: field.options.caption ?? field.key,
						type:
							field.valueType === String
								? 'string'
								: field.valueType === Number
									? 'number'
									: field.valueType === Boolean
										? 'boolean'
										: // : field.valueType === Date
										// 	? "date"
										// : field.valueType === Array
										// 	? "array"
										field.valueType === Object
											? 'object'
											: 'string'
					}
					return acc
				}, {} as Record<string, { type: string; description: string }>)
			const relations = repo(entity)
				.metadata.fields.toArray()
				.reduce((acc, field) => {
					const relationInfo = getRelationFieldInfo(field)
					if (relationInfo) {
						acc[field.key] = {
							type: 'object',
							description: `relation ${relationInfo.type} to ${repo(relationInfo.toEntity).metadata.caption
								}`
						}
						return acc
					}
					return acc
				}, {} as Record<string, { type: string; description: string }>)

			const required = repo(entity)
				.metadata.fields.toArray()
				.filter((field) => field.options.required)
				.map((field) => field.key)

			const create: Tool = {
				name: `create_${repo(entity).metadata.key}`,
				description: `Create a new ${repo(entity).metadata.caption}`,
				// annotations: {
				// },
				inputSchema: {
					// // Option 1
					// type: "object",
					// properties,
					// required

					// // Option 2
					// oneOf: [
					// 	{
					// 		type: "object",
					// 		properties,
					// 		required
					// 	},
					// 	{
					// 		type: "array",
					// 		items: {
					// 			type: "object",
					// 			properties,
					// 			required
					// 		}
					// 	}
					// ]

					// // Option 3
					type: 'object',
					properties: {
						items: {
							type: 'array',
							items: {
								type: 'object',
								properties,
								required
							}
						}
					}
				}
			}
			tools.push(create)

			const read: Tool = {
				name: `read_${repo(entity).metadata.key}`,
				description: `Read/List all ${repo(entity).metadata.caption}`,
				annotations: {
					readOnlyHint: true
				},
				inputSchema: {
					type: 'object',
					properties: {
						include: {
							type: 'object',
							properties: Object.fromEntries(
								Object.entries(relations).map(([key, value]) => [
									key,
									{ type: 'boolean', description: value.description }
								])
							)
						},
						where: {
							type: 'object',
							properties: Object.fromEntries(
								Object.entries({ ...properties, ...relations }).map(
									([key, value]) => [
										key,
										{
											type: value.type,
											description: `Filter operations: 
- Comparison: $gt, $gte, $lt, $lte, $ne, $in, $nin
- Text: $contains, $startsWith, $endsWith, $notContains
- Symbols: >, >=, <, <=, !=
Example: { "${key}": { "$contains": "value" } }`
										}
									]
								)
							)
						},
						limit: { type: 'number' },
						orderBy: {
							type: 'object',
							properties: Object.fromEntries(
								Object.entries(properties).map(([key]) => [
									key,
									{ type: 'string', description: `Can be "asc" or "desc"` }
								])
							)
						}
					}
				}
			}
			tools.push(read)



			const update: Tool = {
				name: `update_${repo(entity).metadata.key}`,
				description: `Update a ${repo(entity).metadata.caption}`,
				annotations: {},
				inputSchema: {
					type: 'object',
					properties
				}
			}
			tools.push(update)

			const del: Tool = {
				name: `delete_${repo(entity).metadata.key}`,
				description: `Delete a ${repo(entity).metadata.caption}`,
				annotations: {
					readOnlyHint: false,
					destructiveHint: true
				},
				inputSchema: {
					type: 'object',
					properties: {
						id: { type: 'string' }
					},
					required: ['id']
				}
			}
			tools.push(del)

			return tools
		})
		const tools = nestedTools.flatMap((c) => c)
		tools.push({
			name: 'get_raw_sql_query',
			description: `This tool let you prepare any raw SQL query. 
AI will look at the prompt and translate it into a raw SQL query.
AI will need to escape all fields by in the query with quotes like "Table" & "fields".
If it's asked, you can use the tool "execute_raw_sql_query" to execute the query.
`,
			inputSchema: {
				type: 'object',
				properties: {
					sql: {
						type: 'string',
						description: `The SQL query to execute knowing that the schema is: 
${entities.map((ent: ClassType<any>) => {
							const dbFields = repo(ent)
								.metadata.fields.toArray()
								.reduce((acc, field) => {
									const relationInfo = getRelationFieldInfo(field)
									if (relationInfo) {
										return acc
									}
									acc[field.key] = {
										dbName: field.dbName,
										description: field.options.caption ?? field.key,
										type:
											field.valueConverter.fieldTypeInDb ?? field.valueType === String
												? 'string'
												: field.valueType === Number
													? 'number'
													: field.valueType === Boolean
														? 'boolean'
														: // : field.valueType === Date
														// 	? "date"
														// : field.valueType === Array
														// 	? "array"
														field.valueType === Object
															? 'object'
															: 'string'
									}
									return acc
								}, {} as Record<string, { dbName: string; type: string; description: string }>)

							const dbRelations = repo(ent)
								.metadata.fields.toArray()
								.reduce((acc, field) => {
									const relationInfo = getRelationFieldInfo(field)
									if (relationInfo) {
										acc[field.key] = {
											type: 'object',
											description: `relation ${relationInfo.type} to ${repo(relationInfo.toEntity).metadata.caption
												} (${JSON.stringify(relationInfo.options)})`
										}
										return acc
									}
									return acc
								}, {} as Record<string, { type: string; description: string }>)

							return `
- table: "${repo(ent).metadata.dbName}" (class: ${repo(ent).metadata.caption
								}) ${Object.entries(dbFields).map(
									([key, value]) => `
  column: "${value.dbName}" (${value.type}) ${value.description}`
								)}
  ${Object.entries(dbRelations).map(
									([key, value]) => `
  relation: "${key}" (${value.description})`
								)}`
						})}`
					}
				}
			}
		})

		// if (isOfType<SqlCommandFactory>(remult.dataProvider, 'createCommand')) {
		tools.push({
			name: 'execute_raw_sql_query',
			description: `This tool let you execute a raw SQL query.
To prepare the query, you can use the tool "get_raw_sql_query".`,
			inputSchema: {
				type: 'object',
				properties: {
					sql: { type: 'string' }
				}
			}
		})
		return tools
	})
}

export const callTools = async (name: string, params: any) => {
	const [action, entity] = name.split('_')
	return await withRemult(async () => {
		if (name === 'get_raw_sql_query') {
			return { result: JSON.stringify(params, null, 2) }
		}

		if (name === 'execute_raw_sql_query') {
			// if (isOfType<SqlCommandFactory>(remult.dataProvider, 'createCommand')) {
			try {
				//@ts-ignore
				const r = remult.dataProvider.createCommand()
				const result = await r.execute(params.sql)
				return { result: JSON.stringify(result, null, 2) }
			} catch (e) {
				return { result: { error: 'Data provider does not support raw SQL queries' } }
			}
		}



		const ent = entities.find(
			(e: ClassType<any>) => repo(e).metadata.key === entity
		) as ClassType<any>

		if (!ent) throw new Error('Entity not found')

		if (action === 'create') {
			return await repo(ent).insert(params.items)
		} else if (action === 'read') {
			return await repo(ent).find(params)
		} else if (action === 'update') {
			return await repo(ent).save(params)
		} else if (action === 'delete') {
			await repo(ent).delete(params)
			return { success: true, params }
		}
	})
}
