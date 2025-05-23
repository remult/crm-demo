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

	// This will be initialized from the server
	static llmsChatImplementation: (message: string, sessionId: string, user: any, entityMetadata: any) => Promise<string>

	@BackendMethod({ allowed: Allow.authenticated })
	static async llmsChat(message: string, sessionId: string) {
		if (!ChatMessage.llmsChatImplementation) {
			throw new Error('llmsChat implementation not initialized')
		}
		return ChatMessage.llmsChatImplementation(message, sessionId, remult.user, remult.repo(ChatMessage).metadata)
	}

	@BackendMethod({ allowed: Allow.authenticated })
	static async createNewSession() {
		return crypto.randomUUID()
	}
} 