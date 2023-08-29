import { Field, FindOptions, remult } from 'remult'

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
  return options
}

function getRelations<entityType extends EntityType>(type: entityType) {
  const relations: (RelationInfo<any> & { field: string; key: string })[] = []

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
        relations.push({ ...result[key], key })
      }
    }
  }
  return relations
}

export function specialRepo<
  entityType extends { new (): EntityInstance<entityType> }
>(type: entityType): SpecialRepo<entityType> {
  async function find<withType extends SelectRelations<entityType>>(
    options: OptionsWithWith<entityType, withType>
  ) {
    const r = await remult.repo(type).find({ ...options })

    const rowEnrichers: ((row: EntityInstance<entityType>) => Promise<void>)[] =
      []
    if (options.with)
      for (const relation of getRelations<entityType>(type)) {
        let z = (
          options.with as Record<
            string,
            true | OptionsWithWith<any, any> | undefined
          >
        )[relation.key]
        if (z !== undefined) {
          rowEnrichers.push(async (r) => {
            let relatedResult: any
            relatedResult = await getRelatedResult(relation, r, z)
            ;(r as any)[relation.key] = relatedResult
          })
        }
      }
    for (const field of remult.repo(type).fields.toArray()) {
      //@ts-ignore
      const relationInfo = field.options.relationInfo as OneToManyRelationInfo
      if (relationInfo) {
        rowEnrichers.push(async (r) => {
          //@ts-ignore
          r[field.key] = await remult
            .repo(relationInfo.toType())
            //@ts-ignore
            .find({
              //@ts-ignore
              where: { [relationInfo.field]: typeof r === 'object' ? r.id : r }
            })
        })
      }
    }
    for (const row of r) {
      for (const e of rowEnrichers) {
        await e(row)
      }
    }
    return r as InstanceTypeWithRelations<entityType, withType>[]
  }

  const relations: any = {}
  for (const relation of getRelations(type)) {
    relations[relation.key] = (
      instance: EntityInstance<entityType>,
      withRelations: SelectRelations<entityType>
    ) => getRelatedResult(relation, instance, withRelations || true)
  }
  for (const field of remult.repo(type).fields.toArray()) {
    //@ts-ignore
    const relationInfo = field.options.relationInfo as OneToManyRelationInfo
    if (relationInfo) {
      relations[field.key] = async (r: EntityInstance<entityType>) =>
        await remult
          .repo(relationInfo.toType())
          //@ts-ignore
          .find({
            //@ts-ignore
            where: { [relationInfo.field]: typeof r === 'object' ? r.id : r }
          })
    }
  }

  return {
    find,
    async findId(id: any, options: any) {
      const r = await find({
        ...options,
        where: {
          //@ts-ignore
          id
        },
        limit: 1
      })
      if (r.length == 0) return r
      return r[0]
    },
    relations
  } as any

  async function getRelatedResult(
    relation: ReturnType<typeof getRelations>[number],
    r: InstanceType<entityType>,
    z: boolean | OptionsWithWith<any, any> | undefined
  ) {
    if (relation.relationType === 'one') {
      let val = (r as Record<string, number | string>)[relation.field]
      if (typeof val === 'object') {
        val = (val as any).id
      }
      return (await remult.repo(relation.type).findId(val)) as any
    } else {
      let options: OptionsWithWith<any, any> = {}
      if (z !== true) {
        options = { ...z }
      }
      options.where = {
        $and: [
          options.where!,
          {
            [relation.field]:
              typeof r === 'object'
                ? remult.repo(type).metadata.idMetadata.getId(r)
                : r
          }
        ]
      }
      return await specialRepo(relation.type).find(options)
    }
  }
}

export interface OptionsWithWith<
  entityType extends EntityType,
  withType extends SelectRelations<entityType>,
  
> extends FindOptions<EntityInstance<entityType>> {
  with?: withType
}

export type SpecialRepo<entityType extends EntityType> = {
  find<withType extends SelectRelations<entityType>>(
    options: OptionsWithWith<entityType, withType>
  ): Promise<InstanceTypeWithRelations<entityType, withType>[]>
  findId<withType extends SelectRelations<entityType>>(
    id: string,
    options: OptionsWithWith<entityType, withType>
  ): Promise<InstanceTypeWithRelations<entityType, withType>>
} & {
  relations: {
    [P in keyof Relations<entityType>]: Relations<entityType>[P] extends OneRelationInfo<
      infer z
    >
      ? <withRelations extends SelectRelations<z>>(
          instance: EntityInstance<entityType>,
          options?: OptionsWithWith<z, withRelations>
        ) => Promise<InstanceTypeWithRelations<z, withRelations> | undefined>
      : Relations<entityType>[P] extends RelationInfo<infer z>
      ? <withRelations extends SelectRelations<z>>(
          instance: EntityInstance<entityType> | string,
          options?: OptionsWithWith<z, withRelations>
        ) => Promise<InstanceTypeWithRelations<z, withRelations>[]>
      : never
  } & {
    [K in keyof EntityInstance<entityType> as EntityInstance<entityType>[K] extends OneToMany<
      infer z
    >
      ? K
      : never]: EntityInstance<entityType>[K] extends OneToMany<infer z>
      ? (
          instance: EntityInstance<entityType> | string
          //@ts-ignore
        ) => Promise<EntityInstance<z>[]>
      : never
  }
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

export type OneToMany<T> = { type?: T } & Array<T>

export function OneToManyField<entityType, toEntityType extends EntityType>(
  entity: entityType,
  toEntityType: () => toEntityType,
  field: keyof EntityInstance<toEntityType>
) {
  return Field(() => undefined!, {
    serverExpression: () => [],
    //@ts-ignore
    relationInfo: {
      field,
      toType: toEntityType
    } as OneToManyRelationInfo
  })
}

interface OneToManyRelationInfo {
  field: string
  toType: () => any
}
