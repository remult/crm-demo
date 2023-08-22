import { FindOptions, remult } from 'remult'

type EntityType<entityType extends abstract new (...args: any) => any = any> = {
  new (...args: any): entityType
}
type EntityInstance<entityType extends EntityType> = InstanceType<entityType>

type RelationInfo<toEntity extends EntityType> = {
  type: toEntity
  relationType?: 'one' | 'many'
}
type OneRelationInfo<toEntity extends EntityType> = RelationInfo<toEntity> & {
  relationType: 'one'
}

type Flatten<T> = T extends Record<string, infer U>
  ? { [K in keyof U]: U[K] }
  : never

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type Relations<classType extends EntityType> = UnionToIntersection<
  Flatten<{
    [K in keyof classType as classType[K] extends ConfigOptions<classType, any>
      ? K
      : never]: classType[K] extends ConfigOptions<classType, infer z>
      ? z
      : never
  }>
>
type SelectRelations<entityType extends EntityType> = {
  [K in keyof Relations<entityType>]?:
    | true
    | (Relations<entityType>[K] extends {
        type: infer z extends EntityType
      }
        ? OptionsWithWith<z, SelectRelations<z>>
        : never)
}

type ConfigOptions<entityType extends EntityType, TheRelations> = {
  relations: (props: {
    many<toEntity extends EntityType>(
      to: toEntity,
      referenceField: keyof EntityInstance<toEntity>
    ): RelationInfo<toEntity>
    one<toEntity extends EntityType>(
      to: toEntity,
      field: keyof EntityInstance<entityType>
    ): OneRelationInfo<toEntity>
  }) => TheRelations
  filters?: string
}

export function config<entityType extends EntityType, TheRelations>(
  type: entityType,
  options: ConfigOptions<entityType, TheRelations>
): ConfigOptions<entityType, TheRelations> {
  return {} as any
}

export function specialRepo<
  entityType extends { new (): EntityInstance<entityType> }
>(type: entityType): SpecialRepo<entityType> {
  return {
    async find<withType extends SelectRelations<entityType>>(
      options: OptionsWithWith<entityType, withType>
    ) {
      const r = await remult.repo(type).find({ ...options })

      const rowEnrichers: ((
        row: EntityInstance<entityType>
      ) => Promise<EntityInstance<entityType>>)[] = []
      if (options.with)
        for (const key in type) {
          const config = type[key] as any as ConfigOptions<entityType, any>
          if (typeof config.relations === 'function') {
            const result = config.relations({
              one: (type, field) => ({
                relationType: 'one',
                type,
                field
              }),
              many: (type, field) => ({
                type,
                field
              })
            })
            for (const key in result) {
              if (Object.prototype.hasOwnProperty.call(result, key)) {
                const relation = result[key] as RelationInfo<any> & {
                  field: string
                }
                let z = (
                  options.with as Record<
                    string,
                    true | OptionsWithWith<any, any> | undefined
                  >
                )[key]
                if (z !== undefined) {
                  if (relation.relationType === 'one') {
                    
                      rowEnrichers.push(async (r) => {
                        let val = (r as Record<string, number | string>)[
                          relation.field
                        ]
                        if (typeof val === 'object') val = (val as any).id
                        return (await remult
                          .repo(relation.type)
                          .findId(val)) as any
                      })
                    
                    }
                   else {
                    let options :OptionsWithWith<any,any>={};
                    if (z!==true){
                      options={...z};
                    }
                    options.where = {}
                  }
                }
              }
            }
          }
        }
      for (const row of r) {
        for (const e of rowEnrichers) {
          await e(row)
        }
      }
      return r as InstanceTypeWithRelations<entityType, withType>[]
    }
  }
}

export interface OptionsWithWith<
  entityType extends EntityType,
  withType extends SelectRelations<entityType>
> extends FindOptions<EntityInstance<entityType>> {
  with?: withType
}

export interface SpecialRepo<entityType extends EntityType> {
  find<withType extends SelectRelations<entityType>>(
    options: OptionsWithWith<entityType, withType>
  ): Promise<InstanceTypeWithRelations<entityType, withType>[]>
}

export type InferRelatedType<
  T extends EntityType,
  withType
> = withType extends OptionsWithWith<T, infer withT>
  ? InstanceTypeWithRelations<T, withT>
  : withType extends true
  ? EntityInstance<T>
  : never

export type InstanceTypeWithRelations<
  entityType extends EntityType,
  withType extends SelectRelations<entityType> = {}
> = EntityInstance<entityType> & {
  [P in keyof Relations<entityType> as P extends keyof withType
    ? P
    : never]: Relations<entityType>[P] extends {
    type: infer z extends EntityType
  }
    ? Relations<entityType>[P] extends OneRelationInfo<z>
      ? InferRelatedType<z, withType[P]>
      : InferRelatedType<z, withType[P]>[]
    : never
}

// Typescript 4.7.4 at least
