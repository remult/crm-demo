import { Fields } from 'remult'
import { Contact } from '../Contacts/Contact.entity'
import { specialRepo } from './relations'
import { createEntity, decoratorReturnType } from './dynamicClass'

export async function test() {
  const e = createEntity('tasks', {
    id: Fields.cuid(),
    title: Fields.string(),
    completed: Fields.boolean(),
    createdAt: Fields.createdAt()
  })
  let x = new e()
}

specialRepo(Contact).find({
  with: {
    tags3: {
      limit: 2
    }
  }
}).then(y=>{
  y[0].
})
