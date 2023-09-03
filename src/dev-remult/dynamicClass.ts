import { describeClass, Entity, EntityOptions } from 'remult'
import { ClassType } from 'remult/classType'
import { ClassFieldDecoratorContextStub, OmitEB } from 'remult/src/remult3'

export type decoratorReturnType<entityType, valueType> = (
  target: any,
  context:
    | string
    | ClassFieldDecoratorContextStub<entityType, valueType | undefined>,
  c?: any
) => void

export declare type InferMemberType<type> = type extends decoratorReturnType<
  any,
  infer R
>
  ? R
  : type extends () => infer R
  ? R
  : type extends ClassType<infer R>
  ? R
  : InferredType<type>

export declare type InferredType<type> = {
  [member in keyof OmitEB<type>]: InferMemberType<type[member]>
}

export function createEntity<T>(
  key: string,
  members: T,
  options?: EntityOptions<InferredType<T>>
): { new (...args: any[]): InferredType<T> } {
  const r = class {} as ClassType<InferredType<T>>

  //@ts-ignore
  describeClass(r, Entity(key, options), members)
  //@ts-ignore
  return r
}
