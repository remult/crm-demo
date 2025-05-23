import { Allow, BackendMethod, Entity, Fields, remult } from 'remult'

@Entity<ChatMessage>('chatMessages', {
	allowApiCrud: Allow.authenticated,
	defaultOrderBy: {
		createdAt: 'desc'
	}
})
export class ChatMessage {
	@Fields.uuid()
	id!: string

	@Fields.uuid()
	sessionId!: string

	@Fields.string()
	message = ''

	@Fields.string()
	response = ''

	@Fields.string({ dbName: 'accountManager' })
	accountManagerId = ''

	@Fields.date()
	createdAt = new Date()

	@BackendMethod({ allowed: Allow.authenticated })
	static async llmsChat(message: string, sessionId: string) {
		// TODO: Implement actual LLM integration
		return `Response to: ${message}`
	}

	@BackendMethod({ allowed: Allow.authenticated })
	static async createNewSession() {
		return crypto.randomUUID()
	}
} 