import {
  Allow,
  BackendMethod,
  Entity,
  Fields,
  remult,
  Validators
} from 'remult'

@Entity<AccountManager>('accountManagers', {
  allowApiCrud: Allow.authenticated,
  allowApiDelete: false,
  defaultOrderBy: {
    firstName: 'asc',
    lastName: 'asc'
  }
})
export class AccountManager {
  @Fields.id()
  id?: string
  @Fields.string({ validate: Validators.required })
  firstName = ''
  @Fields.string()
  lastName = ''
  @Fields.string()
  email = ''
  @Fields.string()
  avatar = ''

  @BackendMethod({ allowed: true })
  static async getValidUserName() {
    const allUsers = await remult.repo(AccountManager).find()
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
    return randomUser.firstName
  }
}

declare module 'remult' {
  export interface UserInfo {
    avatar: string
  }
}
