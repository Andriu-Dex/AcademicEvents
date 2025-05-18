
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model usuario
 * 
 */
export type usuario = $Result.DefaultSelection<Prisma.$usuarioPayload>
/**
 * Model carrera
 * 
 */
export type carrera = $Result.DefaultSelection<Prisma.$carreraPayload>
/**
 * Model evento
 * 
 */
export type evento = $Result.DefaultSelection<Prisma.$eventoPayload>
/**
 * Model inscripcion
 * 
 */
export type inscripcion = $Result.DefaultSelection<Prisma.$inscripcionPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const rol_usuario: {
  ADMIN: 'ADMIN',
  ESTUDIANTE: 'ESTUDIANTE'
};

export type rol_usuario = (typeof rol_usuario)[keyof typeof rol_usuario]


export const tipo_evento: {
  CURSO: 'CURSO',
  CONGRESO: 'CONGRESO',
  WEBINAR: 'WEBINAR',
  CHARLA: 'CHARLA',
  SOCIALIZACION: 'SOCIALIZACION',
  PUBLICO: 'PUBLICO'
};

export type tipo_evento = (typeof tipo_evento)[keyof typeof tipo_evento]


export const estado_inscripcion: {
  PENDIENTE: 'PENDIENTE',
  ACEPTADA: 'ACEPTADA',
  RECHAZADA: 'RECHAZADA',
  FINALIZADA: 'FINALIZADA'
};

export type estado_inscripcion = (typeof estado_inscripcion)[keyof typeof estado_inscripcion]

}

export type rol_usuario = $Enums.rol_usuario

export const rol_usuario: typeof $Enums.rol_usuario

export type tipo_evento = $Enums.tipo_evento

export const tipo_evento: typeof $Enums.tipo_evento

export type estado_inscripcion = $Enums.estado_inscripcion

export const estado_inscripcion: typeof $Enums.estado_inscripcion

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Usuarios
 * const usuarios = await prisma.usuario.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Usuarios
   * const usuarios = await prisma.usuario.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.usuario`: Exposes CRUD operations for the **usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.usuarioDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.carrera`: Exposes CRUD operations for the **carrera** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Carreras
    * const carreras = await prisma.carrera.findMany()
    * ```
    */
  get carrera(): Prisma.carreraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.evento`: Exposes CRUD operations for the **evento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Eventos
    * const eventos = await prisma.evento.findMany()
    * ```
    */
  get evento(): Prisma.eventoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inscripcion`: Exposes CRUD operations for the **inscripcion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inscripcions
    * const inscripcions = await prisma.inscripcion.findMany()
    * ```
    */
  get inscripcion(): Prisma.inscripcionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    usuario: 'usuario',
    carrera: 'carrera',
    evento: 'evento',
    inscripcion: 'inscripcion'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "usuario" | "carrera" | "evento" | "inscripcion"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      usuario: {
        payload: Prisma.$usuarioPayload<ExtArgs>
        fields: Prisma.usuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>
          }
          findFirst: {
            args: Prisma.usuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>
          }
          findMany: {
            args: Prisma.usuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>[]
          }
          create: {
            args: Prisma.usuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>
          }
          createMany: {
            args: Prisma.usuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.usuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>[]
          }
          delete: {
            args: Prisma.usuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>
          }
          update: {
            args: Prisma.usuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>
          }
          deleteMany: {
            args: Prisma.usuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.usuarioUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>[]
          }
          upsert: {
            args: Prisma.usuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.usuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.usuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      carrera: {
        payload: Prisma.$carreraPayload<ExtArgs>
        fields: Prisma.carreraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.carreraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.carreraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>
          }
          findFirst: {
            args: Prisma.carreraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.carreraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>
          }
          findMany: {
            args: Prisma.carreraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>[]
          }
          create: {
            args: Prisma.carreraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>
          }
          createMany: {
            args: Prisma.carreraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.carreraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>[]
          }
          delete: {
            args: Prisma.carreraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>
          }
          update: {
            args: Prisma.carreraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>
          }
          deleteMany: {
            args: Prisma.carreraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.carreraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.carreraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>[]
          }
          upsert: {
            args: Prisma.carreraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$carreraPayload>
          }
          aggregate: {
            args: Prisma.CarreraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCarrera>
          }
          groupBy: {
            args: Prisma.carreraGroupByArgs<ExtArgs>
            result: $Utils.Optional<CarreraGroupByOutputType>[]
          }
          count: {
            args: Prisma.carreraCountArgs<ExtArgs>
            result: $Utils.Optional<CarreraCountAggregateOutputType> | number
          }
        }
      }
      evento: {
        payload: Prisma.$eventoPayload<ExtArgs>
        fields: Prisma.eventoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.eventoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.eventoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>
          }
          findFirst: {
            args: Prisma.eventoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.eventoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>
          }
          findMany: {
            args: Prisma.eventoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>[]
          }
          create: {
            args: Prisma.eventoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>
          }
          createMany: {
            args: Prisma.eventoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.eventoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>[]
          }
          delete: {
            args: Prisma.eventoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>
          }
          update: {
            args: Prisma.eventoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>
          }
          deleteMany: {
            args: Prisma.eventoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.eventoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.eventoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>[]
          }
          upsert: {
            args: Prisma.eventoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$eventoPayload>
          }
          aggregate: {
            args: Prisma.EventoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvento>
          }
          groupBy: {
            args: Prisma.eventoGroupByArgs<ExtArgs>
            result: $Utils.Optional<EventoGroupByOutputType>[]
          }
          count: {
            args: Prisma.eventoCountArgs<ExtArgs>
            result: $Utils.Optional<EventoCountAggregateOutputType> | number
          }
        }
      }
      inscripcion: {
        payload: Prisma.$inscripcionPayload<ExtArgs>
        fields: Prisma.inscripcionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.inscripcionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.inscripcionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>
          }
          findFirst: {
            args: Prisma.inscripcionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.inscripcionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>
          }
          findMany: {
            args: Prisma.inscripcionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>[]
          }
          create: {
            args: Prisma.inscripcionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>
          }
          createMany: {
            args: Prisma.inscripcionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.inscripcionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>[]
          }
          delete: {
            args: Prisma.inscripcionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>
          }
          update: {
            args: Prisma.inscripcionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>
          }
          deleteMany: {
            args: Prisma.inscripcionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.inscripcionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.inscripcionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>[]
          }
          upsert: {
            args: Prisma.inscripcionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcionPayload>
          }
          aggregate: {
            args: Prisma.InscripcionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInscripcion>
          }
          groupBy: {
            args: Prisma.inscripcionGroupByArgs<ExtArgs>
            result: $Utils.Optional<InscripcionGroupByOutputType>[]
          }
          count: {
            args: Prisma.inscripcionCountArgs<ExtArgs>
            result: $Utils.Optional<InscripcionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    usuario?: usuarioOmit
    carrera?: carreraOmit
    evento?: eventoOmit
    inscripcion?: inscripcionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    inscripciones: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscripciones?: boolean | UsuarioCountOutputTypeCountInscripcionesArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountInscripcionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inscripcionWhereInput
  }


  /**
   * Count Type CarreraCountOutputType
   */

  export type CarreraCountOutputType = {
    eventos: number
  }

  export type CarreraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    eventos?: boolean | CarreraCountOutputTypeCountEventosArgs
  }

  // Custom InputTypes
  /**
   * CarreraCountOutputType without action
   */
  export type CarreraCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CarreraCountOutputType
     */
    select?: CarreraCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CarreraCountOutputType without action
   */
  export type CarreraCountOutputTypeCountEventosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: eventoWhereInput
  }


  /**
   * Count Type EventoCountOutputType
   */

  export type EventoCountOutputType = {
    inscripciones: number
  }

  export type EventoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscripciones?: boolean | EventoCountOutputTypeCountInscripcionesArgs
  }

  // Custom InputTypes
  /**
   * EventoCountOutputType without action
   */
  export type EventoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EventoCountOutputType
     */
    select?: EventoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EventoCountOutputType without action
   */
  export type EventoCountOutputTypeCountInscripcionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inscripcionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioMinAggregateOutputType = {
    id_usu: string | null
    ced_usu: string | null
    nom_usu: string | null
    ape_usu: string | null
    cor_usu: string | null
    con_usu: string | null
    cel_usu: string | null
    rol_usu: $Enums.rol_usuario | null
    fec_cre_usu: Date | null
  }

  export type UsuarioMaxAggregateOutputType = {
    id_usu: string | null
    ced_usu: string | null
    nom_usu: string | null
    ape_usu: string | null
    cor_usu: string | null
    con_usu: string | null
    cel_usu: string | null
    rol_usu: $Enums.rol_usuario | null
    fec_cre_usu: Date | null
  }

  export type UsuarioCountAggregateOutputType = {
    id_usu: number
    ced_usu: number
    nom_usu: number
    ape_usu: number
    cor_usu: number
    con_usu: number
    cel_usu: number
    rol_usu: number
    fec_cre_usu: number
    _all: number
  }


  export type UsuarioMinAggregateInputType = {
    id_usu?: true
    ced_usu?: true
    nom_usu?: true
    ape_usu?: true
    cor_usu?: true
    con_usu?: true
    cel_usu?: true
    rol_usu?: true
    fec_cre_usu?: true
  }

  export type UsuarioMaxAggregateInputType = {
    id_usu?: true
    ced_usu?: true
    nom_usu?: true
    ape_usu?: true
    cor_usu?: true
    con_usu?: true
    cel_usu?: true
    rol_usu?: true
    fec_cre_usu?: true
  }

  export type UsuarioCountAggregateInputType = {
    id_usu?: true
    ced_usu?: true
    nom_usu?: true
    ape_usu?: true
    cor_usu?: true
    con_usu?: true
    cel_usu?: true
    rol_usu?: true
    fec_cre_usu?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which usuario to aggregate.
     */
    where?: usuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuarioOrderByWithRelationInput | usuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type usuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usuarioWhereInput
    orderBy?: usuarioOrderByWithAggregationInput | usuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: usuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    id_usu: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu: Date
    _count: UsuarioCountAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends usuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type usuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_usu?: boolean
    ced_usu?: boolean
    nom_usu?: boolean
    ape_usu?: boolean
    cor_usu?: boolean
    con_usu?: boolean
    cel_usu?: boolean
    rol_usu?: boolean
    fec_cre_usu?: boolean
    inscripciones?: boolean | usuario$inscripcionesArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type usuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_usu?: boolean
    ced_usu?: boolean
    nom_usu?: boolean
    ape_usu?: boolean
    cor_usu?: boolean
    con_usu?: boolean
    cel_usu?: boolean
    rol_usu?: boolean
    fec_cre_usu?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type usuarioSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_usu?: boolean
    ced_usu?: boolean
    nom_usu?: boolean
    ape_usu?: boolean
    cor_usu?: boolean
    con_usu?: boolean
    cel_usu?: boolean
    rol_usu?: boolean
    fec_cre_usu?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type usuarioSelectScalar = {
    id_usu?: boolean
    ced_usu?: boolean
    nom_usu?: boolean
    ape_usu?: boolean
    cor_usu?: boolean
    con_usu?: boolean
    cel_usu?: boolean
    rol_usu?: boolean
    fec_cre_usu?: boolean
  }

  export type usuarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_usu" | "ced_usu" | "nom_usu" | "ape_usu" | "cor_usu" | "con_usu" | "cel_usu" | "rol_usu" | "fec_cre_usu", ExtArgs["result"]["usuario"]>
  export type usuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscripciones?: boolean | usuario$inscripcionesArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type usuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type usuarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $usuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "usuario"
    objects: {
      inscripciones: Prisma.$inscripcionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_usu: string
      ced_usu: string
      nom_usu: string
      ape_usu: string
      cor_usu: string
      con_usu: string
      cel_usu: string
      rol_usu: $Enums.rol_usuario
      fec_cre_usu: Date
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type usuarioGetPayload<S extends boolean | null | undefined | usuarioDefaultArgs> = $Result.GetResult<Prisma.$usuarioPayload, S>

  type usuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<usuarioFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface usuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['usuario'], meta: { name: 'usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {usuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usuarioFindUniqueArgs>(args: SelectSubset<T, usuarioFindUniqueArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {usuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, usuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usuarioFindFirstArgs>(args?: SelectSubset<T, usuarioFindFirstArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, usuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `id_usu`
     * const usuarioWithId_usuOnly = await prisma.usuario.findMany({ select: { id_usu: true } })
     * 
     */
    findMany<T extends usuarioFindManyArgs>(args?: SelectSubset<T, usuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Usuario.
     * @param {usuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends usuarioCreateArgs>(args: SelectSubset<T, usuarioCreateArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Usuarios.
     * @param {usuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usuarioCreateManyArgs>(args?: SelectSubset<T, usuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Usuarios and returns the data saved in the database.
     * @param {usuarioCreateManyAndReturnArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Usuarios and only return the `id_usu`
     * const usuarioWithId_usuOnly = await prisma.usuario.createManyAndReturn({
     *   select: { id_usu: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends usuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, usuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Usuario.
     * @param {usuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends usuarioDeleteArgs>(args: SelectSubset<T, usuarioDeleteArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Usuario.
     * @param {usuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usuarioUpdateArgs>(args: SelectSubset<T, usuarioUpdateArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Usuarios.
     * @param {usuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usuarioDeleteManyArgs>(args?: SelectSubset<T, usuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usuarioUpdateManyArgs>(args: SelectSubset<T, usuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios and returns the data updated in the database.
     * @param {usuarioUpdateManyAndReturnArgs} args - Arguments to update many Usuarios.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Usuarios and only return the `id_usu`
     * const usuarioWithId_usuOnly = await prisma.usuario.updateManyAndReturn({
     *   select: { id_usu: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends usuarioUpdateManyAndReturnArgs>(args: SelectSubset<T, usuarioUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Usuario.
     * @param {usuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends usuarioUpsertArgs>(args: SelectSubset<T, usuarioUpsertArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends usuarioCountArgs>(
      args?: Subset<T, usuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends usuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usuarioGroupByArgs['orderBy'] }
        : { orderBy?: usuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, usuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the usuario model
   */
  readonly fields: usuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inscripciones<T extends usuario$inscripcionesArgs<ExtArgs> = {}>(args?: Subset<T, usuario$inscripcionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the usuario model
   */
  interface usuarioFieldRefs {
    readonly id_usu: FieldRef<"usuario", 'String'>
    readonly ced_usu: FieldRef<"usuario", 'String'>
    readonly nom_usu: FieldRef<"usuario", 'String'>
    readonly ape_usu: FieldRef<"usuario", 'String'>
    readonly cor_usu: FieldRef<"usuario", 'String'>
    readonly con_usu: FieldRef<"usuario", 'String'>
    readonly cel_usu: FieldRef<"usuario", 'String'>
    readonly rol_usu: FieldRef<"usuario", 'rol_usuario'>
    readonly fec_cre_usu: FieldRef<"usuario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * usuario findUnique
   */
  export type usuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * Filter, which usuario to fetch.
     */
    where: usuarioWhereUniqueInput
  }

  /**
   * usuario findUniqueOrThrow
   */
  export type usuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * Filter, which usuario to fetch.
     */
    where: usuarioWhereUniqueInput
  }

  /**
   * usuario findFirst
   */
  export type usuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * Filter, which usuario to fetch.
     */
    where?: usuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuarioOrderByWithRelationInput | usuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for usuarios.
     */
    cursor?: usuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * usuario findFirstOrThrow
   */
  export type usuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * Filter, which usuario to fetch.
     */
    where?: usuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuarioOrderByWithRelationInput | usuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for usuarios.
     */
    cursor?: usuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * usuario findMany
   */
  export type usuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * Filter, which usuarios to fetch.
     */
    where?: usuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of usuarios to fetch.
     */
    orderBy?: usuarioOrderByWithRelationInput | usuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing usuarios.
     */
    cursor?: usuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` usuarios.
     */
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * usuario create
   */
  export type usuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a usuario.
     */
    data: XOR<usuarioCreateInput, usuarioUncheckedCreateInput>
  }

  /**
   * usuario createMany
   */
  export type usuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many usuarios.
     */
    data: usuarioCreateManyInput | usuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * usuario createManyAndReturn
   */
  export type usuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * The data used to create many usuarios.
     */
    data: usuarioCreateManyInput | usuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * usuario update
   */
  export type usuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a usuario.
     */
    data: XOR<usuarioUpdateInput, usuarioUncheckedUpdateInput>
    /**
     * Choose, which usuario to update.
     */
    where: usuarioWhereUniqueInput
  }

  /**
   * usuario updateMany
   */
  export type usuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update usuarios.
     */
    data: XOR<usuarioUpdateManyMutationInput, usuarioUncheckedUpdateManyInput>
    /**
     * Filter which usuarios to update
     */
    where?: usuarioWhereInput
    /**
     * Limit how many usuarios to update.
     */
    limit?: number
  }

  /**
   * usuario updateManyAndReturn
   */
  export type usuarioUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * The data used to update usuarios.
     */
    data: XOR<usuarioUpdateManyMutationInput, usuarioUncheckedUpdateManyInput>
    /**
     * Filter which usuarios to update
     */
    where?: usuarioWhereInput
    /**
     * Limit how many usuarios to update.
     */
    limit?: number
  }

  /**
   * usuario upsert
   */
  export type usuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the usuario to update in case it exists.
     */
    where: usuarioWhereUniqueInput
    /**
     * In case the usuario found by the `where` argument doesn't exist, create a new usuario with this data.
     */
    create: XOR<usuarioCreateInput, usuarioUncheckedCreateInput>
    /**
     * In case the usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usuarioUpdateInput, usuarioUncheckedUpdateInput>
  }

  /**
   * usuario delete
   */
  export type usuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
    /**
     * Filter which usuario to delete.
     */
    where: usuarioWhereUniqueInput
  }

  /**
   * usuario deleteMany
   */
  export type usuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which usuarios to delete
     */
    where?: usuarioWhereInput
    /**
     * Limit how many usuarios to delete.
     */
    limit?: number
  }

  /**
   * usuario.inscripciones
   */
  export type usuario$inscripcionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    where?: inscripcionWhereInput
    orderBy?: inscripcionOrderByWithRelationInput | inscripcionOrderByWithRelationInput[]
    cursor?: inscripcionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InscripcionScalarFieldEnum | InscripcionScalarFieldEnum[]
  }

  /**
   * usuario without action
   */
  export type usuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the usuario
     */
    select?: usuarioSelect<ExtArgs> | null
    /**
     * Omit specific fields from the usuario
     */
    omit?: usuarioOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioInclude<ExtArgs> | null
  }


  /**
   * Model carrera
   */

  export type AggregateCarrera = {
    _count: CarreraCountAggregateOutputType | null
    _min: CarreraMinAggregateOutputType | null
    _max: CarreraMaxAggregateOutputType | null
  }

  export type CarreraMinAggregateOutputType = {
    id_car: string | null
    nom_car: string | null
    est_car: boolean | null
    fec_cre_car: Date | null
  }

  export type CarreraMaxAggregateOutputType = {
    id_car: string | null
    nom_car: string | null
    est_car: boolean | null
    fec_cre_car: Date | null
  }

  export type CarreraCountAggregateOutputType = {
    id_car: number
    nom_car: number
    est_car: number
    fec_cre_car: number
    _all: number
  }


  export type CarreraMinAggregateInputType = {
    id_car?: true
    nom_car?: true
    est_car?: true
    fec_cre_car?: true
  }

  export type CarreraMaxAggregateInputType = {
    id_car?: true
    nom_car?: true
    est_car?: true
    fec_cre_car?: true
  }

  export type CarreraCountAggregateInputType = {
    id_car?: true
    nom_car?: true
    est_car?: true
    fec_cre_car?: true
    _all?: true
  }

  export type CarreraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which carrera to aggregate.
     */
    where?: carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carreras to fetch.
     */
    orderBy?: carreraOrderByWithRelationInput | carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carreras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned carreras
    **/
    _count?: true | CarreraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CarreraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CarreraMaxAggregateInputType
  }

  export type GetCarreraAggregateType<T extends CarreraAggregateArgs> = {
        [P in keyof T & keyof AggregateCarrera]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCarrera[P]>
      : GetScalarType<T[P], AggregateCarrera[P]>
  }




  export type carreraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: carreraWhereInput
    orderBy?: carreraOrderByWithAggregationInput | carreraOrderByWithAggregationInput[]
    by: CarreraScalarFieldEnum[] | CarreraScalarFieldEnum
    having?: carreraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CarreraCountAggregateInputType | true
    _min?: CarreraMinAggregateInputType
    _max?: CarreraMaxAggregateInputType
  }

  export type CarreraGroupByOutputType = {
    id_car: string
    nom_car: string
    est_car: boolean
    fec_cre_car: Date
    _count: CarreraCountAggregateOutputType | null
    _min: CarreraMinAggregateOutputType | null
    _max: CarreraMaxAggregateOutputType | null
  }

  type GetCarreraGroupByPayload<T extends carreraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CarreraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CarreraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CarreraGroupByOutputType[P]>
            : GetScalarType<T[P], CarreraGroupByOutputType[P]>
        }
      >
    >


  export type carreraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
    eventos?: boolean | carrera$eventosArgs<ExtArgs>
    _count?: boolean | CarreraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carrera"]>

  export type carreraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
  }, ExtArgs["result"]["carrera"]>

  export type carreraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
  }, ExtArgs["result"]["carrera"]>

  export type carreraSelectScalar = {
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
  }

  export type carreraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_car" | "nom_car" | "est_car" | "fec_cre_car", ExtArgs["result"]["carrera"]>
  export type carreraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    eventos?: boolean | carrera$eventosArgs<ExtArgs>
    _count?: boolean | CarreraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type carreraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type carreraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $carreraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "carrera"
    objects: {
      eventos: Prisma.$eventoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_car: string
      nom_car: string
      est_car: boolean
      fec_cre_car: Date
    }, ExtArgs["result"]["carrera"]>
    composites: {}
  }

  type carreraGetPayload<S extends boolean | null | undefined | carreraDefaultArgs> = $Result.GetResult<Prisma.$carreraPayload, S>

  type carreraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<carreraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CarreraCountAggregateInputType | true
    }

  export interface carreraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['carrera'], meta: { name: 'carrera' } }
    /**
     * Find zero or one Carrera that matches the filter.
     * @param {carreraFindUniqueArgs} args - Arguments to find a Carrera
     * @example
     * // Get one Carrera
     * const carrera = await prisma.carrera.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends carreraFindUniqueArgs>(args: SelectSubset<T, carreraFindUniqueArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Carrera that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {carreraFindUniqueOrThrowArgs} args - Arguments to find a Carrera
     * @example
     * // Get one Carrera
     * const carrera = await prisma.carrera.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends carreraFindUniqueOrThrowArgs>(args: SelectSubset<T, carreraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Carrera that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {carreraFindFirstArgs} args - Arguments to find a Carrera
     * @example
     * // Get one Carrera
     * const carrera = await prisma.carrera.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends carreraFindFirstArgs>(args?: SelectSubset<T, carreraFindFirstArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Carrera that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {carreraFindFirstOrThrowArgs} args - Arguments to find a Carrera
     * @example
     * // Get one Carrera
     * const carrera = await prisma.carrera.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends carreraFindFirstOrThrowArgs>(args?: SelectSubset<T, carreraFindFirstOrThrowArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Carreras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {carreraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Carreras
     * const carreras = await prisma.carrera.findMany()
     * 
     * // Get first 10 Carreras
     * const carreras = await prisma.carrera.findMany({ take: 10 })
     * 
     * // Only select the `id_car`
     * const carreraWithId_carOnly = await prisma.carrera.findMany({ select: { id_car: true } })
     * 
     */
    findMany<T extends carreraFindManyArgs>(args?: SelectSubset<T, carreraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Carrera.
     * @param {carreraCreateArgs} args - Arguments to create a Carrera.
     * @example
     * // Create one Carrera
     * const Carrera = await prisma.carrera.create({
     *   data: {
     *     // ... data to create a Carrera
     *   }
     * })
     * 
     */
    create<T extends carreraCreateArgs>(args: SelectSubset<T, carreraCreateArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Carreras.
     * @param {carreraCreateManyArgs} args - Arguments to create many Carreras.
     * @example
     * // Create many Carreras
     * const carrera = await prisma.carrera.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends carreraCreateManyArgs>(args?: SelectSubset<T, carreraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Carreras and returns the data saved in the database.
     * @param {carreraCreateManyAndReturnArgs} args - Arguments to create many Carreras.
     * @example
     * // Create many Carreras
     * const carrera = await prisma.carrera.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Carreras and only return the `id_car`
     * const carreraWithId_carOnly = await prisma.carrera.createManyAndReturn({
     *   select: { id_car: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends carreraCreateManyAndReturnArgs>(args?: SelectSubset<T, carreraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Carrera.
     * @param {carreraDeleteArgs} args - Arguments to delete one Carrera.
     * @example
     * // Delete one Carrera
     * const Carrera = await prisma.carrera.delete({
     *   where: {
     *     // ... filter to delete one Carrera
     *   }
     * })
     * 
     */
    delete<T extends carreraDeleteArgs>(args: SelectSubset<T, carreraDeleteArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Carrera.
     * @param {carreraUpdateArgs} args - Arguments to update one Carrera.
     * @example
     * // Update one Carrera
     * const carrera = await prisma.carrera.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends carreraUpdateArgs>(args: SelectSubset<T, carreraUpdateArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Carreras.
     * @param {carreraDeleteManyArgs} args - Arguments to filter Carreras to delete.
     * @example
     * // Delete a few Carreras
     * const { count } = await prisma.carrera.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends carreraDeleteManyArgs>(args?: SelectSubset<T, carreraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Carreras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {carreraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Carreras
     * const carrera = await prisma.carrera.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends carreraUpdateManyArgs>(args: SelectSubset<T, carreraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Carreras and returns the data updated in the database.
     * @param {carreraUpdateManyAndReturnArgs} args - Arguments to update many Carreras.
     * @example
     * // Update many Carreras
     * const carrera = await prisma.carrera.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Carreras and only return the `id_car`
     * const carreraWithId_carOnly = await prisma.carrera.updateManyAndReturn({
     *   select: { id_car: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends carreraUpdateManyAndReturnArgs>(args: SelectSubset<T, carreraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Carrera.
     * @param {carreraUpsertArgs} args - Arguments to update or create a Carrera.
     * @example
     * // Update or create a Carrera
     * const carrera = await prisma.carrera.upsert({
     *   create: {
     *     // ... data to create a Carrera
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Carrera we want to update
     *   }
     * })
     */
    upsert<T extends carreraUpsertArgs>(args: SelectSubset<T, carreraUpsertArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Carreras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {carreraCountArgs} args - Arguments to filter Carreras to count.
     * @example
     * // Count the number of Carreras
     * const count = await prisma.carrera.count({
     *   where: {
     *     // ... the filter for the Carreras we want to count
     *   }
     * })
    **/
    count<T extends carreraCountArgs>(
      args?: Subset<T, carreraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CarreraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Carrera.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CarreraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CarreraAggregateArgs>(args: Subset<T, CarreraAggregateArgs>): Prisma.PrismaPromise<GetCarreraAggregateType<T>>

    /**
     * Group by Carrera.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {carreraGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends carreraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: carreraGroupByArgs['orderBy'] }
        : { orderBy?: carreraGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, carreraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCarreraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the carrera model
   */
  readonly fields: carreraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for carrera.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__carreraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    eventos<T extends carrera$eventosArgs<ExtArgs> = {}>(args?: Subset<T, carrera$eventosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the carrera model
   */
  interface carreraFieldRefs {
    readonly id_car: FieldRef<"carrera", 'String'>
    readonly nom_car: FieldRef<"carrera", 'String'>
    readonly est_car: FieldRef<"carrera", 'Boolean'>
    readonly fec_cre_car: FieldRef<"carrera", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * carrera findUnique
   */
  export type carreraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * Filter, which carrera to fetch.
     */
    where: carreraWhereUniqueInput
  }

  /**
   * carrera findUniqueOrThrow
   */
  export type carreraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * Filter, which carrera to fetch.
     */
    where: carreraWhereUniqueInput
  }

  /**
   * carrera findFirst
   */
  export type carreraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * Filter, which carrera to fetch.
     */
    where?: carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carreras to fetch.
     */
    orderBy?: carreraOrderByWithRelationInput | carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for carreras.
     */
    cursor?: carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carreras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of carreras.
     */
    distinct?: CarreraScalarFieldEnum | CarreraScalarFieldEnum[]
  }

  /**
   * carrera findFirstOrThrow
   */
  export type carreraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * Filter, which carrera to fetch.
     */
    where?: carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carreras to fetch.
     */
    orderBy?: carreraOrderByWithRelationInput | carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for carreras.
     */
    cursor?: carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carreras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of carreras.
     */
    distinct?: CarreraScalarFieldEnum | CarreraScalarFieldEnum[]
  }

  /**
   * carrera findMany
   */
  export type carreraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * Filter, which carreras to fetch.
     */
    where?: carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of carreras to fetch.
     */
    orderBy?: carreraOrderByWithRelationInput | carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing carreras.
     */
    cursor?: carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` carreras.
     */
    skip?: number
    distinct?: CarreraScalarFieldEnum | CarreraScalarFieldEnum[]
  }

  /**
   * carrera create
   */
  export type carreraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * The data needed to create a carrera.
     */
    data: XOR<carreraCreateInput, carreraUncheckedCreateInput>
  }

  /**
   * carrera createMany
   */
  export type carreraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many carreras.
     */
    data: carreraCreateManyInput | carreraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * carrera createManyAndReturn
   */
  export type carreraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * The data used to create many carreras.
     */
    data: carreraCreateManyInput | carreraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * carrera update
   */
  export type carreraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * The data needed to update a carrera.
     */
    data: XOR<carreraUpdateInput, carreraUncheckedUpdateInput>
    /**
     * Choose, which carrera to update.
     */
    where: carreraWhereUniqueInput
  }

  /**
   * carrera updateMany
   */
  export type carreraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update carreras.
     */
    data: XOR<carreraUpdateManyMutationInput, carreraUncheckedUpdateManyInput>
    /**
     * Filter which carreras to update
     */
    where?: carreraWhereInput
    /**
     * Limit how many carreras to update.
     */
    limit?: number
  }

  /**
   * carrera updateManyAndReturn
   */
  export type carreraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * The data used to update carreras.
     */
    data: XOR<carreraUpdateManyMutationInput, carreraUncheckedUpdateManyInput>
    /**
     * Filter which carreras to update
     */
    where?: carreraWhereInput
    /**
     * Limit how many carreras to update.
     */
    limit?: number
  }

  /**
   * carrera upsert
   */
  export type carreraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * The filter to search for the carrera to update in case it exists.
     */
    where: carreraWhereUniqueInput
    /**
     * In case the carrera found by the `where` argument doesn't exist, create a new carrera with this data.
     */
    create: XOR<carreraCreateInput, carreraUncheckedCreateInput>
    /**
     * In case the carrera was found with the provided `where` argument, update it with this data.
     */
    update: XOR<carreraUpdateInput, carreraUncheckedUpdateInput>
  }

  /**
   * carrera delete
   */
  export type carreraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    /**
     * Filter which carrera to delete.
     */
    where: carreraWhereUniqueInput
  }

  /**
   * carrera deleteMany
   */
  export type carreraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which carreras to delete
     */
    where?: carreraWhereInput
    /**
     * Limit how many carreras to delete.
     */
    limit?: number
  }

  /**
   * carrera.eventos
   */
  export type carrera$eventosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    where?: eventoWhereInput
    orderBy?: eventoOrderByWithRelationInput | eventoOrderByWithRelationInput[]
    cursor?: eventoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EventoScalarFieldEnum | EventoScalarFieldEnum[]
  }

  /**
   * carrera without action
   */
  export type carreraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
  }


  /**
   * Model evento
   */

  export type AggregateEvento = {
    _count: EventoCountAggregateOutputType | null
    _avg: EventoAvgAggregateOutputType | null
    _sum: EventoSumAggregateOutputType | null
    _min: EventoMinAggregateOutputType | null
    _max: EventoMaxAggregateOutputType | null
  }

  export type EventoAvgAggregateOutputType = {
    dur_hrs_eve: number | null
    nota_min_eve: number | null
    por_asist_eve: number | null
  }

  export type EventoSumAggregateOutputType = {
    dur_hrs_eve: number | null
    nota_min_eve: number | null
    por_asist_eve: number | null
  }

  export type EventoMinAggregateOutputType = {
    id_eve: string | null
    nom_eve: string | null
    des_eve: string | null
    tip_eve: $Enums.tipo_evento | null
    fec_ini_eve: Date | null
    fec_fin_eve: Date | null
    dur_hrs_eve: number | null
    pagado_eve: boolean | null
    nota_min_eve: number | null
    por_asist_eve: number | null
    est_eve: boolean | null
    fec_cre_eve: Date | null
    carreraId: string | null
  }

  export type EventoMaxAggregateOutputType = {
    id_eve: string | null
    nom_eve: string | null
    des_eve: string | null
    tip_eve: $Enums.tipo_evento | null
    fec_ini_eve: Date | null
    fec_fin_eve: Date | null
    dur_hrs_eve: number | null
    pagado_eve: boolean | null
    nota_min_eve: number | null
    por_asist_eve: number | null
    est_eve: boolean | null
    fec_cre_eve: Date | null
    carreraId: string | null
  }

  export type EventoCountAggregateOutputType = {
    id_eve: number
    nom_eve: number
    des_eve: number
    tip_eve: number
    fec_ini_eve: number
    fec_fin_eve: number
    dur_hrs_eve: number
    pagado_eve: number
    nota_min_eve: number
    por_asist_eve: number
    est_eve: number
    fec_cre_eve: number
    carreraId: number
    _all: number
  }


  export type EventoAvgAggregateInputType = {
    dur_hrs_eve?: true
    nota_min_eve?: true
    por_asist_eve?: true
  }

  export type EventoSumAggregateInputType = {
    dur_hrs_eve?: true
    nota_min_eve?: true
    por_asist_eve?: true
  }

  export type EventoMinAggregateInputType = {
    id_eve?: true
    nom_eve?: true
    des_eve?: true
    tip_eve?: true
    fec_ini_eve?: true
    fec_fin_eve?: true
    dur_hrs_eve?: true
    pagado_eve?: true
    nota_min_eve?: true
    por_asist_eve?: true
    est_eve?: true
    fec_cre_eve?: true
    carreraId?: true
  }

  export type EventoMaxAggregateInputType = {
    id_eve?: true
    nom_eve?: true
    des_eve?: true
    tip_eve?: true
    fec_ini_eve?: true
    fec_fin_eve?: true
    dur_hrs_eve?: true
    pagado_eve?: true
    nota_min_eve?: true
    por_asist_eve?: true
    est_eve?: true
    fec_cre_eve?: true
    carreraId?: true
  }

  export type EventoCountAggregateInputType = {
    id_eve?: true
    nom_eve?: true
    des_eve?: true
    tip_eve?: true
    fec_ini_eve?: true
    fec_fin_eve?: true
    dur_hrs_eve?: true
    pagado_eve?: true
    nota_min_eve?: true
    por_asist_eve?: true
    est_eve?: true
    fec_cre_eve?: true
    carreraId?: true
    _all?: true
  }

  export type EventoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which evento to aggregate.
     */
    where?: eventoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of eventos to fetch.
     */
    orderBy?: eventoOrderByWithRelationInput | eventoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: eventoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` eventos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` eventos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned eventos
    **/
    _count?: true | EventoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EventoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EventoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EventoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EventoMaxAggregateInputType
  }

  export type GetEventoAggregateType<T extends EventoAggregateArgs> = {
        [P in keyof T & keyof AggregateEvento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvento[P]>
      : GetScalarType<T[P], AggregateEvento[P]>
  }




  export type eventoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: eventoWhereInput
    orderBy?: eventoOrderByWithAggregationInput | eventoOrderByWithAggregationInput[]
    by: EventoScalarFieldEnum[] | EventoScalarFieldEnum
    having?: eventoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EventoCountAggregateInputType | true
    _avg?: EventoAvgAggregateInputType
    _sum?: EventoSumAggregateInputType
    _min?: EventoMinAggregateInputType
    _max?: EventoMaxAggregateInputType
  }

  export type EventoGroupByOutputType = {
    id_eve: string
    nom_eve: string
    des_eve: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date
    fec_fin_eve: Date
    dur_hrs_eve: number
    pagado_eve: boolean
    nota_min_eve: number | null
    por_asist_eve: number | null
    est_eve: boolean
    fec_cre_eve: Date
    carreraId: string | null
    _count: EventoCountAggregateOutputType | null
    _avg: EventoAvgAggregateOutputType | null
    _sum: EventoSumAggregateOutputType | null
    _min: EventoMinAggregateOutputType | null
    _max: EventoMaxAggregateOutputType | null
  }

  type GetEventoGroupByPayload<T extends eventoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EventoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EventoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EventoGroupByOutputType[P]>
            : GetScalarType<T[P], EventoGroupByOutputType[P]>
        }
      >
    >


  export type eventoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    fec_fin_eve?: boolean
    dur_hrs_eve?: boolean
    pagado_eve?: boolean
    nota_min_eve?: boolean
    por_asist_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    carreraId?: boolean
    carrera?: boolean | evento$carreraArgs<ExtArgs>
    inscripciones?: boolean | evento$inscripcionesArgs<ExtArgs>
    _count?: boolean | EventoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento"]>

  export type eventoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    fec_fin_eve?: boolean
    dur_hrs_eve?: boolean
    pagado_eve?: boolean
    nota_min_eve?: boolean
    por_asist_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    carreraId?: boolean
    carrera?: boolean | evento$carreraArgs<ExtArgs>
  }, ExtArgs["result"]["evento"]>

  export type eventoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    fec_fin_eve?: boolean
    dur_hrs_eve?: boolean
    pagado_eve?: boolean
    nota_min_eve?: boolean
    por_asist_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    carreraId?: boolean
    carrera?: boolean | evento$carreraArgs<ExtArgs>
  }, ExtArgs["result"]["evento"]>

  export type eventoSelectScalar = {
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    fec_fin_eve?: boolean
    dur_hrs_eve?: boolean
    pagado_eve?: boolean
    nota_min_eve?: boolean
    por_asist_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    carreraId?: boolean
  }

  export type eventoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_eve" | "nom_eve" | "des_eve" | "tip_eve" | "fec_ini_eve" | "fec_fin_eve" | "dur_hrs_eve" | "pagado_eve" | "nota_min_eve" | "por_asist_eve" | "est_eve" | "fec_cre_eve" | "carreraId", ExtArgs["result"]["evento"]>
  export type eventoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | evento$carreraArgs<ExtArgs>
    inscripciones?: boolean | evento$inscripcionesArgs<ExtArgs>
    _count?: boolean | EventoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type eventoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | evento$carreraArgs<ExtArgs>
  }
  export type eventoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | evento$carreraArgs<ExtArgs>
  }

  export type $eventoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "evento"
    objects: {
      carrera: Prisma.$carreraPayload<ExtArgs> | null
      inscripciones: Prisma.$inscripcionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_eve: string
      nom_eve: string
      des_eve: string | null
      tip_eve: $Enums.tipo_evento
      fec_ini_eve: Date
      fec_fin_eve: Date
      dur_hrs_eve: number
      pagado_eve: boolean
      nota_min_eve: number | null
      por_asist_eve: number | null
      est_eve: boolean
      fec_cre_eve: Date
      carreraId: string | null
    }, ExtArgs["result"]["evento"]>
    composites: {}
  }

  type eventoGetPayload<S extends boolean | null | undefined | eventoDefaultArgs> = $Result.GetResult<Prisma.$eventoPayload, S>

  type eventoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<eventoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EventoCountAggregateInputType | true
    }

  export interface eventoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['evento'], meta: { name: 'evento' } }
    /**
     * Find zero or one Evento that matches the filter.
     * @param {eventoFindUniqueArgs} args - Arguments to find a Evento
     * @example
     * // Get one Evento
     * const evento = await prisma.evento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends eventoFindUniqueArgs>(args: SelectSubset<T, eventoFindUniqueArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Evento that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {eventoFindUniqueOrThrowArgs} args - Arguments to find a Evento
     * @example
     * // Get one Evento
     * const evento = await prisma.evento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends eventoFindUniqueOrThrowArgs>(args: SelectSubset<T, eventoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {eventoFindFirstArgs} args - Arguments to find a Evento
     * @example
     * // Get one Evento
     * const evento = await prisma.evento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends eventoFindFirstArgs>(args?: SelectSubset<T, eventoFindFirstArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {eventoFindFirstOrThrowArgs} args - Arguments to find a Evento
     * @example
     * // Get one Evento
     * const evento = await prisma.evento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends eventoFindFirstOrThrowArgs>(args?: SelectSubset<T, eventoFindFirstOrThrowArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Eventos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {eventoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Eventos
     * const eventos = await prisma.evento.findMany()
     * 
     * // Get first 10 Eventos
     * const eventos = await prisma.evento.findMany({ take: 10 })
     * 
     * // Only select the `id_eve`
     * const eventoWithId_eveOnly = await prisma.evento.findMany({ select: { id_eve: true } })
     * 
     */
    findMany<T extends eventoFindManyArgs>(args?: SelectSubset<T, eventoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Evento.
     * @param {eventoCreateArgs} args - Arguments to create a Evento.
     * @example
     * // Create one Evento
     * const Evento = await prisma.evento.create({
     *   data: {
     *     // ... data to create a Evento
     *   }
     * })
     * 
     */
    create<T extends eventoCreateArgs>(args: SelectSubset<T, eventoCreateArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Eventos.
     * @param {eventoCreateManyArgs} args - Arguments to create many Eventos.
     * @example
     * // Create many Eventos
     * const evento = await prisma.evento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends eventoCreateManyArgs>(args?: SelectSubset<T, eventoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Eventos and returns the data saved in the database.
     * @param {eventoCreateManyAndReturnArgs} args - Arguments to create many Eventos.
     * @example
     * // Create many Eventos
     * const evento = await prisma.evento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Eventos and only return the `id_eve`
     * const eventoWithId_eveOnly = await prisma.evento.createManyAndReturn({
     *   select: { id_eve: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends eventoCreateManyAndReturnArgs>(args?: SelectSubset<T, eventoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Evento.
     * @param {eventoDeleteArgs} args - Arguments to delete one Evento.
     * @example
     * // Delete one Evento
     * const Evento = await prisma.evento.delete({
     *   where: {
     *     // ... filter to delete one Evento
     *   }
     * })
     * 
     */
    delete<T extends eventoDeleteArgs>(args: SelectSubset<T, eventoDeleteArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Evento.
     * @param {eventoUpdateArgs} args - Arguments to update one Evento.
     * @example
     * // Update one Evento
     * const evento = await prisma.evento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends eventoUpdateArgs>(args: SelectSubset<T, eventoUpdateArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Eventos.
     * @param {eventoDeleteManyArgs} args - Arguments to filter Eventos to delete.
     * @example
     * // Delete a few Eventos
     * const { count } = await prisma.evento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends eventoDeleteManyArgs>(args?: SelectSubset<T, eventoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Eventos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {eventoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Eventos
     * const evento = await prisma.evento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends eventoUpdateManyArgs>(args: SelectSubset<T, eventoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Eventos and returns the data updated in the database.
     * @param {eventoUpdateManyAndReturnArgs} args - Arguments to update many Eventos.
     * @example
     * // Update many Eventos
     * const evento = await prisma.evento.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Eventos and only return the `id_eve`
     * const eventoWithId_eveOnly = await prisma.evento.updateManyAndReturn({
     *   select: { id_eve: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends eventoUpdateManyAndReturnArgs>(args: SelectSubset<T, eventoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Evento.
     * @param {eventoUpsertArgs} args - Arguments to update or create a Evento.
     * @example
     * // Update or create a Evento
     * const evento = await prisma.evento.upsert({
     *   create: {
     *     // ... data to create a Evento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Evento we want to update
     *   }
     * })
     */
    upsert<T extends eventoUpsertArgs>(args: SelectSubset<T, eventoUpsertArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Eventos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {eventoCountArgs} args - Arguments to filter Eventos to count.
     * @example
     * // Count the number of Eventos
     * const count = await prisma.evento.count({
     *   where: {
     *     // ... the filter for the Eventos we want to count
     *   }
     * })
    **/
    count<T extends eventoCountArgs>(
      args?: Subset<T, eventoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EventoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Evento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EventoAggregateArgs>(args: Subset<T, EventoAggregateArgs>): Prisma.PrismaPromise<GetEventoAggregateType<T>>

    /**
     * Group by Evento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {eventoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends eventoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: eventoGroupByArgs['orderBy'] }
        : { orderBy?: eventoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, eventoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEventoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the evento model
   */
  readonly fields: eventoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for evento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__eventoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    carrera<T extends evento$carreraArgs<ExtArgs> = {}>(args?: Subset<T, evento$carreraArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    inscripciones<T extends evento$inscripcionesArgs<ExtArgs> = {}>(args?: Subset<T, evento$inscripcionesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the evento model
   */
  interface eventoFieldRefs {
    readonly id_eve: FieldRef<"evento", 'String'>
    readonly nom_eve: FieldRef<"evento", 'String'>
    readonly des_eve: FieldRef<"evento", 'String'>
    readonly tip_eve: FieldRef<"evento", 'tipo_evento'>
    readonly fec_ini_eve: FieldRef<"evento", 'DateTime'>
    readonly fec_fin_eve: FieldRef<"evento", 'DateTime'>
    readonly dur_hrs_eve: FieldRef<"evento", 'Int'>
    readonly pagado_eve: FieldRef<"evento", 'Boolean'>
    readonly nota_min_eve: FieldRef<"evento", 'Float'>
    readonly por_asist_eve: FieldRef<"evento", 'Float'>
    readonly est_eve: FieldRef<"evento", 'Boolean'>
    readonly fec_cre_eve: FieldRef<"evento", 'DateTime'>
    readonly carreraId: FieldRef<"evento", 'String'>
  }
    

  // Custom InputTypes
  /**
   * evento findUnique
   */
  export type eventoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * Filter, which evento to fetch.
     */
    where: eventoWhereUniqueInput
  }

  /**
   * evento findUniqueOrThrow
   */
  export type eventoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * Filter, which evento to fetch.
     */
    where: eventoWhereUniqueInput
  }

  /**
   * evento findFirst
   */
  export type eventoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * Filter, which evento to fetch.
     */
    where?: eventoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of eventos to fetch.
     */
    orderBy?: eventoOrderByWithRelationInput | eventoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for eventos.
     */
    cursor?: eventoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` eventos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` eventos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of eventos.
     */
    distinct?: EventoScalarFieldEnum | EventoScalarFieldEnum[]
  }

  /**
   * evento findFirstOrThrow
   */
  export type eventoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * Filter, which evento to fetch.
     */
    where?: eventoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of eventos to fetch.
     */
    orderBy?: eventoOrderByWithRelationInput | eventoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for eventos.
     */
    cursor?: eventoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` eventos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` eventos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of eventos.
     */
    distinct?: EventoScalarFieldEnum | EventoScalarFieldEnum[]
  }

  /**
   * evento findMany
   */
  export type eventoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * Filter, which eventos to fetch.
     */
    where?: eventoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of eventos to fetch.
     */
    orderBy?: eventoOrderByWithRelationInput | eventoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing eventos.
     */
    cursor?: eventoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` eventos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` eventos.
     */
    skip?: number
    distinct?: EventoScalarFieldEnum | EventoScalarFieldEnum[]
  }

  /**
   * evento create
   */
  export type eventoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * The data needed to create a evento.
     */
    data: XOR<eventoCreateInput, eventoUncheckedCreateInput>
  }

  /**
   * evento createMany
   */
  export type eventoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many eventos.
     */
    data: eventoCreateManyInput | eventoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * evento createManyAndReturn
   */
  export type eventoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * The data used to create many eventos.
     */
    data: eventoCreateManyInput | eventoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * evento update
   */
  export type eventoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * The data needed to update a evento.
     */
    data: XOR<eventoUpdateInput, eventoUncheckedUpdateInput>
    /**
     * Choose, which evento to update.
     */
    where: eventoWhereUniqueInput
  }

  /**
   * evento updateMany
   */
  export type eventoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update eventos.
     */
    data: XOR<eventoUpdateManyMutationInput, eventoUncheckedUpdateManyInput>
    /**
     * Filter which eventos to update
     */
    where?: eventoWhereInput
    /**
     * Limit how many eventos to update.
     */
    limit?: number
  }

  /**
   * evento updateManyAndReturn
   */
  export type eventoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * The data used to update eventos.
     */
    data: XOR<eventoUpdateManyMutationInput, eventoUncheckedUpdateManyInput>
    /**
     * Filter which eventos to update
     */
    where?: eventoWhereInput
    /**
     * Limit how many eventos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * evento upsert
   */
  export type eventoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * The filter to search for the evento to update in case it exists.
     */
    where: eventoWhereUniqueInput
    /**
     * In case the evento found by the `where` argument doesn't exist, create a new evento with this data.
     */
    create: XOR<eventoCreateInput, eventoUncheckedCreateInput>
    /**
     * In case the evento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<eventoUpdateInput, eventoUncheckedUpdateInput>
  }

  /**
   * evento delete
   */
  export type eventoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
    /**
     * Filter which evento to delete.
     */
    where: eventoWhereUniqueInput
  }

  /**
   * evento deleteMany
   */
  export type eventoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which eventos to delete
     */
    where?: eventoWhereInput
    /**
     * Limit how many eventos to delete.
     */
    limit?: number
  }

  /**
   * evento.carrera
   */
  export type evento$carreraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the carrera
     */
    select?: carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the carrera
     */
    omit?: carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraInclude<ExtArgs> | null
    where?: carreraWhereInput
  }

  /**
   * evento.inscripciones
   */
  export type evento$inscripcionesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    where?: inscripcionWhereInput
    orderBy?: inscripcionOrderByWithRelationInput | inscripcionOrderByWithRelationInput[]
    cursor?: inscripcionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InscripcionScalarFieldEnum | InscripcionScalarFieldEnum[]
  }

  /**
   * evento without action
   */
  export type eventoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento
     */
    select?: eventoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento
     */
    omit?: eventoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: eventoInclude<ExtArgs> | null
  }


  /**
   * Model inscripcion
   */

  export type AggregateInscripcion = {
    _count: InscripcionCountAggregateOutputType | null
    _avg: InscripcionAvgAggregateOutputType | null
    _sum: InscripcionSumAggregateOutputType | null
    _min: InscripcionMinAggregateOutputType | null
    _max: InscripcionMaxAggregateOutputType | null
  }

  export type InscripcionAvgAggregateOutputType = {
    nota_final: number | null
    asistencia: number | null
  }

  export type InscripcionSumAggregateOutputType = {
    nota_final: number | null
    asistencia: number | null
  }

  export type InscripcionMinAggregateOutputType = {
    id_ins: string | null
    id_usu: string | null
    id_eve: string | null
    comprobante: string | null
    nota_final: number | null
    asistencia: number | null
    estado: $Enums.estado_inscripcion | null
    fec_ins: Date | null
    cert_enviado: boolean | null
  }

  export type InscripcionMaxAggregateOutputType = {
    id_ins: string | null
    id_usu: string | null
    id_eve: string | null
    comprobante: string | null
    nota_final: number | null
    asistencia: number | null
    estado: $Enums.estado_inscripcion | null
    fec_ins: Date | null
    cert_enviado: boolean | null
  }

  export type InscripcionCountAggregateOutputType = {
    id_ins: number
    id_usu: number
    id_eve: number
    comprobante: number
    nota_final: number
    asistencia: number
    estado: number
    fec_ins: number
    cert_enviado: number
    _all: number
  }


  export type InscripcionAvgAggregateInputType = {
    nota_final?: true
    asistencia?: true
  }

  export type InscripcionSumAggregateInputType = {
    nota_final?: true
    asistencia?: true
  }

  export type InscripcionMinAggregateInputType = {
    id_ins?: true
    id_usu?: true
    id_eve?: true
    comprobante?: true
    nota_final?: true
    asistencia?: true
    estado?: true
    fec_ins?: true
    cert_enviado?: true
  }

  export type InscripcionMaxAggregateInputType = {
    id_ins?: true
    id_usu?: true
    id_eve?: true
    comprobante?: true
    nota_final?: true
    asistencia?: true
    estado?: true
    fec_ins?: true
    cert_enviado?: true
  }

  export type InscripcionCountAggregateInputType = {
    id_ins?: true
    id_usu?: true
    id_eve?: true
    comprobante?: true
    nota_final?: true
    asistencia?: true
    estado?: true
    fec_ins?: true
    cert_enviado?: true
    _all?: true
  }

  export type InscripcionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inscripcion to aggregate.
     */
    where?: inscripcionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcions to fetch.
     */
    orderBy?: inscripcionOrderByWithRelationInput | inscripcionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: inscripcionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned inscripcions
    **/
    _count?: true | InscripcionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InscripcionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InscripcionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InscripcionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InscripcionMaxAggregateInputType
  }

  export type GetInscripcionAggregateType<T extends InscripcionAggregateArgs> = {
        [P in keyof T & keyof AggregateInscripcion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInscripcion[P]>
      : GetScalarType<T[P], AggregateInscripcion[P]>
  }




  export type inscripcionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inscripcionWhereInput
    orderBy?: inscripcionOrderByWithAggregationInput | inscripcionOrderByWithAggregationInput[]
    by: InscripcionScalarFieldEnum[] | InscripcionScalarFieldEnum
    having?: inscripcionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InscripcionCountAggregateInputType | true
    _avg?: InscripcionAvgAggregateInputType
    _sum?: InscripcionSumAggregateInputType
    _min?: InscripcionMinAggregateInputType
    _max?: InscripcionMaxAggregateInputType
  }

  export type InscripcionGroupByOutputType = {
    id_ins: string
    id_usu: string
    id_eve: string
    comprobante: string | null
    nota_final: number | null
    asistencia: number | null
    estado: $Enums.estado_inscripcion
    fec_ins: Date
    cert_enviado: boolean
    _count: InscripcionCountAggregateOutputType | null
    _avg: InscripcionAvgAggregateOutputType | null
    _sum: InscripcionSumAggregateOutputType | null
    _min: InscripcionMinAggregateOutputType | null
    _max: InscripcionMaxAggregateOutputType | null
  }

  type GetInscripcionGroupByPayload<T extends inscripcionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InscripcionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InscripcionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InscripcionGroupByOutputType[P]>
            : GetScalarType<T[P], InscripcionGroupByOutputType[P]>
        }
      >
    >


  export type inscripcionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins?: boolean
    id_usu?: boolean
    id_eve?: boolean
    comprobante?: boolean
    nota_final?: boolean
    asistencia?: boolean
    estado?: boolean
    fec_ins?: boolean
    cert_enviado?: boolean
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion"]>

  export type inscripcionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins?: boolean
    id_usu?: boolean
    id_eve?: boolean
    comprobante?: boolean
    nota_final?: boolean
    asistencia?: boolean
    estado?: boolean
    fec_ins?: boolean
    cert_enviado?: boolean
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion"]>

  export type inscripcionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins?: boolean
    id_usu?: boolean
    id_eve?: boolean
    comprobante?: boolean
    nota_final?: boolean
    asistencia?: boolean
    estado?: boolean
    fec_ins?: boolean
    cert_enviado?: boolean
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion"]>

  export type inscripcionSelectScalar = {
    id_ins?: boolean
    id_usu?: boolean
    id_eve?: boolean
    comprobante?: boolean
    nota_final?: boolean
    asistencia?: boolean
    estado?: boolean
    fec_ins?: boolean
    cert_enviado?: boolean
  }

  export type inscripcionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_ins" | "id_usu" | "id_eve" | "comprobante" | "nota_final" | "asistencia" | "estado" | "fec_ins" | "cert_enviado", ExtArgs["result"]["inscripcion"]>
  export type inscripcionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }
  export type inscripcionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }
  export type inscripcionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }

  export type $inscripcionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "inscripcion"
    objects: {
      usuario: Prisma.$usuarioPayload<ExtArgs>
      evento: Prisma.$eventoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_ins: string
      id_usu: string
      id_eve: string
      comprobante: string | null
      nota_final: number | null
      asistencia: number | null
      estado: $Enums.estado_inscripcion
      fec_ins: Date
      cert_enviado: boolean
    }, ExtArgs["result"]["inscripcion"]>
    composites: {}
  }

  type inscripcionGetPayload<S extends boolean | null | undefined | inscripcionDefaultArgs> = $Result.GetResult<Prisma.$inscripcionPayload, S>

  type inscripcionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<inscripcionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InscripcionCountAggregateInputType | true
    }

  export interface inscripcionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['inscripcion'], meta: { name: 'inscripcion' } }
    /**
     * Find zero or one Inscripcion that matches the filter.
     * @param {inscripcionFindUniqueArgs} args - Arguments to find a Inscripcion
     * @example
     * // Get one Inscripcion
     * const inscripcion = await prisma.inscripcion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends inscripcionFindUniqueArgs>(args: SelectSubset<T, inscripcionFindUniqueArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inscripcion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {inscripcionFindUniqueOrThrowArgs} args - Arguments to find a Inscripcion
     * @example
     * // Get one Inscripcion
     * const inscripcion = await prisma.inscripcion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends inscripcionFindUniqueOrThrowArgs>(args: SelectSubset<T, inscripcionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inscripcion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcionFindFirstArgs} args - Arguments to find a Inscripcion
     * @example
     * // Get one Inscripcion
     * const inscripcion = await prisma.inscripcion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends inscripcionFindFirstArgs>(args?: SelectSubset<T, inscripcionFindFirstArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inscripcion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcionFindFirstOrThrowArgs} args - Arguments to find a Inscripcion
     * @example
     * // Get one Inscripcion
     * const inscripcion = await prisma.inscripcion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends inscripcionFindFirstOrThrowArgs>(args?: SelectSubset<T, inscripcionFindFirstOrThrowArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inscripcions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inscripcions
     * const inscripcions = await prisma.inscripcion.findMany()
     * 
     * // Get first 10 Inscripcions
     * const inscripcions = await prisma.inscripcion.findMany({ take: 10 })
     * 
     * // Only select the `id_ins`
     * const inscripcionWithId_insOnly = await prisma.inscripcion.findMany({ select: { id_ins: true } })
     * 
     */
    findMany<T extends inscripcionFindManyArgs>(args?: SelectSubset<T, inscripcionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inscripcion.
     * @param {inscripcionCreateArgs} args - Arguments to create a Inscripcion.
     * @example
     * // Create one Inscripcion
     * const Inscripcion = await prisma.inscripcion.create({
     *   data: {
     *     // ... data to create a Inscripcion
     *   }
     * })
     * 
     */
    create<T extends inscripcionCreateArgs>(args: SelectSubset<T, inscripcionCreateArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inscripcions.
     * @param {inscripcionCreateManyArgs} args - Arguments to create many Inscripcions.
     * @example
     * // Create many Inscripcions
     * const inscripcion = await prisma.inscripcion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends inscripcionCreateManyArgs>(args?: SelectSubset<T, inscripcionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inscripcions and returns the data saved in the database.
     * @param {inscripcionCreateManyAndReturnArgs} args - Arguments to create many Inscripcions.
     * @example
     * // Create many Inscripcions
     * const inscripcion = await prisma.inscripcion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inscripcions and only return the `id_ins`
     * const inscripcionWithId_insOnly = await prisma.inscripcion.createManyAndReturn({
     *   select: { id_ins: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends inscripcionCreateManyAndReturnArgs>(args?: SelectSubset<T, inscripcionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inscripcion.
     * @param {inscripcionDeleteArgs} args - Arguments to delete one Inscripcion.
     * @example
     * // Delete one Inscripcion
     * const Inscripcion = await prisma.inscripcion.delete({
     *   where: {
     *     // ... filter to delete one Inscripcion
     *   }
     * })
     * 
     */
    delete<T extends inscripcionDeleteArgs>(args: SelectSubset<T, inscripcionDeleteArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inscripcion.
     * @param {inscripcionUpdateArgs} args - Arguments to update one Inscripcion.
     * @example
     * // Update one Inscripcion
     * const inscripcion = await prisma.inscripcion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends inscripcionUpdateArgs>(args: SelectSubset<T, inscripcionUpdateArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inscripcions.
     * @param {inscripcionDeleteManyArgs} args - Arguments to filter Inscripcions to delete.
     * @example
     * // Delete a few Inscripcions
     * const { count } = await prisma.inscripcion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends inscripcionDeleteManyArgs>(args?: SelectSubset<T, inscripcionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inscripcions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inscripcions
     * const inscripcion = await prisma.inscripcion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends inscripcionUpdateManyArgs>(args: SelectSubset<T, inscripcionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inscripcions and returns the data updated in the database.
     * @param {inscripcionUpdateManyAndReturnArgs} args - Arguments to update many Inscripcions.
     * @example
     * // Update many Inscripcions
     * const inscripcion = await prisma.inscripcion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inscripcions and only return the `id_ins`
     * const inscripcionWithId_insOnly = await prisma.inscripcion.updateManyAndReturn({
     *   select: { id_ins: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends inscripcionUpdateManyAndReturnArgs>(args: SelectSubset<T, inscripcionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inscripcion.
     * @param {inscripcionUpsertArgs} args - Arguments to update or create a Inscripcion.
     * @example
     * // Update or create a Inscripcion
     * const inscripcion = await prisma.inscripcion.upsert({
     *   create: {
     *     // ... data to create a Inscripcion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inscripcion we want to update
     *   }
     * })
     */
    upsert<T extends inscripcionUpsertArgs>(args: SelectSubset<T, inscripcionUpsertArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inscripcions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcionCountArgs} args - Arguments to filter Inscripcions to count.
     * @example
     * // Count the number of Inscripcions
     * const count = await prisma.inscripcion.count({
     *   where: {
     *     // ... the filter for the Inscripcions we want to count
     *   }
     * })
    **/
    count<T extends inscripcionCountArgs>(
      args?: Subset<T, inscripcionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InscripcionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inscripcion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InscripcionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InscripcionAggregateArgs>(args: Subset<T, InscripcionAggregateArgs>): Prisma.PrismaPromise<GetInscripcionAggregateType<T>>

    /**
     * Group by Inscripcion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends inscripcionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: inscripcionGroupByArgs['orderBy'] }
        : { orderBy?: inscripcionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, inscripcionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInscripcionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the inscripcion model
   */
  readonly fields: inscripcionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for inscripcion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__inscripcionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends usuarioDefaultArgs<ExtArgs> = {}>(args?: Subset<T, usuarioDefaultArgs<ExtArgs>>): Prisma__usuarioClient<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    evento<T extends eventoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, eventoDefaultArgs<ExtArgs>>): Prisma__eventoClient<$Result.GetResult<Prisma.$eventoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the inscripcion model
   */
  interface inscripcionFieldRefs {
    readonly id_ins: FieldRef<"inscripcion", 'String'>
    readonly id_usu: FieldRef<"inscripcion", 'String'>
    readonly id_eve: FieldRef<"inscripcion", 'String'>
    readonly comprobante: FieldRef<"inscripcion", 'String'>
    readonly nota_final: FieldRef<"inscripcion", 'Float'>
    readonly asistencia: FieldRef<"inscripcion", 'Float'>
    readonly estado: FieldRef<"inscripcion", 'estado_inscripcion'>
    readonly fec_ins: FieldRef<"inscripcion", 'DateTime'>
    readonly cert_enviado: FieldRef<"inscripcion", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * inscripcion findUnique
   */
  export type inscripcionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion to fetch.
     */
    where: inscripcionWhereUniqueInput
  }

  /**
   * inscripcion findUniqueOrThrow
   */
  export type inscripcionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion to fetch.
     */
    where: inscripcionWhereUniqueInput
  }

  /**
   * inscripcion findFirst
   */
  export type inscripcionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion to fetch.
     */
    where?: inscripcionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcions to fetch.
     */
    orderBy?: inscripcionOrderByWithRelationInput | inscripcionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inscripcions.
     */
    cursor?: inscripcionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inscripcions.
     */
    distinct?: InscripcionScalarFieldEnum | InscripcionScalarFieldEnum[]
  }

  /**
   * inscripcion findFirstOrThrow
   */
  export type inscripcionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion to fetch.
     */
    where?: inscripcionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcions to fetch.
     */
    orderBy?: inscripcionOrderByWithRelationInput | inscripcionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inscripcions.
     */
    cursor?: inscripcionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inscripcions.
     */
    distinct?: InscripcionScalarFieldEnum | InscripcionScalarFieldEnum[]
  }

  /**
   * inscripcion findMany
   */
  export type inscripcionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * Filter, which inscripcions to fetch.
     */
    where?: inscripcionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcions to fetch.
     */
    orderBy?: inscripcionOrderByWithRelationInput | inscripcionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing inscripcions.
     */
    cursor?: inscripcionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcions.
     */
    skip?: number
    distinct?: InscripcionScalarFieldEnum | InscripcionScalarFieldEnum[]
  }

  /**
   * inscripcion create
   */
  export type inscripcionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * The data needed to create a inscripcion.
     */
    data: XOR<inscripcionCreateInput, inscripcionUncheckedCreateInput>
  }

  /**
   * inscripcion createMany
   */
  export type inscripcionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many inscripcions.
     */
    data: inscripcionCreateManyInput | inscripcionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * inscripcion createManyAndReturn
   */
  export type inscripcionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * The data used to create many inscripcions.
     */
    data: inscripcionCreateManyInput | inscripcionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * inscripcion update
   */
  export type inscripcionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * The data needed to update a inscripcion.
     */
    data: XOR<inscripcionUpdateInput, inscripcionUncheckedUpdateInput>
    /**
     * Choose, which inscripcion to update.
     */
    where: inscripcionWhereUniqueInput
  }

  /**
   * inscripcion updateMany
   */
  export type inscripcionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update inscripcions.
     */
    data: XOR<inscripcionUpdateManyMutationInput, inscripcionUncheckedUpdateManyInput>
    /**
     * Filter which inscripcions to update
     */
    where?: inscripcionWhereInput
    /**
     * Limit how many inscripcions to update.
     */
    limit?: number
  }

  /**
   * inscripcion updateManyAndReturn
   */
  export type inscripcionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * The data used to update inscripcions.
     */
    data: XOR<inscripcionUpdateManyMutationInput, inscripcionUncheckedUpdateManyInput>
    /**
     * Filter which inscripcions to update
     */
    where?: inscripcionWhereInput
    /**
     * Limit how many inscripcions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * inscripcion upsert
   */
  export type inscripcionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * The filter to search for the inscripcion to update in case it exists.
     */
    where: inscripcionWhereUniqueInput
    /**
     * In case the inscripcion found by the `where` argument doesn't exist, create a new inscripcion with this data.
     */
    create: XOR<inscripcionCreateInput, inscripcionUncheckedCreateInput>
    /**
     * In case the inscripcion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<inscripcionUpdateInput, inscripcionUncheckedUpdateInput>
  }

  /**
   * inscripcion delete
   */
  export type inscripcionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
    /**
     * Filter which inscripcion to delete.
     */
    where: inscripcionWhereUniqueInput
  }

  /**
   * inscripcion deleteMany
   */
  export type inscripcionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inscripcions to delete
     */
    where?: inscripcionWhereInput
    /**
     * Limit how many inscripcions to delete.
     */
    limit?: number
  }

  /**
   * inscripcion without action
   */
  export type inscripcionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion
     */
    select?: inscripcionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion
     */
    omit?: inscripcionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UsuarioScalarFieldEnum: {
    id_usu: 'id_usu',
    ced_usu: 'ced_usu',
    nom_usu: 'nom_usu',
    ape_usu: 'ape_usu',
    cor_usu: 'cor_usu',
    con_usu: 'con_usu',
    cel_usu: 'cel_usu',
    rol_usu: 'rol_usu',
    fec_cre_usu: 'fec_cre_usu'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const CarreraScalarFieldEnum: {
    id_car: 'id_car',
    nom_car: 'nom_car',
    est_car: 'est_car',
    fec_cre_car: 'fec_cre_car'
  };

  export type CarreraScalarFieldEnum = (typeof CarreraScalarFieldEnum)[keyof typeof CarreraScalarFieldEnum]


  export const EventoScalarFieldEnum: {
    id_eve: 'id_eve',
    nom_eve: 'nom_eve',
    des_eve: 'des_eve',
    tip_eve: 'tip_eve',
    fec_ini_eve: 'fec_ini_eve',
    fec_fin_eve: 'fec_fin_eve',
    dur_hrs_eve: 'dur_hrs_eve',
    pagado_eve: 'pagado_eve',
    nota_min_eve: 'nota_min_eve',
    por_asist_eve: 'por_asist_eve',
    est_eve: 'est_eve',
    fec_cre_eve: 'fec_cre_eve',
    carreraId: 'carreraId'
  };

  export type EventoScalarFieldEnum = (typeof EventoScalarFieldEnum)[keyof typeof EventoScalarFieldEnum]


  export const InscripcionScalarFieldEnum: {
    id_ins: 'id_ins',
    id_usu: 'id_usu',
    id_eve: 'id_eve',
    comprobante: 'comprobante',
    nota_final: 'nota_final',
    asistencia: 'asistencia',
    estado: 'estado',
    fec_ins: 'fec_ins',
    cert_enviado: 'cert_enviado'
  };

  export type InscripcionScalarFieldEnum = (typeof InscripcionScalarFieldEnum)[keyof typeof InscripcionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'rol_usuario'
   */
  export type Enumrol_usuarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'rol_usuario'>
    


  /**
   * Reference to a field of type 'rol_usuario[]'
   */
  export type ListEnumrol_usuarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'rol_usuario[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'tipo_evento'
   */
  export type Enumtipo_eventoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'tipo_evento'>
    


  /**
   * Reference to a field of type 'tipo_evento[]'
   */
  export type ListEnumtipo_eventoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'tipo_evento[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'estado_inscripcion'
   */
  export type Enumestado_inscripcionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'estado_inscripcion'>
    


  /**
   * Reference to a field of type 'estado_inscripcion[]'
   */
  export type ListEnumestado_inscripcionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'estado_inscripcion[]'>
    
  /**
   * Deep Input Types
   */


  export type usuarioWhereInput = {
    AND?: usuarioWhereInput | usuarioWhereInput[]
    OR?: usuarioWhereInput[]
    NOT?: usuarioWhereInput | usuarioWhereInput[]
    id_usu?: StringFilter<"usuario"> | string
    ced_usu?: StringFilter<"usuario"> | string
    nom_usu?: StringFilter<"usuario"> | string
    ape_usu?: StringFilter<"usuario"> | string
    cor_usu?: StringFilter<"usuario"> | string
    con_usu?: StringFilter<"usuario"> | string
    cel_usu?: StringFilter<"usuario"> | string
    rol_usu?: Enumrol_usuarioFilter<"usuario"> | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFilter<"usuario"> | Date | string
    inscripciones?: InscripcionListRelationFilter
  }

  export type usuarioOrderByWithRelationInput = {
    id_usu?: SortOrder
    ced_usu?: SortOrder
    nom_usu?: SortOrder
    ape_usu?: SortOrder
    cor_usu?: SortOrder
    con_usu?: SortOrder
    cel_usu?: SortOrder
    rol_usu?: SortOrder
    fec_cre_usu?: SortOrder
    inscripciones?: inscripcionOrderByRelationAggregateInput
  }

  export type usuarioWhereUniqueInput = Prisma.AtLeast<{
    id_usu?: string
    ced_usu?: string
    cor_usu?: string
    AND?: usuarioWhereInput | usuarioWhereInput[]
    OR?: usuarioWhereInput[]
    NOT?: usuarioWhereInput | usuarioWhereInput[]
    nom_usu?: StringFilter<"usuario"> | string
    ape_usu?: StringFilter<"usuario"> | string
    con_usu?: StringFilter<"usuario"> | string
    cel_usu?: StringFilter<"usuario"> | string
    rol_usu?: Enumrol_usuarioFilter<"usuario"> | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFilter<"usuario"> | Date | string
    inscripciones?: InscripcionListRelationFilter
  }, "id_usu" | "ced_usu" | "cor_usu">

  export type usuarioOrderByWithAggregationInput = {
    id_usu?: SortOrder
    ced_usu?: SortOrder
    nom_usu?: SortOrder
    ape_usu?: SortOrder
    cor_usu?: SortOrder
    con_usu?: SortOrder
    cel_usu?: SortOrder
    rol_usu?: SortOrder
    fec_cre_usu?: SortOrder
    _count?: usuarioCountOrderByAggregateInput
    _max?: usuarioMaxOrderByAggregateInput
    _min?: usuarioMinOrderByAggregateInput
  }

  export type usuarioScalarWhereWithAggregatesInput = {
    AND?: usuarioScalarWhereWithAggregatesInput | usuarioScalarWhereWithAggregatesInput[]
    OR?: usuarioScalarWhereWithAggregatesInput[]
    NOT?: usuarioScalarWhereWithAggregatesInput | usuarioScalarWhereWithAggregatesInput[]
    id_usu?: StringWithAggregatesFilter<"usuario"> | string
    ced_usu?: StringWithAggregatesFilter<"usuario"> | string
    nom_usu?: StringWithAggregatesFilter<"usuario"> | string
    ape_usu?: StringWithAggregatesFilter<"usuario"> | string
    cor_usu?: StringWithAggregatesFilter<"usuario"> | string
    con_usu?: StringWithAggregatesFilter<"usuario"> | string
    cel_usu?: StringWithAggregatesFilter<"usuario"> | string
    rol_usu?: Enumrol_usuarioWithAggregatesFilter<"usuario"> | $Enums.rol_usuario
    fec_cre_usu?: DateTimeWithAggregatesFilter<"usuario"> | Date | string
  }

  export type carreraWhereInput = {
    AND?: carreraWhereInput | carreraWhereInput[]
    OR?: carreraWhereInput[]
    NOT?: carreraWhereInput | carreraWhereInput[]
    id_car?: StringFilter<"carrera"> | string
    nom_car?: StringFilter<"carrera"> | string
    est_car?: BoolFilter<"carrera"> | boolean
    fec_cre_car?: DateTimeFilter<"carrera"> | Date | string
    eventos?: EventoListRelationFilter
  }

  export type carreraOrderByWithRelationInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    eventos?: eventoOrderByRelationAggregateInput
  }

  export type carreraWhereUniqueInput = Prisma.AtLeast<{
    id_car?: string
    nom_car?: string
    AND?: carreraWhereInput | carreraWhereInput[]
    OR?: carreraWhereInput[]
    NOT?: carreraWhereInput | carreraWhereInput[]
    est_car?: BoolFilter<"carrera"> | boolean
    fec_cre_car?: DateTimeFilter<"carrera"> | Date | string
    eventos?: EventoListRelationFilter
  }, "id_car" | "nom_car">

  export type carreraOrderByWithAggregationInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    _count?: carreraCountOrderByAggregateInput
    _max?: carreraMaxOrderByAggregateInput
    _min?: carreraMinOrderByAggregateInput
  }

  export type carreraScalarWhereWithAggregatesInput = {
    AND?: carreraScalarWhereWithAggregatesInput | carreraScalarWhereWithAggregatesInput[]
    OR?: carreraScalarWhereWithAggregatesInput[]
    NOT?: carreraScalarWhereWithAggregatesInput | carreraScalarWhereWithAggregatesInput[]
    id_car?: StringWithAggregatesFilter<"carrera"> | string
    nom_car?: StringWithAggregatesFilter<"carrera"> | string
    est_car?: BoolWithAggregatesFilter<"carrera"> | boolean
    fec_cre_car?: DateTimeWithAggregatesFilter<"carrera"> | Date | string
  }

  export type eventoWhereInput = {
    AND?: eventoWhereInput | eventoWhereInput[]
    OR?: eventoWhereInput[]
    NOT?: eventoWhereInput | eventoWhereInput[]
    id_eve?: StringFilter<"evento"> | string
    nom_eve?: StringFilter<"evento"> | string
    des_eve?: StringNullableFilter<"evento"> | string | null
    tip_eve?: Enumtipo_eventoFilter<"evento"> | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFilter<"evento"> | Date | string
    fec_fin_eve?: DateTimeFilter<"evento"> | Date | string
    dur_hrs_eve?: IntFilter<"evento"> | number
    pagado_eve?: BoolFilter<"evento"> | boolean
    nota_min_eve?: FloatNullableFilter<"evento"> | number | null
    por_asist_eve?: FloatNullableFilter<"evento"> | number | null
    est_eve?: BoolFilter<"evento"> | boolean
    fec_cre_eve?: DateTimeFilter<"evento"> | Date | string
    carreraId?: StringNullableFilter<"evento"> | string | null
    carrera?: XOR<CarreraNullableScalarRelationFilter, carreraWhereInput> | null
    inscripciones?: InscripcionListRelationFilter
  }

  export type eventoOrderByWithRelationInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrderInput | SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    fec_fin_eve?: SortOrder
    dur_hrs_eve?: SortOrder
    pagado_eve?: SortOrder
    nota_min_eve?: SortOrderInput | SortOrder
    por_asist_eve?: SortOrderInput | SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    carreraId?: SortOrderInput | SortOrder
    carrera?: carreraOrderByWithRelationInput
    inscripciones?: inscripcionOrderByRelationAggregateInput
  }

  export type eventoWhereUniqueInput = Prisma.AtLeast<{
    id_eve?: string
    AND?: eventoWhereInput | eventoWhereInput[]
    OR?: eventoWhereInput[]
    NOT?: eventoWhereInput | eventoWhereInput[]
    nom_eve?: StringFilter<"evento"> | string
    des_eve?: StringNullableFilter<"evento"> | string | null
    tip_eve?: Enumtipo_eventoFilter<"evento"> | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFilter<"evento"> | Date | string
    fec_fin_eve?: DateTimeFilter<"evento"> | Date | string
    dur_hrs_eve?: IntFilter<"evento"> | number
    pagado_eve?: BoolFilter<"evento"> | boolean
    nota_min_eve?: FloatNullableFilter<"evento"> | number | null
    por_asist_eve?: FloatNullableFilter<"evento"> | number | null
    est_eve?: BoolFilter<"evento"> | boolean
    fec_cre_eve?: DateTimeFilter<"evento"> | Date | string
    carreraId?: StringNullableFilter<"evento"> | string | null
    carrera?: XOR<CarreraNullableScalarRelationFilter, carreraWhereInput> | null
    inscripciones?: InscripcionListRelationFilter
  }, "id_eve">

  export type eventoOrderByWithAggregationInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrderInput | SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    fec_fin_eve?: SortOrder
    dur_hrs_eve?: SortOrder
    pagado_eve?: SortOrder
    nota_min_eve?: SortOrderInput | SortOrder
    por_asist_eve?: SortOrderInput | SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    carreraId?: SortOrderInput | SortOrder
    _count?: eventoCountOrderByAggregateInput
    _avg?: eventoAvgOrderByAggregateInput
    _max?: eventoMaxOrderByAggregateInput
    _min?: eventoMinOrderByAggregateInput
    _sum?: eventoSumOrderByAggregateInput
  }

  export type eventoScalarWhereWithAggregatesInput = {
    AND?: eventoScalarWhereWithAggregatesInput | eventoScalarWhereWithAggregatesInput[]
    OR?: eventoScalarWhereWithAggregatesInput[]
    NOT?: eventoScalarWhereWithAggregatesInput | eventoScalarWhereWithAggregatesInput[]
    id_eve?: StringWithAggregatesFilter<"evento"> | string
    nom_eve?: StringWithAggregatesFilter<"evento"> | string
    des_eve?: StringNullableWithAggregatesFilter<"evento"> | string | null
    tip_eve?: Enumtipo_eventoWithAggregatesFilter<"evento"> | $Enums.tipo_evento
    fec_ini_eve?: DateTimeWithAggregatesFilter<"evento"> | Date | string
    fec_fin_eve?: DateTimeWithAggregatesFilter<"evento"> | Date | string
    dur_hrs_eve?: IntWithAggregatesFilter<"evento"> | number
    pagado_eve?: BoolWithAggregatesFilter<"evento"> | boolean
    nota_min_eve?: FloatNullableWithAggregatesFilter<"evento"> | number | null
    por_asist_eve?: FloatNullableWithAggregatesFilter<"evento"> | number | null
    est_eve?: BoolWithAggregatesFilter<"evento"> | boolean
    fec_cre_eve?: DateTimeWithAggregatesFilter<"evento"> | Date | string
    carreraId?: StringNullableWithAggregatesFilter<"evento"> | string | null
  }

  export type inscripcionWhereInput = {
    AND?: inscripcionWhereInput | inscripcionWhereInput[]
    OR?: inscripcionWhereInput[]
    NOT?: inscripcionWhereInput | inscripcionWhereInput[]
    id_ins?: StringFilter<"inscripcion"> | string
    id_usu?: StringFilter<"inscripcion"> | string
    id_eve?: StringFilter<"inscripcion"> | string
    comprobante?: StringNullableFilter<"inscripcion"> | string | null
    nota_final?: FloatNullableFilter<"inscripcion"> | number | null
    asistencia?: FloatNullableFilter<"inscripcion"> | number | null
    estado?: Enumestado_inscripcionFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeFilter<"inscripcion"> | Date | string
    cert_enviado?: BoolFilter<"inscripcion"> | boolean
    usuario?: XOR<UsuarioScalarRelationFilter, usuarioWhereInput>
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
  }

  export type inscripcionOrderByWithRelationInput = {
    id_ins?: SortOrder
    id_usu?: SortOrder
    id_eve?: SortOrder
    comprobante?: SortOrderInput | SortOrder
    nota_final?: SortOrderInput | SortOrder
    asistencia?: SortOrderInput | SortOrder
    estado?: SortOrder
    fec_ins?: SortOrder
    cert_enviado?: SortOrder
    usuario?: usuarioOrderByWithRelationInput
    evento?: eventoOrderByWithRelationInput
  }

  export type inscripcionWhereUniqueInput = Prisma.AtLeast<{
    id_ins?: string
    id_usu_id_eve?: inscripcionId_usuId_eveCompoundUniqueInput
    AND?: inscripcionWhereInput | inscripcionWhereInput[]
    OR?: inscripcionWhereInput[]
    NOT?: inscripcionWhereInput | inscripcionWhereInput[]
    id_usu?: StringFilter<"inscripcion"> | string
    id_eve?: StringFilter<"inscripcion"> | string
    comprobante?: StringNullableFilter<"inscripcion"> | string | null
    nota_final?: FloatNullableFilter<"inscripcion"> | number | null
    asistencia?: FloatNullableFilter<"inscripcion"> | number | null
    estado?: Enumestado_inscripcionFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeFilter<"inscripcion"> | Date | string
    cert_enviado?: BoolFilter<"inscripcion"> | boolean
    usuario?: XOR<UsuarioScalarRelationFilter, usuarioWhereInput>
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
  }, "id_ins" | "id_usu_id_eve">

  export type inscripcionOrderByWithAggregationInput = {
    id_ins?: SortOrder
    id_usu?: SortOrder
    id_eve?: SortOrder
    comprobante?: SortOrderInput | SortOrder
    nota_final?: SortOrderInput | SortOrder
    asistencia?: SortOrderInput | SortOrder
    estado?: SortOrder
    fec_ins?: SortOrder
    cert_enviado?: SortOrder
    _count?: inscripcionCountOrderByAggregateInput
    _avg?: inscripcionAvgOrderByAggregateInput
    _max?: inscripcionMaxOrderByAggregateInput
    _min?: inscripcionMinOrderByAggregateInput
    _sum?: inscripcionSumOrderByAggregateInput
  }

  export type inscripcionScalarWhereWithAggregatesInput = {
    AND?: inscripcionScalarWhereWithAggregatesInput | inscripcionScalarWhereWithAggregatesInput[]
    OR?: inscripcionScalarWhereWithAggregatesInput[]
    NOT?: inscripcionScalarWhereWithAggregatesInput | inscripcionScalarWhereWithAggregatesInput[]
    id_ins?: StringWithAggregatesFilter<"inscripcion"> | string
    id_usu?: StringWithAggregatesFilter<"inscripcion"> | string
    id_eve?: StringWithAggregatesFilter<"inscripcion"> | string
    comprobante?: StringNullableWithAggregatesFilter<"inscripcion"> | string | null
    nota_final?: FloatNullableWithAggregatesFilter<"inscripcion"> | number | null
    asistencia?: FloatNullableWithAggregatesFilter<"inscripcion"> | number | null
    estado?: Enumestado_inscripcionWithAggregatesFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeWithAggregatesFilter<"inscripcion"> | Date | string
    cert_enviado?: BoolWithAggregatesFilter<"inscripcion"> | boolean
  }

  export type usuarioCreateInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
    inscripciones?: inscripcionCreateNestedManyWithoutUsuarioInput
  }

  export type usuarioUncheckedCreateInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
    inscripciones?: inscripcionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type usuarioUpdateInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
    inscripciones?: inscripcionUpdateManyWithoutUsuarioNestedInput
  }

  export type usuarioUncheckedUpdateInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
    inscripciones?: inscripcionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type usuarioCreateManyInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
  }

  export type usuarioUpdateManyMutationInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usuarioUncheckedUpdateManyInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type carreraCreateInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    eventos?: eventoCreateNestedManyWithoutCarreraInput
  }

  export type carreraUncheckedCreateInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    eventos?: eventoUncheckedCreateNestedManyWithoutCarreraInput
  }

  export type carreraUpdateInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    eventos?: eventoUpdateManyWithoutCarreraNestedInput
  }

  export type carreraUncheckedUpdateInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    eventos?: eventoUncheckedUpdateManyWithoutCarreraNestedInput
  }

  export type carreraCreateManyInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
  }

  export type carreraUpdateManyMutationInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type carreraUncheckedUpdateManyInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type eventoCreateInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    carrera?: carreraCreateNestedOneWithoutEventosInput
    inscripciones?: inscripcionCreateNestedManyWithoutEventoInput
  }

  export type eventoUncheckedCreateInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    carreraId?: string | null
    inscripciones?: inscripcionUncheckedCreateNestedManyWithoutEventoInput
  }

  export type eventoUpdateInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    carrera?: carreraUpdateOneWithoutEventosNestedInput
    inscripciones?: inscripcionUpdateManyWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    carreraId?: NullableStringFieldUpdateOperationsInput | string | null
    inscripciones?: inscripcionUncheckedUpdateManyWithoutEventoNestedInput
  }

  export type eventoCreateManyInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    carreraId?: string | null
  }

  export type eventoUpdateManyMutationInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type eventoUncheckedUpdateManyInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    carreraId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type inscripcionCreateInput = {
    id_ins?: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
    usuario: usuarioCreateNestedOneWithoutInscripcionesInput
    evento: eventoCreateNestedOneWithoutInscripcionesInput
  }

  export type inscripcionUncheckedCreateInput = {
    id_ins?: string
    id_usu: string
    id_eve: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
  }

  export type inscripcionUpdateInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
    usuario?: usuarioUpdateOneRequiredWithoutInscripcionesNestedInput
    evento?: eventoUpdateOneRequiredWithoutInscripcionesNestedInput
  }

  export type inscripcionUncheckedUpdateInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu?: StringFieldUpdateOperationsInput | string
    id_eve?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }

  export type inscripcionCreateManyInput = {
    id_ins?: string
    id_usu: string
    id_eve: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
  }

  export type inscripcionUpdateManyMutationInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }

  export type inscripcionUncheckedUpdateManyInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu?: StringFieldUpdateOperationsInput | string
    id_eve?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type Enumrol_usuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.rol_usuario | Enumrol_usuarioFieldRefInput<$PrismaModel>
    in?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumrol_usuarioFilter<$PrismaModel> | $Enums.rol_usuario
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type InscripcionListRelationFilter = {
    every?: inscripcionWhereInput
    some?: inscripcionWhereInput
    none?: inscripcionWhereInput
  }

  export type inscripcionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type usuarioCountOrderByAggregateInput = {
    id_usu?: SortOrder
    ced_usu?: SortOrder
    nom_usu?: SortOrder
    ape_usu?: SortOrder
    cor_usu?: SortOrder
    con_usu?: SortOrder
    cel_usu?: SortOrder
    rol_usu?: SortOrder
    fec_cre_usu?: SortOrder
  }

  export type usuarioMaxOrderByAggregateInput = {
    id_usu?: SortOrder
    ced_usu?: SortOrder
    nom_usu?: SortOrder
    ape_usu?: SortOrder
    cor_usu?: SortOrder
    con_usu?: SortOrder
    cel_usu?: SortOrder
    rol_usu?: SortOrder
    fec_cre_usu?: SortOrder
  }

  export type usuarioMinOrderByAggregateInput = {
    id_usu?: SortOrder
    ced_usu?: SortOrder
    nom_usu?: SortOrder
    ape_usu?: SortOrder
    cor_usu?: SortOrder
    con_usu?: SortOrder
    cel_usu?: SortOrder
    rol_usu?: SortOrder
    fec_cre_usu?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type Enumrol_usuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.rol_usuario | Enumrol_usuarioFieldRefInput<$PrismaModel>
    in?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumrol_usuarioWithAggregatesFilter<$PrismaModel> | $Enums.rol_usuario
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumrol_usuarioFilter<$PrismaModel>
    _max?: NestedEnumrol_usuarioFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EventoListRelationFilter = {
    every?: eventoWhereInput
    some?: eventoWhereInput
    none?: eventoWhereInput
  }

  export type eventoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type carreraCountOrderByAggregateInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
  }

  export type carreraMaxOrderByAggregateInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
  }

  export type carreraMinOrderByAggregateInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type Enumtipo_eventoFilter<$PrismaModel = never> = {
    equals?: $Enums.tipo_evento | Enumtipo_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumtipo_eventoFilter<$PrismaModel> | $Enums.tipo_evento
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type CarreraNullableScalarRelationFilter = {
    is?: carreraWhereInput | null
    isNot?: carreraWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type eventoCountOrderByAggregateInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    fec_fin_eve?: SortOrder
    dur_hrs_eve?: SortOrder
    pagado_eve?: SortOrder
    nota_min_eve?: SortOrder
    por_asist_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    carreraId?: SortOrder
  }

  export type eventoAvgOrderByAggregateInput = {
    dur_hrs_eve?: SortOrder
    nota_min_eve?: SortOrder
    por_asist_eve?: SortOrder
  }

  export type eventoMaxOrderByAggregateInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    fec_fin_eve?: SortOrder
    dur_hrs_eve?: SortOrder
    pagado_eve?: SortOrder
    nota_min_eve?: SortOrder
    por_asist_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    carreraId?: SortOrder
  }

  export type eventoMinOrderByAggregateInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    fec_fin_eve?: SortOrder
    dur_hrs_eve?: SortOrder
    pagado_eve?: SortOrder
    nota_min_eve?: SortOrder
    por_asist_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    carreraId?: SortOrder
  }

  export type eventoSumOrderByAggregateInput = {
    dur_hrs_eve?: SortOrder
    nota_min_eve?: SortOrder
    por_asist_eve?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type Enumtipo_eventoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.tipo_evento | Enumtipo_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumtipo_eventoWithAggregatesFilter<$PrismaModel> | $Enums.tipo_evento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumtipo_eventoFilter<$PrismaModel>
    _max?: NestedEnumtipo_eventoFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type Enumestado_inscripcionFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_inscripcion | Enumestado_inscripcionFieldRefInput<$PrismaModel>
    in?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_inscripcionFilter<$PrismaModel> | $Enums.estado_inscripcion
  }

  export type UsuarioScalarRelationFilter = {
    is?: usuarioWhereInput
    isNot?: usuarioWhereInput
  }

  export type EventoScalarRelationFilter = {
    is?: eventoWhereInput
    isNot?: eventoWhereInput
  }

  export type inscripcionId_usuId_eveCompoundUniqueInput = {
    id_usu: string
    id_eve: string
  }

  export type inscripcionCountOrderByAggregateInput = {
    id_ins?: SortOrder
    id_usu?: SortOrder
    id_eve?: SortOrder
    comprobante?: SortOrder
    nota_final?: SortOrder
    asistencia?: SortOrder
    estado?: SortOrder
    fec_ins?: SortOrder
    cert_enviado?: SortOrder
  }

  export type inscripcionAvgOrderByAggregateInput = {
    nota_final?: SortOrder
    asistencia?: SortOrder
  }

  export type inscripcionMaxOrderByAggregateInput = {
    id_ins?: SortOrder
    id_usu?: SortOrder
    id_eve?: SortOrder
    comprobante?: SortOrder
    nota_final?: SortOrder
    asistencia?: SortOrder
    estado?: SortOrder
    fec_ins?: SortOrder
    cert_enviado?: SortOrder
  }

  export type inscripcionMinOrderByAggregateInput = {
    id_ins?: SortOrder
    id_usu?: SortOrder
    id_eve?: SortOrder
    comprobante?: SortOrder
    nota_final?: SortOrder
    asistencia?: SortOrder
    estado?: SortOrder
    fec_ins?: SortOrder
    cert_enviado?: SortOrder
  }

  export type inscripcionSumOrderByAggregateInput = {
    nota_final?: SortOrder
    asistencia?: SortOrder
  }

  export type Enumestado_inscripcionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_inscripcion | Enumestado_inscripcionFieldRefInput<$PrismaModel>
    in?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_inscripcionWithAggregatesFilter<$PrismaModel> | $Enums.estado_inscripcion
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumestado_inscripcionFilter<$PrismaModel>
    _max?: NestedEnumestado_inscripcionFilter<$PrismaModel>
  }

  export type inscripcionCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput> | inscripcionCreateWithoutUsuarioInput[] | inscripcionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutUsuarioInput | inscripcionCreateOrConnectWithoutUsuarioInput[]
    createMany?: inscripcionCreateManyUsuarioInputEnvelope
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
  }

  export type inscripcionUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput> | inscripcionCreateWithoutUsuarioInput[] | inscripcionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutUsuarioInput | inscripcionCreateOrConnectWithoutUsuarioInput[]
    createMany?: inscripcionCreateManyUsuarioInputEnvelope
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type Enumrol_usuarioFieldUpdateOperationsInput = {
    set?: $Enums.rol_usuario
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type inscripcionUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput> | inscripcionCreateWithoutUsuarioInput[] | inscripcionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutUsuarioInput | inscripcionCreateOrConnectWithoutUsuarioInput[]
    upsert?: inscripcionUpsertWithWhereUniqueWithoutUsuarioInput | inscripcionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: inscripcionCreateManyUsuarioInputEnvelope
    set?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    disconnect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    delete?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    update?: inscripcionUpdateWithWhereUniqueWithoutUsuarioInput | inscripcionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: inscripcionUpdateManyWithWhereWithoutUsuarioInput | inscripcionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: inscripcionScalarWhereInput | inscripcionScalarWhereInput[]
  }

  export type inscripcionUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput> | inscripcionCreateWithoutUsuarioInput[] | inscripcionUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutUsuarioInput | inscripcionCreateOrConnectWithoutUsuarioInput[]
    upsert?: inscripcionUpsertWithWhereUniqueWithoutUsuarioInput | inscripcionUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: inscripcionCreateManyUsuarioInputEnvelope
    set?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    disconnect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    delete?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    update?: inscripcionUpdateWithWhereUniqueWithoutUsuarioInput | inscripcionUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: inscripcionUpdateManyWithWhereWithoutUsuarioInput | inscripcionUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: inscripcionScalarWhereInput | inscripcionScalarWhereInput[]
  }

  export type eventoCreateNestedManyWithoutCarreraInput = {
    create?: XOR<eventoCreateWithoutCarreraInput, eventoUncheckedCreateWithoutCarreraInput> | eventoCreateWithoutCarreraInput[] | eventoUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: eventoCreateOrConnectWithoutCarreraInput | eventoCreateOrConnectWithoutCarreraInput[]
    createMany?: eventoCreateManyCarreraInputEnvelope
    connect?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
  }

  export type eventoUncheckedCreateNestedManyWithoutCarreraInput = {
    create?: XOR<eventoCreateWithoutCarreraInput, eventoUncheckedCreateWithoutCarreraInput> | eventoCreateWithoutCarreraInput[] | eventoUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: eventoCreateOrConnectWithoutCarreraInput | eventoCreateOrConnectWithoutCarreraInput[]
    createMany?: eventoCreateManyCarreraInputEnvelope
    connect?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type eventoUpdateManyWithoutCarreraNestedInput = {
    create?: XOR<eventoCreateWithoutCarreraInput, eventoUncheckedCreateWithoutCarreraInput> | eventoCreateWithoutCarreraInput[] | eventoUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: eventoCreateOrConnectWithoutCarreraInput | eventoCreateOrConnectWithoutCarreraInput[]
    upsert?: eventoUpsertWithWhereUniqueWithoutCarreraInput | eventoUpsertWithWhereUniqueWithoutCarreraInput[]
    createMany?: eventoCreateManyCarreraInputEnvelope
    set?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    disconnect?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    delete?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    connect?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    update?: eventoUpdateWithWhereUniqueWithoutCarreraInput | eventoUpdateWithWhereUniqueWithoutCarreraInput[]
    updateMany?: eventoUpdateManyWithWhereWithoutCarreraInput | eventoUpdateManyWithWhereWithoutCarreraInput[]
    deleteMany?: eventoScalarWhereInput | eventoScalarWhereInput[]
  }

  export type eventoUncheckedUpdateManyWithoutCarreraNestedInput = {
    create?: XOR<eventoCreateWithoutCarreraInput, eventoUncheckedCreateWithoutCarreraInput> | eventoCreateWithoutCarreraInput[] | eventoUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: eventoCreateOrConnectWithoutCarreraInput | eventoCreateOrConnectWithoutCarreraInput[]
    upsert?: eventoUpsertWithWhereUniqueWithoutCarreraInput | eventoUpsertWithWhereUniqueWithoutCarreraInput[]
    createMany?: eventoCreateManyCarreraInputEnvelope
    set?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    disconnect?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    delete?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    connect?: eventoWhereUniqueInput | eventoWhereUniqueInput[]
    update?: eventoUpdateWithWhereUniqueWithoutCarreraInput | eventoUpdateWithWhereUniqueWithoutCarreraInput[]
    updateMany?: eventoUpdateManyWithWhereWithoutCarreraInput | eventoUpdateManyWithWhereWithoutCarreraInput[]
    deleteMany?: eventoScalarWhereInput | eventoScalarWhereInput[]
  }

  export type carreraCreateNestedOneWithoutEventosInput = {
    create?: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
    connectOrCreate?: carreraCreateOrConnectWithoutEventosInput
    connect?: carreraWhereUniqueInput
  }

  export type inscripcionCreateNestedManyWithoutEventoInput = {
    create?: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput> | inscripcionCreateWithoutEventoInput[] | inscripcionUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutEventoInput | inscripcionCreateOrConnectWithoutEventoInput[]
    createMany?: inscripcionCreateManyEventoInputEnvelope
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
  }

  export type inscripcionUncheckedCreateNestedManyWithoutEventoInput = {
    create?: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput> | inscripcionCreateWithoutEventoInput[] | inscripcionUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutEventoInput | inscripcionCreateOrConnectWithoutEventoInput[]
    createMany?: inscripcionCreateManyEventoInputEnvelope
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type Enumtipo_eventoFieldUpdateOperationsInput = {
    set?: $Enums.tipo_evento
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type carreraUpdateOneWithoutEventosNestedInput = {
    create?: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
    connectOrCreate?: carreraCreateOrConnectWithoutEventosInput
    upsert?: carreraUpsertWithoutEventosInput
    disconnect?: carreraWhereInput | boolean
    delete?: carreraWhereInput | boolean
    connect?: carreraWhereUniqueInput
    update?: XOR<XOR<carreraUpdateToOneWithWhereWithoutEventosInput, carreraUpdateWithoutEventosInput>, carreraUncheckedUpdateWithoutEventosInput>
  }

  export type inscripcionUpdateManyWithoutEventoNestedInput = {
    create?: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput> | inscripcionCreateWithoutEventoInput[] | inscripcionUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutEventoInput | inscripcionCreateOrConnectWithoutEventoInput[]
    upsert?: inscripcionUpsertWithWhereUniqueWithoutEventoInput | inscripcionUpsertWithWhereUniqueWithoutEventoInput[]
    createMany?: inscripcionCreateManyEventoInputEnvelope
    set?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    disconnect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    delete?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    update?: inscripcionUpdateWithWhereUniqueWithoutEventoInput | inscripcionUpdateWithWhereUniqueWithoutEventoInput[]
    updateMany?: inscripcionUpdateManyWithWhereWithoutEventoInput | inscripcionUpdateManyWithWhereWithoutEventoInput[]
    deleteMany?: inscripcionScalarWhereInput | inscripcionScalarWhereInput[]
  }

  export type inscripcionUncheckedUpdateManyWithoutEventoNestedInput = {
    create?: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput> | inscripcionCreateWithoutEventoInput[] | inscripcionUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutEventoInput | inscripcionCreateOrConnectWithoutEventoInput[]
    upsert?: inscripcionUpsertWithWhereUniqueWithoutEventoInput | inscripcionUpsertWithWhereUniqueWithoutEventoInput[]
    createMany?: inscripcionCreateManyEventoInputEnvelope
    set?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    disconnect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    delete?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
    update?: inscripcionUpdateWithWhereUniqueWithoutEventoInput | inscripcionUpdateWithWhereUniqueWithoutEventoInput[]
    updateMany?: inscripcionUpdateManyWithWhereWithoutEventoInput | inscripcionUpdateManyWithWhereWithoutEventoInput[]
    deleteMany?: inscripcionScalarWhereInput | inscripcionScalarWhereInput[]
  }

  export type usuarioCreateNestedOneWithoutInscripcionesInput = {
    create?: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
    connectOrCreate?: usuarioCreateOrConnectWithoutInscripcionesInput
    connect?: usuarioWhereUniqueInput
  }

  export type eventoCreateNestedOneWithoutInscripcionesInput = {
    create?: XOR<eventoCreateWithoutInscripcionesInput, eventoUncheckedCreateWithoutInscripcionesInput>
    connectOrCreate?: eventoCreateOrConnectWithoutInscripcionesInput
    connect?: eventoWhereUniqueInput
  }

  export type Enumestado_inscripcionFieldUpdateOperationsInput = {
    set?: $Enums.estado_inscripcion
  }

  export type usuarioUpdateOneRequiredWithoutInscripcionesNestedInput = {
    create?: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
    connectOrCreate?: usuarioCreateOrConnectWithoutInscripcionesInput
    upsert?: usuarioUpsertWithoutInscripcionesInput
    connect?: usuarioWhereUniqueInput
    update?: XOR<XOR<usuarioUpdateToOneWithWhereWithoutInscripcionesInput, usuarioUpdateWithoutInscripcionesInput>, usuarioUncheckedUpdateWithoutInscripcionesInput>
  }

  export type eventoUpdateOneRequiredWithoutInscripcionesNestedInput = {
    create?: XOR<eventoCreateWithoutInscripcionesInput, eventoUncheckedCreateWithoutInscripcionesInput>
    connectOrCreate?: eventoCreateOrConnectWithoutInscripcionesInput
    upsert?: eventoUpsertWithoutInscripcionesInput
    connect?: eventoWhereUniqueInput
    update?: XOR<XOR<eventoUpdateToOneWithWhereWithoutInscripcionesInput, eventoUpdateWithoutInscripcionesInput>, eventoUncheckedUpdateWithoutInscripcionesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumrol_usuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.rol_usuario | Enumrol_usuarioFieldRefInput<$PrismaModel>
    in?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumrol_usuarioFilter<$PrismaModel> | $Enums.rol_usuario
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumrol_usuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.rol_usuario | Enumrol_usuarioFieldRefInput<$PrismaModel>
    in?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.rol_usuario[] | ListEnumrol_usuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumrol_usuarioWithAggregatesFilter<$PrismaModel> | $Enums.rol_usuario
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumrol_usuarioFilter<$PrismaModel>
    _max?: NestedEnumrol_usuarioFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumtipo_eventoFilter<$PrismaModel = never> = {
    equals?: $Enums.tipo_evento | Enumtipo_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumtipo_eventoFilter<$PrismaModel> | $Enums.tipo_evento
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumtipo_eventoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.tipo_evento | Enumtipo_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumtipo_eventoWithAggregatesFilter<$PrismaModel> | $Enums.tipo_evento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumtipo_eventoFilter<$PrismaModel>
    _max?: NestedEnumtipo_eventoFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumestado_inscripcionFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_inscripcion | Enumestado_inscripcionFieldRefInput<$PrismaModel>
    in?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_inscripcionFilter<$PrismaModel> | $Enums.estado_inscripcion
  }

  export type NestedEnumestado_inscripcionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_inscripcion | Enumestado_inscripcionFieldRefInput<$PrismaModel>
    in?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_inscripcionWithAggregatesFilter<$PrismaModel> | $Enums.estado_inscripcion
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumestado_inscripcionFilter<$PrismaModel>
    _max?: NestedEnumestado_inscripcionFilter<$PrismaModel>
  }

  export type inscripcionCreateWithoutUsuarioInput = {
    id_ins?: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
    evento: eventoCreateNestedOneWithoutInscripcionesInput
  }

  export type inscripcionUncheckedCreateWithoutUsuarioInput = {
    id_ins?: string
    id_eve: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
  }

  export type inscripcionCreateOrConnectWithoutUsuarioInput = {
    where: inscripcionWhereUniqueInput
    create: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput>
  }

  export type inscripcionCreateManyUsuarioInputEnvelope = {
    data: inscripcionCreateManyUsuarioInput | inscripcionCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type inscripcionUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: inscripcionWhereUniqueInput
    update: XOR<inscripcionUpdateWithoutUsuarioInput, inscripcionUncheckedUpdateWithoutUsuarioInput>
    create: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput>
  }

  export type inscripcionUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: inscripcionWhereUniqueInput
    data: XOR<inscripcionUpdateWithoutUsuarioInput, inscripcionUncheckedUpdateWithoutUsuarioInput>
  }

  export type inscripcionUpdateManyWithWhereWithoutUsuarioInput = {
    where: inscripcionScalarWhereInput
    data: XOR<inscripcionUpdateManyMutationInput, inscripcionUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type inscripcionScalarWhereInput = {
    AND?: inscripcionScalarWhereInput | inscripcionScalarWhereInput[]
    OR?: inscripcionScalarWhereInput[]
    NOT?: inscripcionScalarWhereInput | inscripcionScalarWhereInput[]
    id_ins?: StringFilter<"inscripcion"> | string
    id_usu?: StringFilter<"inscripcion"> | string
    id_eve?: StringFilter<"inscripcion"> | string
    comprobante?: StringNullableFilter<"inscripcion"> | string | null
    nota_final?: FloatNullableFilter<"inscripcion"> | number | null
    asistencia?: FloatNullableFilter<"inscripcion"> | number | null
    estado?: Enumestado_inscripcionFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeFilter<"inscripcion"> | Date | string
    cert_enviado?: BoolFilter<"inscripcion"> | boolean
  }

  export type eventoCreateWithoutCarreraInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    inscripciones?: inscripcionCreateNestedManyWithoutEventoInput
  }

  export type eventoUncheckedCreateWithoutCarreraInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    inscripciones?: inscripcionUncheckedCreateNestedManyWithoutEventoInput
  }

  export type eventoCreateOrConnectWithoutCarreraInput = {
    where: eventoWhereUniqueInput
    create: XOR<eventoCreateWithoutCarreraInput, eventoUncheckedCreateWithoutCarreraInput>
  }

  export type eventoCreateManyCarreraInputEnvelope = {
    data: eventoCreateManyCarreraInput | eventoCreateManyCarreraInput[]
    skipDuplicates?: boolean
  }

  export type eventoUpsertWithWhereUniqueWithoutCarreraInput = {
    where: eventoWhereUniqueInput
    update: XOR<eventoUpdateWithoutCarreraInput, eventoUncheckedUpdateWithoutCarreraInput>
    create: XOR<eventoCreateWithoutCarreraInput, eventoUncheckedCreateWithoutCarreraInput>
  }

  export type eventoUpdateWithWhereUniqueWithoutCarreraInput = {
    where: eventoWhereUniqueInput
    data: XOR<eventoUpdateWithoutCarreraInput, eventoUncheckedUpdateWithoutCarreraInput>
  }

  export type eventoUpdateManyWithWhereWithoutCarreraInput = {
    where: eventoScalarWhereInput
    data: XOR<eventoUpdateManyMutationInput, eventoUncheckedUpdateManyWithoutCarreraInput>
  }

  export type eventoScalarWhereInput = {
    AND?: eventoScalarWhereInput | eventoScalarWhereInput[]
    OR?: eventoScalarWhereInput[]
    NOT?: eventoScalarWhereInput | eventoScalarWhereInput[]
    id_eve?: StringFilter<"evento"> | string
    nom_eve?: StringFilter<"evento"> | string
    des_eve?: StringNullableFilter<"evento"> | string | null
    tip_eve?: Enumtipo_eventoFilter<"evento"> | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFilter<"evento"> | Date | string
    fec_fin_eve?: DateTimeFilter<"evento"> | Date | string
    dur_hrs_eve?: IntFilter<"evento"> | number
    pagado_eve?: BoolFilter<"evento"> | boolean
    nota_min_eve?: FloatNullableFilter<"evento"> | number | null
    por_asist_eve?: FloatNullableFilter<"evento"> | number | null
    est_eve?: BoolFilter<"evento"> | boolean
    fec_cre_eve?: DateTimeFilter<"evento"> | Date | string
    carreraId?: StringNullableFilter<"evento"> | string | null
  }

  export type carreraCreateWithoutEventosInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
  }

  export type carreraUncheckedCreateWithoutEventosInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
  }

  export type carreraCreateOrConnectWithoutEventosInput = {
    where: carreraWhereUniqueInput
    create: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
  }

  export type inscripcionCreateWithoutEventoInput = {
    id_ins?: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
    usuario: usuarioCreateNestedOneWithoutInscripcionesInput
  }

  export type inscripcionUncheckedCreateWithoutEventoInput = {
    id_ins?: string
    id_usu: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
  }

  export type inscripcionCreateOrConnectWithoutEventoInput = {
    where: inscripcionWhereUniqueInput
    create: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput>
  }

  export type inscripcionCreateManyEventoInputEnvelope = {
    data: inscripcionCreateManyEventoInput | inscripcionCreateManyEventoInput[]
    skipDuplicates?: boolean
  }

  export type carreraUpsertWithoutEventosInput = {
    update: XOR<carreraUpdateWithoutEventosInput, carreraUncheckedUpdateWithoutEventosInput>
    create: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
    where?: carreraWhereInput
  }

  export type carreraUpdateToOneWithWhereWithoutEventosInput = {
    where?: carreraWhereInput
    data: XOR<carreraUpdateWithoutEventosInput, carreraUncheckedUpdateWithoutEventosInput>
  }

  export type carreraUpdateWithoutEventosInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type carreraUncheckedUpdateWithoutEventosInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type inscripcionUpsertWithWhereUniqueWithoutEventoInput = {
    where: inscripcionWhereUniqueInput
    update: XOR<inscripcionUpdateWithoutEventoInput, inscripcionUncheckedUpdateWithoutEventoInput>
    create: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput>
  }

  export type inscripcionUpdateWithWhereUniqueWithoutEventoInput = {
    where: inscripcionWhereUniqueInput
    data: XOR<inscripcionUpdateWithoutEventoInput, inscripcionUncheckedUpdateWithoutEventoInput>
  }

  export type inscripcionUpdateManyWithWhereWithoutEventoInput = {
    where: inscripcionScalarWhereInput
    data: XOR<inscripcionUpdateManyMutationInput, inscripcionUncheckedUpdateManyWithoutEventoInput>
  }

  export type usuarioCreateWithoutInscripcionesInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
  }

  export type usuarioUncheckedCreateWithoutInscripcionesInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
  }

  export type usuarioCreateOrConnectWithoutInscripcionesInput = {
    where: usuarioWhereUniqueInput
    create: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
  }

  export type eventoCreateWithoutInscripcionesInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    carrera?: carreraCreateNestedOneWithoutEventosInput
  }

  export type eventoUncheckedCreateWithoutInscripcionesInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
    carreraId?: string | null
  }

  export type eventoCreateOrConnectWithoutInscripcionesInput = {
    where: eventoWhereUniqueInput
    create: XOR<eventoCreateWithoutInscripcionesInput, eventoUncheckedCreateWithoutInscripcionesInput>
  }

  export type usuarioUpsertWithoutInscripcionesInput = {
    update: XOR<usuarioUpdateWithoutInscripcionesInput, usuarioUncheckedUpdateWithoutInscripcionesInput>
    create: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
    where?: usuarioWhereInput
  }

  export type usuarioUpdateToOneWithWhereWithoutInscripcionesInput = {
    where?: usuarioWhereInput
    data: XOR<usuarioUpdateWithoutInscripcionesInput, usuarioUncheckedUpdateWithoutInscripcionesInput>
  }

  export type usuarioUpdateWithoutInscripcionesInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usuarioUncheckedUpdateWithoutInscripcionesInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type eventoUpsertWithoutInscripcionesInput = {
    update: XOR<eventoUpdateWithoutInscripcionesInput, eventoUncheckedUpdateWithoutInscripcionesInput>
    create: XOR<eventoCreateWithoutInscripcionesInput, eventoUncheckedCreateWithoutInscripcionesInput>
    where?: eventoWhereInput
  }

  export type eventoUpdateToOneWithWhereWithoutInscripcionesInput = {
    where?: eventoWhereInput
    data: XOR<eventoUpdateWithoutInscripcionesInput, eventoUncheckedUpdateWithoutInscripcionesInput>
  }

  export type eventoUpdateWithoutInscripcionesInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    carrera?: carreraUpdateOneWithoutEventosNestedInput
  }

  export type eventoUncheckedUpdateWithoutInscripcionesInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    carreraId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type inscripcionCreateManyUsuarioInput = {
    id_ins?: string
    id_eve: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
  }

  export type inscripcionUpdateWithoutUsuarioInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
    evento?: eventoUpdateOneRequiredWithoutInscripcionesNestedInput
  }

  export type inscripcionUncheckedUpdateWithoutUsuarioInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_eve?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }

  export type inscripcionUncheckedUpdateManyWithoutUsuarioInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_eve?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }

  export type eventoCreateManyCarreraInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    fec_fin_eve: Date | string
    dur_hrs_eve: number
    pagado_eve?: boolean
    nota_min_eve?: number | null
    por_asist_eve?: number | null
    est_eve?: boolean
    fec_cre_eve?: Date | string
  }

  export type eventoUpdateWithoutCarreraInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscripciones?: inscripcionUpdateManyWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateWithoutCarreraInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscripciones?: inscripcionUncheckedUpdateManyWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateManyWithoutCarreraInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    dur_hrs_eve?: IntFieldUpdateOperationsInput | number
    pagado_eve?: BoolFieldUpdateOperationsInput | boolean
    nota_min_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asist_eve?: NullableFloatFieldUpdateOperationsInput | number | null
    est_eve?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type inscripcionCreateManyEventoInput = {
    id_ins?: string
    id_usu: string
    comprobante?: string | null
    nota_final?: number | null
    asistencia?: number | null
    estado?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    cert_enviado?: boolean
  }

  export type inscripcionUpdateWithoutEventoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
    usuario?: usuarioUpdateOneRequiredWithoutInscripcionesNestedInput
  }

  export type inscripcionUncheckedUpdateWithoutEventoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }

  export type inscripcionUncheckedUpdateManyWithoutEventoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu?: StringFieldUpdateOperationsInput | string
    comprobante?: NullableStringFieldUpdateOperationsInput | string | null
    nota_final?: NullableFloatFieldUpdateOperationsInput | number | null
    asistencia?: NullableFloatFieldUpdateOperationsInput | number | null
    estado?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    cert_enviado?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}