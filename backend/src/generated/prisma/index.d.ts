
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
 * Model evento_curso
 * 
 */
export type evento_curso = $Result.DefaultSelection<Prisma.$evento_cursoPayload>
/**
 * Model evento_carrera
 * 
 */
export type evento_carrera = $Result.DefaultSelection<Prisma.$evento_carreraPayload>
/**
 * Model inscripcion
 * 
 */
export type inscripcion = $Result.DefaultSelection<Prisma.$inscripcionPayload>
/**
 * Model inscripcion_curso
 * 
 */
export type inscripcion_curso = $Result.DefaultSelection<Prisma.$inscripcion_cursoPayload>
/**
 * Model facultad
 * 
 */
export type facultad = $Result.DefaultSelection<Prisma.$facultadPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const rol_usuario: {
  ADMIN: 'ADMIN',
  ESTUDIANTE: 'ESTUDIANTE',
  GENERAL: 'GENERAL'
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


export const estado_evento: {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
  SUSPENDIDO: 'SUSPENDIDO'
};

export type estado_evento = (typeof estado_evento)[keyof typeof estado_evento]

}

export type rol_usuario = $Enums.rol_usuario

export const rol_usuario: typeof $Enums.rol_usuario

export type tipo_evento = $Enums.tipo_evento

export const tipo_evento: typeof $Enums.tipo_evento

export type estado_inscripcion = $Enums.estado_inscripcion

export const estado_inscripcion: typeof $Enums.estado_inscripcion

export type estado_evento = $Enums.estado_evento

export const estado_evento: typeof $Enums.estado_evento

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
   * `prisma.evento_curso`: Exposes CRUD operations for the **evento_curso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Evento_cursos
    * const evento_cursos = await prisma.evento_curso.findMany()
    * ```
    */
  get evento_curso(): Prisma.evento_cursoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.evento_carrera`: Exposes CRUD operations for the **evento_carrera** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Evento_carreras
    * const evento_carreras = await prisma.evento_carrera.findMany()
    * ```
    */
  get evento_carrera(): Prisma.evento_carreraDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inscripcion`: Exposes CRUD operations for the **inscripcion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inscripcions
    * const inscripcions = await prisma.inscripcion.findMany()
    * ```
    */
  get inscripcion(): Prisma.inscripcionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inscripcion_curso`: Exposes CRUD operations for the **inscripcion_curso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Inscripcion_cursos
    * const inscripcion_cursos = await prisma.inscripcion_curso.findMany()
    * ```
    */
  get inscripcion_curso(): Prisma.inscripcion_cursoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.facultad`: Exposes CRUD operations for the **facultad** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Facultads
    * const facultads = await prisma.facultad.findMany()
    * ```
    */
  get facultad(): Prisma.facultadDelegate<ExtArgs, ClientOptions>;
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
    evento_curso: 'evento_curso',
    evento_carrera: 'evento_carrera',
    inscripcion: 'inscripcion',
    inscripcion_curso: 'inscripcion_curso',
    facultad: 'facultad'
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
      modelProps: "usuario" | "carrera" | "evento" | "evento_curso" | "evento_carrera" | "inscripcion" | "inscripcion_curso" | "facultad"
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
      evento_curso: {
        payload: Prisma.$evento_cursoPayload<ExtArgs>
        fields: Prisma.evento_cursoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.evento_cursoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.evento_cursoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>
          }
          findFirst: {
            args: Prisma.evento_cursoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.evento_cursoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>
          }
          findMany: {
            args: Prisma.evento_cursoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>[]
          }
          create: {
            args: Prisma.evento_cursoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>
          }
          createMany: {
            args: Prisma.evento_cursoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.evento_cursoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>[]
          }
          delete: {
            args: Prisma.evento_cursoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>
          }
          update: {
            args: Prisma.evento_cursoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>
          }
          deleteMany: {
            args: Prisma.evento_cursoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.evento_cursoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.evento_cursoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>[]
          }
          upsert: {
            args: Prisma.evento_cursoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_cursoPayload>
          }
          aggregate: {
            args: Prisma.Evento_cursoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvento_curso>
          }
          groupBy: {
            args: Prisma.evento_cursoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Evento_cursoGroupByOutputType>[]
          }
          count: {
            args: Prisma.evento_cursoCountArgs<ExtArgs>
            result: $Utils.Optional<Evento_cursoCountAggregateOutputType> | number
          }
        }
      }
      evento_carrera: {
        payload: Prisma.$evento_carreraPayload<ExtArgs>
        fields: Prisma.evento_carreraFieldRefs
        operations: {
          findUnique: {
            args: Prisma.evento_carreraFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.evento_carreraFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>
          }
          findFirst: {
            args: Prisma.evento_carreraFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.evento_carreraFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>
          }
          findMany: {
            args: Prisma.evento_carreraFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>[]
          }
          create: {
            args: Prisma.evento_carreraCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>
          }
          createMany: {
            args: Prisma.evento_carreraCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.evento_carreraCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>[]
          }
          delete: {
            args: Prisma.evento_carreraDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>
          }
          update: {
            args: Prisma.evento_carreraUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>
          }
          deleteMany: {
            args: Prisma.evento_carreraDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.evento_carreraUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.evento_carreraUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>[]
          }
          upsert: {
            args: Prisma.evento_carreraUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$evento_carreraPayload>
          }
          aggregate: {
            args: Prisma.Evento_carreraAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvento_carrera>
          }
          groupBy: {
            args: Prisma.evento_carreraGroupByArgs<ExtArgs>
            result: $Utils.Optional<Evento_carreraGroupByOutputType>[]
          }
          count: {
            args: Prisma.evento_carreraCountArgs<ExtArgs>
            result: $Utils.Optional<Evento_carreraCountAggregateOutputType> | number
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
      inscripcion_curso: {
        payload: Prisma.$inscripcion_cursoPayload<ExtArgs>
        fields: Prisma.inscripcion_cursoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.inscripcion_cursoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.inscripcion_cursoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>
          }
          findFirst: {
            args: Prisma.inscripcion_cursoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.inscripcion_cursoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>
          }
          findMany: {
            args: Prisma.inscripcion_cursoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>[]
          }
          create: {
            args: Prisma.inscripcion_cursoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>
          }
          createMany: {
            args: Prisma.inscripcion_cursoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.inscripcion_cursoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>[]
          }
          delete: {
            args: Prisma.inscripcion_cursoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>
          }
          update: {
            args: Prisma.inscripcion_cursoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>
          }
          deleteMany: {
            args: Prisma.inscripcion_cursoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.inscripcion_cursoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.inscripcion_cursoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>[]
          }
          upsert: {
            args: Prisma.inscripcion_cursoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$inscripcion_cursoPayload>
          }
          aggregate: {
            args: Prisma.Inscripcion_cursoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInscripcion_curso>
          }
          groupBy: {
            args: Prisma.inscripcion_cursoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Inscripcion_cursoGroupByOutputType>[]
          }
          count: {
            args: Prisma.inscripcion_cursoCountArgs<ExtArgs>
            result: $Utils.Optional<Inscripcion_cursoCountAggregateOutputType> | number
          }
        }
      }
      facultad: {
        payload: Prisma.$facultadPayload<ExtArgs>
        fields: Prisma.facultadFieldRefs
        operations: {
          findUnique: {
            args: Prisma.facultadFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.facultadFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>
          }
          findFirst: {
            args: Prisma.facultadFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.facultadFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>
          }
          findMany: {
            args: Prisma.facultadFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>[]
          }
          create: {
            args: Prisma.facultadCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>
          }
          createMany: {
            args: Prisma.facultadCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.facultadCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>[]
          }
          delete: {
            args: Prisma.facultadDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>
          }
          update: {
            args: Prisma.facultadUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>
          }
          deleteMany: {
            args: Prisma.facultadDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.facultadUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.facultadUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>[]
          }
          upsert: {
            args: Prisma.facultadUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$facultadPayload>
          }
          aggregate: {
            args: Prisma.FacultadAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFacultad>
          }
          groupBy: {
            args: Prisma.facultadGroupByArgs<ExtArgs>
            result: $Utils.Optional<FacultadGroupByOutputType>[]
          }
          count: {
            args: Prisma.facultadCountArgs<ExtArgs>
            result: $Utils.Optional<FacultadCountAggregateOutputType> | number
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
    evento_curso?: evento_cursoOmit
    evento_carrera?: evento_carreraOmit
    inscripcion?: inscripcionOmit
    inscripcion_curso?: inscripcion_cursoOmit
    facultad?: facultadOmit
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
    usuario: number
    eventos: number
  }

  export type CarreraCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | CarreraCountOutputTypeCountUsuarioArgs
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
  export type CarreraCountOutputTypeCountUsuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usuarioWhereInput
  }

  /**
   * CarreraCountOutputType without action
   */
  export type CarreraCountOutputTypeCountEventosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: evento_carreraWhereInput
  }


  /**
   * Count Type EventoCountOutputType
   */

  export type EventoCountOutputType = {
    inscritos: number
    eventos_carrera: number
  }

  export type EventoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscritos?: boolean | EventoCountOutputTypeCountInscritosArgs
    eventos_carrera?: boolean | EventoCountOutputTypeCountEventos_carreraArgs
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
  export type EventoCountOutputTypeCountInscritosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inscripcionWhereInput
  }

  /**
   * EventoCountOutputType without action
   */
  export type EventoCountOutputTypeCountEventos_carreraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: evento_carreraWhereInput
  }


  /**
   * Count Type FacultadCountOutputType
   */

  export type FacultadCountOutputType = {
    carreras: number
  }

  export type FacultadCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carreras?: boolean | FacultadCountOutputTypeCountCarrerasArgs
  }

  // Custom InputTypes
  /**
   * FacultadCountOutputType without action
   */
  export type FacultadCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FacultadCountOutputType
     */
    select?: FacultadCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * FacultadCountOutputType without action
   */
  export type FacultadCountOutputTypeCountCarrerasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: carreraWhereInput
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
    com_usu: string | null
    id_car_est: string | null
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
    com_usu: string | null
    id_car_est: string | null
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
    com_usu: number
    id_car_est: number
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
    com_usu?: true
    id_car_est?: true
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
    com_usu?: true
    id_car_est?: true
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
    com_usu?: true
    id_car_est?: true
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
    com_usu: string | null
    id_car_est: string | null
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
    com_usu?: boolean
    id_car_est?: boolean
    carrera?: boolean | usuario$carreraArgs<ExtArgs>
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
    com_usu?: boolean
    id_car_est?: boolean
    carrera?: boolean | usuario$carreraArgs<ExtArgs>
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
    com_usu?: boolean
    id_car_est?: boolean
    carrera?: boolean | usuario$carreraArgs<ExtArgs>
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
    com_usu?: boolean
    id_car_est?: boolean
  }

  export type usuarioOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_usu" | "ced_usu" | "nom_usu" | "ape_usu" | "cor_usu" | "con_usu" | "cel_usu" | "rol_usu" | "fec_cre_usu" | "com_usu" | "id_car_est", ExtArgs["result"]["usuario"]>
  export type usuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | usuario$carreraArgs<ExtArgs>
    inscripciones?: boolean | usuario$inscripcionesArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type usuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | usuario$carreraArgs<ExtArgs>
  }
  export type usuarioIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | usuario$carreraArgs<ExtArgs>
  }

  export type $usuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "usuario"
    objects: {
      carrera: Prisma.$carreraPayload<ExtArgs> | null
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
      com_usu: string | null
      id_car_est: string | null
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
    carrera<T extends usuario$carreraArgs<ExtArgs> = {}>(args?: Subset<T, usuario$carreraArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
    readonly com_usu: FieldRef<"usuario", 'String'>
    readonly id_car_est: FieldRef<"usuario", 'String'>
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioIncludeCreateManyAndReturn<ExtArgs> | null
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usuarioIncludeUpdateManyAndReturn<ExtArgs> | null
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
   * usuario.carrera
   */
  export type usuario$carreraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    id_fac_per: string | null
  }

  export type CarreraMaxAggregateOutputType = {
    id_car: string | null
    nom_car: string | null
    est_car: boolean | null
    fec_cre_car: Date | null
    id_fac_per: string | null
  }

  export type CarreraCountAggregateOutputType = {
    id_car: number
    nom_car: number
    est_car: number
    fec_cre_car: number
    id_fac_per: number
    _all: number
  }


  export type CarreraMinAggregateInputType = {
    id_car?: true
    nom_car?: true
    est_car?: true
    fec_cre_car?: true
    id_fac_per?: true
  }

  export type CarreraMaxAggregateInputType = {
    id_car?: true
    nom_car?: true
    est_car?: true
    fec_cre_car?: true
    id_fac_per?: true
  }

  export type CarreraCountAggregateInputType = {
    id_car?: true
    nom_car?: true
    est_car?: true
    fec_cre_car?: true
    id_fac_per?: true
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
    id_fac_per: string
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
    id_fac_per?: boolean
    facultad?: boolean | facultadDefaultArgs<ExtArgs>
    usuario?: boolean | carrera$usuarioArgs<ExtArgs>
    eventos?: boolean | carrera$eventosArgs<ExtArgs>
    _count?: boolean | CarreraCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carrera"]>

  export type carreraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
    id_fac_per?: boolean
    facultad?: boolean | facultadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carrera"]>

  export type carreraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
    id_fac_per?: boolean
    facultad?: boolean | facultadDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["carrera"]>

  export type carreraSelectScalar = {
    id_car?: boolean
    nom_car?: boolean
    est_car?: boolean
    fec_cre_car?: boolean
    id_fac_per?: boolean
  }

  export type carreraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_car" | "nom_car" | "est_car" | "fec_cre_car" | "id_fac_per", ExtArgs["result"]["carrera"]>
  export type carreraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    facultad?: boolean | facultadDefaultArgs<ExtArgs>
    usuario?: boolean | carrera$usuarioArgs<ExtArgs>
    eventos?: boolean | carrera$eventosArgs<ExtArgs>
    _count?: boolean | CarreraCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type carreraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    facultad?: boolean | facultadDefaultArgs<ExtArgs>
  }
  export type carreraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    facultad?: boolean | facultadDefaultArgs<ExtArgs>
  }

  export type $carreraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "carrera"
    objects: {
      facultad: Prisma.$facultadPayload<ExtArgs>
      usuario: Prisma.$usuarioPayload<ExtArgs>[]
      eventos: Prisma.$evento_carreraPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_car: string
      nom_car: string
      est_car: boolean
      fec_cre_car: Date
      id_fac_per: string
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
    facultad<T extends facultadDefaultArgs<ExtArgs> = {}>(args?: Subset<T, facultadDefaultArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    usuario<T extends carrera$usuarioArgs<ExtArgs> = {}>(args?: Subset<T, carrera$usuarioArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usuarioPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    eventos<T extends carrera$eventosArgs<ExtArgs> = {}>(args?: Subset<T, carrera$eventosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
    readonly id_fac_per: FieldRef<"carrera", 'String'>
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraIncludeCreateManyAndReturn<ExtArgs> | null
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
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: carreraIncludeUpdateManyAndReturn<ExtArgs> | null
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
   * carrera.usuario
   */
  export type carrera$usuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    where?: usuarioWhereInput
    orderBy?: usuarioOrderByWithRelationInput | usuarioOrderByWithRelationInput[]
    cursor?: usuarioWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * carrera.eventos
   */
  export type carrera$eventosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    where?: evento_carreraWhereInput
    orderBy?: evento_carreraOrderByWithRelationInput | evento_carreraOrderByWithRelationInput[]
    cursor?: evento_carreraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Evento_carreraScalarFieldEnum | Evento_carreraScalarFieldEnum[]
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
    val_eve: number | null
    dur_hor_eve: number | null
    por_min_asi_eve: number | null
  }

  export type EventoSumAggregateOutputType = {
    val_eve: number | null
    dur_hor_eve: number | null
    por_min_asi_eve: number | null
  }

  export type EventoMinAggregateOutputType = {
    id_eve: string | null
    nom_eve: string | null
    des_eve: string | null
    tip_eve: $Enums.tipo_evento | null
    fec_ini_eve: Date | null
    val_eve: number | null
    est_eve: $Enums.estado_evento | null
    fec_cre_eve: Date | null
    img_por_eve: string | null
    dur_hor_eve: number | null
    por_min_asi_eve: number | null
    fec_fin_eve: Date | null
  }

  export type EventoMaxAggregateOutputType = {
    id_eve: string | null
    nom_eve: string | null
    des_eve: string | null
    tip_eve: $Enums.tipo_evento | null
    fec_ini_eve: Date | null
    val_eve: number | null
    est_eve: $Enums.estado_evento | null
    fec_cre_eve: Date | null
    img_por_eve: string | null
    dur_hor_eve: number | null
    por_min_asi_eve: number | null
    fec_fin_eve: Date | null
  }

  export type EventoCountAggregateOutputType = {
    id_eve: number
    nom_eve: number
    des_eve: number
    tip_eve: number
    fec_ini_eve: number
    val_eve: number
    est_eve: number
    fec_cre_eve: number
    img_por_eve: number
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: number
    _all: number
  }


  export type EventoAvgAggregateInputType = {
    val_eve?: true
    dur_hor_eve?: true
    por_min_asi_eve?: true
  }

  export type EventoSumAggregateInputType = {
    val_eve?: true
    dur_hor_eve?: true
    por_min_asi_eve?: true
  }

  export type EventoMinAggregateInputType = {
    id_eve?: true
    nom_eve?: true
    des_eve?: true
    tip_eve?: true
    fec_ini_eve?: true
    val_eve?: true
    est_eve?: true
    fec_cre_eve?: true
    img_por_eve?: true
    dur_hor_eve?: true
    por_min_asi_eve?: true
    fec_fin_eve?: true
  }

  export type EventoMaxAggregateInputType = {
    id_eve?: true
    nom_eve?: true
    des_eve?: true
    tip_eve?: true
    fec_ini_eve?: true
    val_eve?: true
    est_eve?: true
    fec_cre_eve?: true
    img_por_eve?: true
    dur_hor_eve?: true
    por_min_asi_eve?: true
    fec_fin_eve?: true
  }

  export type EventoCountAggregateInputType = {
    id_eve?: true
    nom_eve?: true
    des_eve?: true
    tip_eve?: true
    fec_ini_eve?: true
    val_eve?: true
    est_eve?: true
    fec_cre_eve?: true
    img_por_eve?: true
    dur_hor_eve?: true
    por_min_asi_eve?: true
    fec_fin_eve?: true
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
    val_eve: number
    est_eve: $Enums.estado_evento
    fec_cre_eve: Date
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date
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
    val_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    img_por_eve?: boolean
    dur_hor_eve?: boolean
    por_min_asi_eve?: boolean
    fec_fin_eve?: boolean
    inscritos?: boolean | evento$inscritosArgs<ExtArgs>
    eventos_carrera?: boolean | evento$eventos_carreraArgs<ExtArgs>
    eventos_curso?: boolean | evento$eventos_cursoArgs<ExtArgs>
    _count?: boolean | EventoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento"]>

  export type eventoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    val_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    img_por_eve?: boolean
    dur_hor_eve?: boolean
    por_min_asi_eve?: boolean
    fec_fin_eve?: boolean
  }, ExtArgs["result"]["evento"]>

  export type eventoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    val_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    img_por_eve?: boolean
    dur_hor_eve?: boolean
    por_min_asi_eve?: boolean
    fec_fin_eve?: boolean
  }, ExtArgs["result"]["evento"]>

  export type eventoSelectScalar = {
    id_eve?: boolean
    nom_eve?: boolean
    des_eve?: boolean
    tip_eve?: boolean
    fec_ini_eve?: boolean
    val_eve?: boolean
    est_eve?: boolean
    fec_cre_eve?: boolean
    img_por_eve?: boolean
    dur_hor_eve?: boolean
    por_min_asi_eve?: boolean
    fec_fin_eve?: boolean
  }

  export type eventoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_eve" | "nom_eve" | "des_eve" | "tip_eve" | "fec_ini_eve" | "val_eve" | "est_eve" | "fec_cre_eve" | "img_por_eve" | "dur_hor_eve" | "por_min_asi_eve" | "fec_fin_eve", ExtArgs["result"]["evento"]>
  export type eventoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscritos?: boolean | evento$inscritosArgs<ExtArgs>
    eventos_carrera?: boolean | evento$eventos_carreraArgs<ExtArgs>
    eventos_curso?: boolean | evento$eventos_cursoArgs<ExtArgs>
    _count?: boolean | EventoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type eventoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type eventoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $eventoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "evento"
    objects: {
      inscritos: Prisma.$inscripcionPayload<ExtArgs>[]
      eventos_carrera: Prisma.$evento_carreraPayload<ExtArgs>[]
      eventos_curso: Prisma.$evento_cursoPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id_eve: string
      nom_eve: string
      des_eve: string | null
      tip_eve: $Enums.tipo_evento
      fec_ini_eve: Date
      val_eve: number
      est_eve: $Enums.estado_evento
      fec_cre_eve: Date
      img_por_eve: string
      dur_hor_eve: number
      por_min_asi_eve: number
      fec_fin_eve: Date
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
    inscritos<T extends evento$inscritosArgs<ExtArgs> = {}>(args?: Subset<T, evento$inscritosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    eventos_carrera<T extends evento$eventos_carreraArgs<ExtArgs> = {}>(args?: Subset<T, evento$eventos_carreraArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    eventos_curso<T extends evento$eventos_cursoArgs<ExtArgs> = {}>(args?: Subset<T, evento$eventos_cursoArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
    readonly val_eve: FieldRef<"evento", 'Float'>
    readonly est_eve: FieldRef<"evento", 'estado_evento'>
    readonly fec_cre_eve: FieldRef<"evento", 'DateTime'>
    readonly img_por_eve: FieldRef<"evento", 'String'>
    readonly dur_hor_eve: FieldRef<"evento", 'Int'>
    readonly por_min_asi_eve: FieldRef<"evento", 'Float'>
    readonly fec_fin_eve: FieldRef<"evento", 'DateTime'>
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
   * evento.inscritos
   */
  export type evento$inscritosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
   * evento.eventos_carrera
   */
  export type evento$eventos_carreraArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    where?: evento_carreraWhereInput
    orderBy?: evento_carreraOrderByWithRelationInput | evento_carreraOrderByWithRelationInput[]
    cursor?: evento_carreraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Evento_carreraScalarFieldEnum | Evento_carreraScalarFieldEnum[]
  }

  /**
   * evento.eventos_curso
   */
  export type evento$eventos_cursoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    where?: evento_cursoWhereInput
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
   * Model evento_curso
   */

  export type AggregateEvento_curso = {
    _count: Evento_cursoCountAggregateOutputType | null
    _avg: Evento_cursoAvgAggregateOutputType | null
    _sum: Evento_cursoSumAggregateOutputType | null
    _min: Evento_cursoMinAggregateOutputType | null
    _max: Evento_cursoMaxAggregateOutputType | null
  }

  export type Evento_cursoAvgAggregateOutputType = {
    not_min_cur: number | null
  }

  export type Evento_cursoSumAggregateOutputType = {
    not_min_cur: number | null
  }

  export type Evento_cursoMinAggregateOutputType = {
    id_eve_cur: string | null
    not_min_cur: number | null
  }

  export type Evento_cursoMaxAggregateOutputType = {
    id_eve_cur: string | null
    not_min_cur: number | null
  }

  export type Evento_cursoCountAggregateOutputType = {
    id_eve_cur: number
    not_min_cur: number
    _all: number
  }


  export type Evento_cursoAvgAggregateInputType = {
    not_min_cur?: true
  }

  export type Evento_cursoSumAggregateInputType = {
    not_min_cur?: true
  }

  export type Evento_cursoMinAggregateInputType = {
    id_eve_cur?: true
    not_min_cur?: true
  }

  export type Evento_cursoMaxAggregateInputType = {
    id_eve_cur?: true
    not_min_cur?: true
  }

  export type Evento_cursoCountAggregateInputType = {
    id_eve_cur?: true
    not_min_cur?: true
    _all?: true
  }

  export type Evento_cursoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which evento_curso to aggregate.
     */
    where?: evento_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_cursos to fetch.
     */
    orderBy?: evento_cursoOrderByWithRelationInput | evento_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: evento_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_cursos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned evento_cursos
    **/
    _count?: true | Evento_cursoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Evento_cursoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Evento_cursoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Evento_cursoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Evento_cursoMaxAggregateInputType
  }

  export type GetEvento_cursoAggregateType<T extends Evento_cursoAggregateArgs> = {
        [P in keyof T & keyof AggregateEvento_curso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvento_curso[P]>
      : GetScalarType<T[P], AggregateEvento_curso[P]>
  }




  export type evento_cursoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: evento_cursoWhereInput
    orderBy?: evento_cursoOrderByWithAggregationInput | evento_cursoOrderByWithAggregationInput[]
    by: Evento_cursoScalarFieldEnum[] | Evento_cursoScalarFieldEnum
    having?: evento_cursoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Evento_cursoCountAggregateInputType | true
    _avg?: Evento_cursoAvgAggregateInputType
    _sum?: Evento_cursoSumAggregateInputType
    _min?: Evento_cursoMinAggregateInputType
    _max?: Evento_cursoMaxAggregateInputType
  }

  export type Evento_cursoGroupByOutputType = {
    id_eve_cur: string
    not_min_cur: number
    _count: Evento_cursoCountAggregateOutputType | null
    _avg: Evento_cursoAvgAggregateOutputType | null
    _sum: Evento_cursoSumAggregateOutputType | null
    _min: Evento_cursoMinAggregateOutputType | null
    _max: Evento_cursoMaxAggregateOutputType | null
  }

  type GetEvento_cursoGroupByPayload<T extends evento_cursoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Evento_cursoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Evento_cursoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Evento_cursoGroupByOutputType[P]>
            : GetScalarType<T[P], Evento_cursoGroupByOutputType[P]>
        }
      >
    >


  export type evento_cursoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve_cur?: boolean
    not_min_cur?: boolean
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento_curso"]>

  export type evento_cursoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve_cur?: boolean
    not_min_cur?: boolean
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento_curso"]>

  export type evento_cursoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve_cur?: boolean
    not_min_cur?: boolean
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento_curso"]>

  export type evento_cursoSelectScalar = {
    id_eve_cur?: boolean
    not_min_cur?: boolean
  }

  export type evento_cursoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_eve_cur" | "not_min_cur", ExtArgs["result"]["evento_curso"]>
  export type evento_cursoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }
  export type evento_cursoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }
  export type evento_cursoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }

  export type $evento_cursoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "evento_curso"
    objects: {
      evento: Prisma.$eventoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_eve_cur: string
      not_min_cur: number
    }, ExtArgs["result"]["evento_curso"]>
    composites: {}
  }

  type evento_cursoGetPayload<S extends boolean | null | undefined | evento_cursoDefaultArgs> = $Result.GetResult<Prisma.$evento_cursoPayload, S>

  type evento_cursoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<evento_cursoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Evento_cursoCountAggregateInputType | true
    }

  export interface evento_cursoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['evento_curso'], meta: { name: 'evento_curso' } }
    /**
     * Find zero or one Evento_curso that matches the filter.
     * @param {evento_cursoFindUniqueArgs} args - Arguments to find a Evento_curso
     * @example
     * // Get one Evento_curso
     * const evento_curso = await prisma.evento_curso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends evento_cursoFindUniqueArgs>(args: SelectSubset<T, evento_cursoFindUniqueArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Evento_curso that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {evento_cursoFindUniqueOrThrowArgs} args - Arguments to find a Evento_curso
     * @example
     * // Get one Evento_curso
     * const evento_curso = await prisma.evento_curso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends evento_cursoFindUniqueOrThrowArgs>(args: SelectSubset<T, evento_cursoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evento_curso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_cursoFindFirstArgs} args - Arguments to find a Evento_curso
     * @example
     * // Get one Evento_curso
     * const evento_curso = await prisma.evento_curso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends evento_cursoFindFirstArgs>(args?: SelectSubset<T, evento_cursoFindFirstArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evento_curso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_cursoFindFirstOrThrowArgs} args - Arguments to find a Evento_curso
     * @example
     * // Get one Evento_curso
     * const evento_curso = await prisma.evento_curso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends evento_cursoFindFirstOrThrowArgs>(args?: SelectSubset<T, evento_cursoFindFirstOrThrowArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Evento_cursos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_cursoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Evento_cursos
     * const evento_cursos = await prisma.evento_curso.findMany()
     * 
     * // Get first 10 Evento_cursos
     * const evento_cursos = await prisma.evento_curso.findMany({ take: 10 })
     * 
     * // Only select the `id_eve_cur`
     * const evento_cursoWithId_eve_curOnly = await prisma.evento_curso.findMany({ select: { id_eve_cur: true } })
     * 
     */
    findMany<T extends evento_cursoFindManyArgs>(args?: SelectSubset<T, evento_cursoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Evento_curso.
     * @param {evento_cursoCreateArgs} args - Arguments to create a Evento_curso.
     * @example
     * // Create one Evento_curso
     * const Evento_curso = await prisma.evento_curso.create({
     *   data: {
     *     // ... data to create a Evento_curso
     *   }
     * })
     * 
     */
    create<T extends evento_cursoCreateArgs>(args: SelectSubset<T, evento_cursoCreateArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Evento_cursos.
     * @param {evento_cursoCreateManyArgs} args - Arguments to create many Evento_cursos.
     * @example
     * // Create many Evento_cursos
     * const evento_curso = await prisma.evento_curso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends evento_cursoCreateManyArgs>(args?: SelectSubset<T, evento_cursoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Evento_cursos and returns the data saved in the database.
     * @param {evento_cursoCreateManyAndReturnArgs} args - Arguments to create many Evento_cursos.
     * @example
     * // Create many Evento_cursos
     * const evento_curso = await prisma.evento_curso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Evento_cursos and only return the `id_eve_cur`
     * const evento_cursoWithId_eve_curOnly = await prisma.evento_curso.createManyAndReturn({
     *   select: { id_eve_cur: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends evento_cursoCreateManyAndReturnArgs>(args?: SelectSubset<T, evento_cursoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Evento_curso.
     * @param {evento_cursoDeleteArgs} args - Arguments to delete one Evento_curso.
     * @example
     * // Delete one Evento_curso
     * const Evento_curso = await prisma.evento_curso.delete({
     *   where: {
     *     // ... filter to delete one Evento_curso
     *   }
     * })
     * 
     */
    delete<T extends evento_cursoDeleteArgs>(args: SelectSubset<T, evento_cursoDeleteArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Evento_curso.
     * @param {evento_cursoUpdateArgs} args - Arguments to update one Evento_curso.
     * @example
     * // Update one Evento_curso
     * const evento_curso = await prisma.evento_curso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends evento_cursoUpdateArgs>(args: SelectSubset<T, evento_cursoUpdateArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Evento_cursos.
     * @param {evento_cursoDeleteManyArgs} args - Arguments to filter Evento_cursos to delete.
     * @example
     * // Delete a few Evento_cursos
     * const { count } = await prisma.evento_curso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends evento_cursoDeleteManyArgs>(args?: SelectSubset<T, evento_cursoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Evento_cursos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_cursoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Evento_cursos
     * const evento_curso = await prisma.evento_curso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends evento_cursoUpdateManyArgs>(args: SelectSubset<T, evento_cursoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Evento_cursos and returns the data updated in the database.
     * @param {evento_cursoUpdateManyAndReturnArgs} args - Arguments to update many Evento_cursos.
     * @example
     * // Update many Evento_cursos
     * const evento_curso = await prisma.evento_curso.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Evento_cursos and only return the `id_eve_cur`
     * const evento_cursoWithId_eve_curOnly = await prisma.evento_curso.updateManyAndReturn({
     *   select: { id_eve_cur: true },
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
    updateManyAndReturn<T extends evento_cursoUpdateManyAndReturnArgs>(args: SelectSubset<T, evento_cursoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Evento_curso.
     * @param {evento_cursoUpsertArgs} args - Arguments to update or create a Evento_curso.
     * @example
     * // Update or create a Evento_curso
     * const evento_curso = await prisma.evento_curso.upsert({
     *   create: {
     *     // ... data to create a Evento_curso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Evento_curso we want to update
     *   }
     * })
     */
    upsert<T extends evento_cursoUpsertArgs>(args: SelectSubset<T, evento_cursoUpsertArgs<ExtArgs>>): Prisma__evento_cursoClient<$Result.GetResult<Prisma.$evento_cursoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Evento_cursos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_cursoCountArgs} args - Arguments to filter Evento_cursos to count.
     * @example
     * // Count the number of Evento_cursos
     * const count = await prisma.evento_curso.count({
     *   where: {
     *     // ... the filter for the Evento_cursos we want to count
     *   }
     * })
    **/
    count<T extends evento_cursoCountArgs>(
      args?: Subset<T, evento_cursoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Evento_cursoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Evento_curso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Evento_cursoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Evento_cursoAggregateArgs>(args: Subset<T, Evento_cursoAggregateArgs>): Prisma.PrismaPromise<GetEvento_cursoAggregateType<T>>

    /**
     * Group by Evento_curso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_cursoGroupByArgs} args - Group by arguments.
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
      T extends evento_cursoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: evento_cursoGroupByArgs['orderBy'] }
        : { orderBy?: evento_cursoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, evento_cursoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvento_cursoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the evento_curso model
   */
  readonly fields: evento_cursoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for evento_curso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__evento_cursoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the evento_curso model
   */
  interface evento_cursoFieldRefs {
    readonly id_eve_cur: FieldRef<"evento_curso", 'String'>
    readonly not_min_cur: FieldRef<"evento_curso", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * evento_curso findUnique
   */
  export type evento_cursoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * Filter, which evento_curso to fetch.
     */
    where: evento_cursoWhereUniqueInput
  }

  /**
   * evento_curso findUniqueOrThrow
   */
  export type evento_cursoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * Filter, which evento_curso to fetch.
     */
    where: evento_cursoWhereUniqueInput
  }

  /**
   * evento_curso findFirst
   */
  export type evento_cursoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * Filter, which evento_curso to fetch.
     */
    where?: evento_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_cursos to fetch.
     */
    orderBy?: evento_cursoOrderByWithRelationInput | evento_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for evento_cursos.
     */
    cursor?: evento_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_cursos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of evento_cursos.
     */
    distinct?: Evento_cursoScalarFieldEnum | Evento_cursoScalarFieldEnum[]
  }

  /**
   * evento_curso findFirstOrThrow
   */
  export type evento_cursoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * Filter, which evento_curso to fetch.
     */
    where?: evento_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_cursos to fetch.
     */
    orderBy?: evento_cursoOrderByWithRelationInput | evento_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for evento_cursos.
     */
    cursor?: evento_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_cursos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of evento_cursos.
     */
    distinct?: Evento_cursoScalarFieldEnum | Evento_cursoScalarFieldEnum[]
  }

  /**
   * evento_curso findMany
   */
  export type evento_cursoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * Filter, which evento_cursos to fetch.
     */
    where?: evento_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_cursos to fetch.
     */
    orderBy?: evento_cursoOrderByWithRelationInput | evento_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing evento_cursos.
     */
    cursor?: evento_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_cursos.
     */
    skip?: number
    distinct?: Evento_cursoScalarFieldEnum | Evento_cursoScalarFieldEnum[]
  }

  /**
   * evento_curso create
   */
  export type evento_cursoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * The data needed to create a evento_curso.
     */
    data: XOR<evento_cursoCreateInput, evento_cursoUncheckedCreateInput>
  }

  /**
   * evento_curso createMany
   */
  export type evento_cursoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many evento_cursos.
     */
    data: evento_cursoCreateManyInput | evento_cursoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * evento_curso createManyAndReturn
   */
  export type evento_cursoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * The data used to create many evento_cursos.
     */
    data: evento_cursoCreateManyInput | evento_cursoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * evento_curso update
   */
  export type evento_cursoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * The data needed to update a evento_curso.
     */
    data: XOR<evento_cursoUpdateInput, evento_cursoUncheckedUpdateInput>
    /**
     * Choose, which evento_curso to update.
     */
    where: evento_cursoWhereUniqueInput
  }

  /**
   * evento_curso updateMany
   */
  export type evento_cursoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update evento_cursos.
     */
    data: XOR<evento_cursoUpdateManyMutationInput, evento_cursoUncheckedUpdateManyInput>
    /**
     * Filter which evento_cursos to update
     */
    where?: evento_cursoWhereInput
    /**
     * Limit how many evento_cursos to update.
     */
    limit?: number
  }

  /**
   * evento_curso updateManyAndReturn
   */
  export type evento_cursoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * The data used to update evento_cursos.
     */
    data: XOR<evento_cursoUpdateManyMutationInput, evento_cursoUncheckedUpdateManyInput>
    /**
     * Filter which evento_cursos to update
     */
    where?: evento_cursoWhereInput
    /**
     * Limit how many evento_cursos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * evento_curso upsert
   */
  export type evento_cursoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * The filter to search for the evento_curso to update in case it exists.
     */
    where: evento_cursoWhereUniqueInput
    /**
     * In case the evento_curso found by the `where` argument doesn't exist, create a new evento_curso with this data.
     */
    create: XOR<evento_cursoCreateInput, evento_cursoUncheckedCreateInput>
    /**
     * In case the evento_curso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<evento_cursoUpdateInput, evento_cursoUncheckedUpdateInput>
  }

  /**
   * evento_curso delete
   */
  export type evento_cursoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
    /**
     * Filter which evento_curso to delete.
     */
    where: evento_cursoWhereUniqueInput
  }

  /**
   * evento_curso deleteMany
   */
  export type evento_cursoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which evento_cursos to delete
     */
    where?: evento_cursoWhereInput
    /**
     * Limit how many evento_cursos to delete.
     */
    limit?: number
  }

  /**
   * evento_curso without action
   */
  export type evento_cursoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_curso
     */
    select?: evento_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_curso
     */
    omit?: evento_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_cursoInclude<ExtArgs> | null
  }


  /**
   * Model evento_carrera
   */

  export type AggregateEvento_carrera = {
    _count: Evento_carreraCountAggregateOutputType | null
    _min: Evento_carreraMinAggregateOutputType | null
    _max: Evento_carreraMaxAggregateOutputType | null
  }

  export type Evento_carreraMinAggregateOutputType = {
    id_eve_car: string | null
    id_car_aso: string | null
    id_eve_aso: string | null
    fec_aso: Date | null
  }

  export type Evento_carreraMaxAggregateOutputType = {
    id_eve_car: string | null
    id_car_aso: string | null
    id_eve_aso: string | null
    fec_aso: Date | null
  }

  export type Evento_carreraCountAggregateOutputType = {
    id_eve_car: number
    id_car_aso: number
    id_eve_aso: number
    fec_aso: number
    _all: number
  }


  export type Evento_carreraMinAggregateInputType = {
    id_eve_car?: true
    id_car_aso?: true
    id_eve_aso?: true
    fec_aso?: true
  }

  export type Evento_carreraMaxAggregateInputType = {
    id_eve_car?: true
    id_car_aso?: true
    id_eve_aso?: true
    fec_aso?: true
  }

  export type Evento_carreraCountAggregateInputType = {
    id_eve_car?: true
    id_car_aso?: true
    id_eve_aso?: true
    fec_aso?: true
    _all?: true
  }

  export type Evento_carreraAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which evento_carrera to aggregate.
     */
    where?: evento_carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_carreras to fetch.
     */
    orderBy?: evento_carreraOrderByWithRelationInput | evento_carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: evento_carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_carreras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned evento_carreras
    **/
    _count?: true | Evento_carreraCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Evento_carreraMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Evento_carreraMaxAggregateInputType
  }

  export type GetEvento_carreraAggregateType<T extends Evento_carreraAggregateArgs> = {
        [P in keyof T & keyof AggregateEvento_carrera]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvento_carrera[P]>
      : GetScalarType<T[P], AggregateEvento_carrera[P]>
  }




  export type evento_carreraGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: evento_carreraWhereInput
    orderBy?: evento_carreraOrderByWithAggregationInput | evento_carreraOrderByWithAggregationInput[]
    by: Evento_carreraScalarFieldEnum[] | Evento_carreraScalarFieldEnum
    having?: evento_carreraScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Evento_carreraCountAggregateInputType | true
    _min?: Evento_carreraMinAggregateInputType
    _max?: Evento_carreraMaxAggregateInputType
  }

  export type Evento_carreraGroupByOutputType = {
    id_eve_car: string
    id_car_aso: string
    id_eve_aso: string
    fec_aso: Date
    _count: Evento_carreraCountAggregateOutputType | null
    _min: Evento_carreraMinAggregateOutputType | null
    _max: Evento_carreraMaxAggregateOutputType | null
  }

  type GetEvento_carreraGroupByPayload<T extends evento_carreraGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Evento_carreraGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Evento_carreraGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Evento_carreraGroupByOutputType[P]>
            : GetScalarType<T[P], Evento_carreraGroupByOutputType[P]>
        }
      >
    >


  export type evento_carreraSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve_car?: boolean
    id_car_aso?: boolean
    id_eve_aso?: boolean
    fec_aso?: boolean
    carrera?: boolean | carreraDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento_carrera"]>

  export type evento_carreraSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve_car?: boolean
    id_car_aso?: boolean
    id_eve_aso?: boolean
    fec_aso?: boolean
    carrera?: boolean | carreraDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento_carrera"]>

  export type evento_carreraSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_eve_car?: boolean
    id_car_aso?: boolean
    id_eve_aso?: boolean
    fec_aso?: boolean
    carrera?: boolean | carreraDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["evento_carrera"]>

  export type evento_carreraSelectScalar = {
    id_eve_car?: boolean
    id_car_aso?: boolean
    id_eve_aso?: boolean
    fec_aso?: boolean
  }

  export type evento_carreraOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_eve_car" | "id_car_aso" | "id_eve_aso" | "fec_aso", ExtArgs["result"]["evento_carrera"]>
  export type evento_carreraInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | carreraDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }
  export type evento_carreraIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | carreraDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }
  export type evento_carreraIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carrera?: boolean | carreraDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }

  export type $evento_carreraPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "evento_carrera"
    objects: {
      carrera: Prisma.$carreraPayload<ExtArgs>
      evento: Prisma.$eventoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_eve_car: string
      id_car_aso: string
      id_eve_aso: string
      fec_aso: Date
    }, ExtArgs["result"]["evento_carrera"]>
    composites: {}
  }

  type evento_carreraGetPayload<S extends boolean | null | undefined | evento_carreraDefaultArgs> = $Result.GetResult<Prisma.$evento_carreraPayload, S>

  type evento_carreraCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<evento_carreraFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Evento_carreraCountAggregateInputType | true
    }

  export interface evento_carreraDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['evento_carrera'], meta: { name: 'evento_carrera' } }
    /**
     * Find zero or one Evento_carrera that matches the filter.
     * @param {evento_carreraFindUniqueArgs} args - Arguments to find a Evento_carrera
     * @example
     * // Get one Evento_carrera
     * const evento_carrera = await prisma.evento_carrera.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends evento_carreraFindUniqueArgs>(args: SelectSubset<T, evento_carreraFindUniqueArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Evento_carrera that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {evento_carreraFindUniqueOrThrowArgs} args - Arguments to find a Evento_carrera
     * @example
     * // Get one Evento_carrera
     * const evento_carrera = await prisma.evento_carrera.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends evento_carreraFindUniqueOrThrowArgs>(args: SelectSubset<T, evento_carreraFindUniqueOrThrowArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evento_carrera that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_carreraFindFirstArgs} args - Arguments to find a Evento_carrera
     * @example
     * // Get one Evento_carrera
     * const evento_carrera = await prisma.evento_carrera.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends evento_carreraFindFirstArgs>(args?: SelectSubset<T, evento_carreraFindFirstArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Evento_carrera that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_carreraFindFirstOrThrowArgs} args - Arguments to find a Evento_carrera
     * @example
     * // Get one Evento_carrera
     * const evento_carrera = await prisma.evento_carrera.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends evento_carreraFindFirstOrThrowArgs>(args?: SelectSubset<T, evento_carreraFindFirstOrThrowArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Evento_carreras that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_carreraFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Evento_carreras
     * const evento_carreras = await prisma.evento_carrera.findMany()
     * 
     * // Get first 10 Evento_carreras
     * const evento_carreras = await prisma.evento_carrera.findMany({ take: 10 })
     * 
     * // Only select the `id_eve_car`
     * const evento_carreraWithId_eve_carOnly = await prisma.evento_carrera.findMany({ select: { id_eve_car: true } })
     * 
     */
    findMany<T extends evento_carreraFindManyArgs>(args?: SelectSubset<T, evento_carreraFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Evento_carrera.
     * @param {evento_carreraCreateArgs} args - Arguments to create a Evento_carrera.
     * @example
     * // Create one Evento_carrera
     * const Evento_carrera = await prisma.evento_carrera.create({
     *   data: {
     *     // ... data to create a Evento_carrera
     *   }
     * })
     * 
     */
    create<T extends evento_carreraCreateArgs>(args: SelectSubset<T, evento_carreraCreateArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Evento_carreras.
     * @param {evento_carreraCreateManyArgs} args - Arguments to create many Evento_carreras.
     * @example
     * // Create many Evento_carreras
     * const evento_carrera = await prisma.evento_carrera.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends evento_carreraCreateManyArgs>(args?: SelectSubset<T, evento_carreraCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Evento_carreras and returns the data saved in the database.
     * @param {evento_carreraCreateManyAndReturnArgs} args - Arguments to create many Evento_carreras.
     * @example
     * // Create many Evento_carreras
     * const evento_carrera = await prisma.evento_carrera.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Evento_carreras and only return the `id_eve_car`
     * const evento_carreraWithId_eve_carOnly = await prisma.evento_carrera.createManyAndReturn({
     *   select: { id_eve_car: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends evento_carreraCreateManyAndReturnArgs>(args?: SelectSubset<T, evento_carreraCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Evento_carrera.
     * @param {evento_carreraDeleteArgs} args - Arguments to delete one Evento_carrera.
     * @example
     * // Delete one Evento_carrera
     * const Evento_carrera = await prisma.evento_carrera.delete({
     *   where: {
     *     // ... filter to delete one Evento_carrera
     *   }
     * })
     * 
     */
    delete<T extends evento_carreraDeleteArgs>(args: SelectSubset<T, evento_carreraDeleteArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Evento_carrera.
     * @param {evento_carreraUpdateArgs} args - Arguments to update one Evento_carrera.
     * @example
     * // Update one Evento_carrera
     * const evento_carrera = await prisma.evento_carrera.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends evento_carreraUpdateArgs>(args: SelectSubset<T, evento_carreraUpdateArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Evento_carreras.
     * @param {evento_carreraDeleteManyArgs} args - Arguments to filter Evento_carreras to delete.
     * @example
     * // Delete a few Evento_carreras
     * const { count } = await prisma.evento_carrera.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends evento_carreraDeleteManyArgs>(args?: SelectSubset<T, evento_carreraDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Evento_carreras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_carreraUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Evento_carreras
     * const evento_carrera = await prisma.evento_carrera.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends evento_carreraUpdateManyArgs>(args: SelectSubset<T, evento_carreraUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Evento_carreras and returns the data updated in the database.
     * @param {evento_carreraUpdateManyAndReturnArgs} args - Arguments to update many Evento_carreras.
     * @example
     * // Update many Evento_carreras
     * const evento_carrera = await prisma.evento_carrera.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Evento_carreras and only return the `id_eve_car`
     * const evento_carreraWithId_eve_carOnly = await prisma.evento_carrera.updateManyAndReturn({
     *   select: { id_eve_car: true },
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
    updateManyAndReturn<T extends evento_carreraUpdateManyAndReturnArgs>(args: SelectSubset<T, evento_carreraUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Evento_carrera.
     * @param {evento_carreraUpsertArgs} args - Arguments to update or create a Evento_carrera.
     * @example
     * // Update or create a Evento_carrera
     * const evento_carrera = await prisma.evento_carrera.upsert({
     *   create: {
     *     // ... data to create a Evento_carrera
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Evento_carrera we want to update
     *   }
     * })
     */
    upsert<T extends evento_carreraUpsertArgs>(args: SelectSubset<T, evento_carreraUpsertArgs<ExtArgs>>): Prisma__evento_carreraClient<$Result.GetResult<Prisma.$evento_carreraPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Evento_carreras.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_carreraCountArgs} args - Arguments to filter Evento_carreras to count.
     * @example
     * // Count the number of Evento_carreras
     * const count = await prisma.evento_carrera.count({
     *   where: {
     *     // ... the filter for the Evento_carreras we want to count
     *   }
     * })
    **/
    count<T extends evento_carreraCountArgs>(
      args?: Subset<T, evento_carreraCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Evento_carreraCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Evento_carrera.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Evento_carreraAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Evento_carreraAggregateArgs>(args: Subset<T, Evento_carreraAggregateArgs>): Prisma.PrismaPromise<GetEvento_carreraAggregateType<T>>

    /**
     * Group by Evento_carrera.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {evento_carreraGroupByArgs} args - Group by arguments.
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
      T extends evento_carreraGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: evento_carreraGroupByArgs['orderBy'] }
        : { orderBy?: evento_carreraGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, evento_carreraGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEvento_carreraGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the evento_carrera model
   */
  readonly fields: evento_carreraFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for evento_carrera.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__evento_carreraClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    carrera<T extends carreraDefaultArgs<ExtArgs> = {}>(args?: Subset<T, carreraDefaultArgs<ExtArgs>>): Prisma__carreraClient<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the evento_carrera model
   */
  interface evento_carreraFieldRefs {
    readonly id_eve_car: FieldRef<"evento_carrera", 'String'>
    readonly id_car_aso: FieldRef<"evento_carrera", 'String'>
    readonly id_eve_aso: FieldRef<"evento_carrera", 'String'>
    readonly fec_aso: FieldRef<"evento_carrera", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * evento_carrera findUnique
   */
  export type evento_carreraFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * Filter, which evento_carrera to fetch.
     */
    where: evento_carreraWhereUniqueInput
  }

  /**
   * evento_carrera findUniqueOrThrow
   */
  export type evento_carreraFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * Filter, which evento_carrera to fetch.
     */
    where: evento_carreraWhereUniqueInput
  }

  /**
   * evento_carrera findFirst
   */
  export type evento_carreraFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * Filter, which evento_carrera to fetch.
     */
    where?: evento_carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_carreras to fetch.
     */
    orderBy?: evento_carreraOrderByWithRelationInput | evento_carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for evento_carreras.
     */
    cursor?: evento_carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_carreras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of evento_carreras.
     */
    distinct?: Evento_carreraScalarFieldEnum | Evento_carreraScalarFieldEnum[]
  }

  /**
   * evento_carrera findFirstOrThrow
   */
  export type evento_carreraFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * Filter, which evento_carrera to fetch.
     */
    where?: evento_carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_carreras to fetch.
     */
    orderBy?: evento_carreraOrderByWithRelationInput | evento_carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for evento_carreras.
     */
    cursor?: evento_carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_carreras.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of evento_carreras.
     */
    distinct?: Evento_carreraScalarFieldEnum | Evento_carreraScalarFieldEnum[]
  }

  /**
   * evento_carrera findMany
   */
  export type evento_carreraFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * Filter, which evento_carreras to fetch.
     */
    where?: evento_carreraWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of evento_carreras to fetch.
     */
    orderBy?: evento_carreraOrderByWithRelationInput | evento_carreraOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing evento_carreras.
     */
    cursor?: evento_carreraWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` evento_carreras from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` evento_carreras.
     */
    skip?: number
    distinct?: Evento_carreraScalarFieldEnum | Evento_carreraScalarFieldEnum[]
  }

  /**
   * evento_carrera create
   */
  export type evento_carreraCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * The data needed to create a evento_carrera.
     */
    data: XOR<evento_carreraCreateInput, evento_carreraUncheckedCreateInput>
  }

  /**
   * evento_carrera createMany
   */
  export type evento_carreraCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many evento_carreras.
     */
    data: evento_carreraCreateManyInput | evento_carreraCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * evento_carrera createManyAndReturn
   */
  export type evento_carreraCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * The data used to create many evento_carreras.
     */
    data: evento_carreraCreateManyInput | evento_carreraCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * evento_carrera update
   */
  export type evento_carreraUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * The data needed to update a evento_carrera.
     */
    data: XOR<evento_carreraUpdateInput, evento_carreraUncheckedUpdateInput>
    /**
     * Choose, which evento_carrera to update.
     */
    where: evento_carreraWhereUniqueInput
  }

  /**
   * evento_carrera updateMany
   */
  export type evento_carreraUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update evento_carreras.
     */
    data: XOR<evento_carreraUpdateManyMutationInput, evento_carreraUncheckedUpdateManyInput>
    /**
     * Filter which evento_carreras to update
     */
    where?: evento_carreraWhereInput
    /**
     * Limit how many evento_carreras to update.
     */
    limit?: number
  }

  /**
   * evento_carrera updateManyAndReturn
   */
  export type evento_carreraUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * The data used to update evento_carreras.
     */
    data: XOR<evento_carreraUpdateManyMutationInput, evento_carreraUncheckedUpdateManyInput>
    /**
     * Filter which evento_carreras to update
     */
    where?: evento_carreraWhereInput
    /**
     * Limit how many evento_carreras to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * evento_carrera upsert
   */
  export type evento_carreraUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * The filter to search for the evento_carrera to update in case it exists.
     */
    where: evento_carreraWhereUniqueInput
    /**
     * In case the evento_carrera found by the `where` argument doesn't exist, create a new evento_carrera with this data.
     */
    create: XOR<evento_carreraCreateInput, evento_carreraUncheckedCreateInput>
    /**
     * In case the evento_carrera was found with the provided `where` argument, update it with this data.
     */
    update: XOR<evento_carreraUpdateInput, evento_carreraUncheckedUpdateInput>
  }

  /**
   * evento_carrera delete
   */
  export type evento_carreraDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
    /**
     * Filter which evento_carrera to delete.
     */
    where: evento_carreraWhereUniqueInput
  }

  /**
   * evento_carrera deleteMany
   */
  export type evento_carreraDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which evento_carreras to delete
     */
    where?: evento_carreraWhereInput
    /**
     * Limit how many evento_carreras to delete.
     */
    limit?: number
  }

  /**
   * evento_carrera without action
   */
  export type evento_carreraDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the evento_carrera
     */
    select?: evento_carreraSelect<ExtArgs> | null
    /**
     * Omit specific fields from the evento_carrera
     */
    omit?: evento_carreraOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: evento_carreraInclude<ExtArgs> | null
  }


  /**
   * Model inscripcion
   */

  export type AggregateInscripcion = {
    _count: InscripcionCountAggregateOutputType | null
    _min: InscripcionMinAggregateOutputType | null
    _max: InscripcionMaxAggregateOutputType | null
  }

  export type InscripcionMinAggregateOutputType = {
    id_ins: string | null
    id_usu_ins: string | null
    id_eve_ins: string | null
    est_ins: $Enums.estado_inscripcion | null
    fec_ins: Date | null
    fec_pag_ins: Date | null
    cer_eve_env: boolean | null
    car_mot_usu: string | null
  }

  export type InscripcionMaxAggregateOutputType = {
    id_ins: string | null
    id_usu_ins: string | null
    id_eve_ins: string | null
    est_ins: $Enums.estado_inscripcion | null
    fec_ins: Date | null
    fec_pag_ins: Date | null
    cer_eve_env: boolean | null
    car_mot_usu: string | null
  }

  export type InscripcionCountAggregateOutputType = {
    id_ins: number
    id_usu_ins: number
    id_eve_ins: number
    est_ins: number
    fec_ins: number
    fec_pag_ins: number
    cer_eve_env: number
    car_mot_usu: number
    _all: number
  }


  export type InscripcionMinAggregateInputType = {
    id_ins?: true
    id_usu_ins?: true
    id_eve_ins?: true
    est_ins?: true
    fec_ins?: true
    fec_pag_ins?: true
    cer_eve_env?: true
    car_mot_usu?: true
  }

  export type InscripcionMaxAggregateInputType = {
    id_ins?: true
    id_usu_ins?: true
    id_eve_ins?: true
    est_ins?: true
    fec_ins?: true
    fec_pag_ins?: true
    cer_eve_env?: true
    car_mot_usu?: true
  }

  export type InscripcionCountAggregateInputType = {
    id_ins?: true
    id_usu_ins?: true
    id_eve_ins?: true
    est_ins?: true
    fec_ins?: true
    fec_pag_ins?: true
    cer_eve_env?: true
    car_mot_usu?: true
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
    _min?: InscripcionMinAggregateInputType
    _max?: InscripcionMaxAggregateInputType
  }

  export type InscripcionGroupByOutputType = {
    id_ins: string
    id_usu_ins: string
    id_eve_ins: string
    est_ins: $Enums.estado_inscripcion
    fec_ins: Date
    fec_pag_ins: Date | null
    cer_eve_env: boolean
    car_mot_usu: string | null
    _count: InscripcionCountAggregateOutputType | null
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
    id_usu_ins?: boolean
    id_eve_ins?: boolean
    est_ins?: boolean
    fec_ins?: boolean
    fec_pag_ins?: boolean
    cer_eve_env?: boolean
    car_mot_usu?: boolean
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
    inscripcion_curso?: boolean | inscripcion$inscripcion_cursoArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion"]>

  export type inscripcionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins?: boolean
    id_usu_ins?: boolean
    id_eve_ins?: boolean
    est_ins?: boolean
    fec_ins?: boolean
    fec_pag_ins?: boolean
    cer_eve_env?: boolean
    car_mot_usu?: boolean
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion"]>

  export type inscripcionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins?: boolean
    id_usu_ins?: boolean
    id_eve_ins?: boolean
    est_ins?: boolean
    fec_ins?: boolean
    fec_pag_ins?: boolean
    cer_eve_env?: boolean
    car_mot_usu?: boolean
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion"]>

  export type inscripcionSelectScalar = {
    id_ins?: boolean
    id_usu_ins?: boolean
    id_eve_ins?: boolean
    est_ins?: boolean
    fec_ins?: boolean
    fec_pag_ins?: boolean
    cer_eve_env?: boolean
    car_mot_usu?: boolean
  }

  export type inscripcionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_ins" | "id_usu_ins" | "id_eve_ins" | "est_ins" | "fec_ins" | "fec_pag_ins" | "cer_eve_env" | "car_mot_usu", ExtArgs["result"]["inscripcion"]>
  export type inscripcionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | usuarioDefaultArgs<ExtArgs>
    evento?: boolean | eventoDefaultArgs<ExtArgs>
    inscripcion_curso?: boolean | inscripcion$inscripcion_cursoArgs<ExtArgs>
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
      inscripcion_curso: Prisma.$inscripcion_cursoPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id_ins: string
      id_usu_ins: string
      id_eve_ins: string
      est_ins: $Enums.estado_inscripcion
      fec_ins: Date
      fec_pag_ins: Date | null
      cer_eve_env: boolean
      car_mot_usu: string | null
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
    inscripcion_curso<T extends inscripcion$inscripcion_cursoArgs<ExtArgs> = {}>(args?: Subset<T, inscripcion$inscripcion_cursoArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
    readonly id_usu_ins: FieldRef<"inscripcion", 'String'>
    readonly id_eve_ins: FieldRef<"inscripcion", 'String'>
    readonly est_ins: FieldRef<"inscripcion", 'estado_inscripcion'>
    readonly fec_ins: FieldRef<"inscripcion", 'DateTime'>
    readonly fec_pag_ins: FieldRef<"inscripcion", 'DateTime'>
    readonly cer_eve_env: FieldRef<"inscripcion", 'Boolean'>
    readonly car_mot_usu: FieldRef<"inscripcion", 'String'>
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
   * inscripcion.inscripcion_curso
   */
  export type inscripcion$inscripcion_cursoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    where?: inscripcion_cursoWhereInput
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
   * Model inscripcion_curso
   */

  export type AggregateInscripcion_curso = {
    _count: Inscripcion_cursoCountAggregateOutputType | null
    _avg: Inscripcion_cursoAvgAggregateOutputType | null
    _sum: Inscripcion_cursoSumAggregateOutputType | null
    _min: Inscripcion_cursoMinAggregateOutputType | null
    _max: Inscripcion_cursoMaxAggregateOutputType | null
  }

  export type Inscripcion_cursoAvgAggregateOutputType = {
    not_fin_usu: number | null
    por_asi_fin_usu: number | null
  }

  export type Inscripcion_cursoSumAggregateOutputType = {
    not_fin_usu: number | null
    por_asi_fin_usu: number | null
  }

  export type Inscripcion_cursoMinAggregateOutputType = {
    id_ins_cur: string | null
    not_fin_usu: number | null
    por_asi_fin_usu: number | null
  }

  export type Inscripcion_cursoMaxAggregateOutputType = {
    id_ins_cur: string | null
    not_fin_usu: number | null
    por_asi_fin_usu: number | null
  }

  export type Inscripcion_cursoCountAggregateOutputType = {
    id_ins_cur: number
    not_fin_usu: number
    por_asi_fin_usu: number
    _all: number
  }


  export type Inscripcion_cursoAvgAggregateInputType = {
    not_fin_usu?: true
    por_asi_fin_usu?: true
  }

  export type Inscripcion_cursoSumAggregateInputType = {
    not_fin_usu?: true
    por_asi_fin_usu?: true
  }

  export type Inscripcion_cursoMinAggregateInputType = {
    id_ins_cur?: true
    not_fin_usu?: true
    por_asi_fin_usu?: true
  }

  export type Inscripcion_cursoMaxAggregateInputType = {
    id_ins_cur?: true
    not_fin_usu?: true
    por_asi_fin_usu?: true
  }

  export type Inscripcion_cursoCountAggregateInputType = {
    id_ins_cur?: true
    not_fin_usu?: true
    por_asi_fin_usu?: true
    _all?: true
  }

  export type Inscripcion_cursoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inscripcion_curso to aggregate.
     */
    where?: inscripcion_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcion_cursos to fetch.
     */
    orderBy?: inscripcion_cursoOrderByWithRelationInput | inscripcion_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: inscripcion_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcion_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcion_cursos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned inscripcion_cursos
    **/
    _count?: true | Inscripcion_cursoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Inscripcion_cursoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Inscripcion_cursoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Inscripcion_cursoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Inscripcion_cursoMaxAggregateInputType
  }

  export type GetInscripcion_cursoAggregateType<T extends Inscripcion_cursoAggregateArgs> = {
        [P in keyof T & keyof AggregateInscripcion_curso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInscripcion_curso[P]>
      : GetScalarType<T[P], AggregateInscripcion_curso[P]>
  }




  export type inscripcion_cursoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: inscripcion_cursoWhereInput
    orderBy?: inscripcion_cursoOrderByWithAggregationInput | inscripcion_cursoOrderByWithAggregationInput[]
    by: Inscripcion_cursoScalarFieldEnum[] | Inscripcion_cursoScalarFieldEnum
    having?: inscripcion_cursoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Inscripcion_cursoCountAggregateInputType | true
    _avg?: Inscripcion_cursoAvgAggregateInputType
    _sum?: Inscripcion_cursoSumAggregateInputType
    _min?: Inscripcion_cursoMinAggregateInputType
    _max?: Inscripcion_cursoMaxAggregateInputType
  }

  export type Inscripcion_cursoGroupByOutputType = {
    id_ins_cur: string
    not_fin_usu: number | null
    por_asi_fin_usu: number | null
    _count: Inscripcion_cursoCountAggregateOutputType | null
    _avg: Inscripcion_cursoAvgAggregateOutputType | null
    _sum: Inscripcion_cursoSumAggregateOutputType | null
    _min: Inscripcion_cursoMinAggregateOutputType | null
    _max: Inscripcion_cursoMaxAggregateOutputType | null
  }

  type GetInscripcion_cursoGroupByPayload<T extends inscripcion_cursoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Inscripcion_cursoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Inscripcion_cursoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Inscripcion_cursoGroupByOutputType[P]>
            : GetScalarType<T[P], Inscripcion_cursoGroupByOutputType[P]>
        }
      >
    >


  export type inscripcion_cursoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins_cur?: boolean
    not_fin_usu?: boolean
    por_asi_fin_usu?: boolean
    inscripcion?: boolean | inscripcionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion_curso"]>

  export type inscripcion_cursoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins_cur?: boolean
    not_fin_usu?: boolean
    por_asi_fin_usu?: boolean
    inscripcion?: boolean | inscripcionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion_curso"]>

  export type inscripcion_cursoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_ins_cur?: boolean
    not_fin_usu?: boolean
    por_asi_fin_usu?: boolean
    inscripcion?: boolean | inscripcionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inscripcion_curso"]>

  export type inscripcion_cursoSelectScalar = {
    id_ins_cur?: boolean
    not_fin_usu?: boolean
    por_asi_fin_usu?: boolean
  }

  export type inscripcion_cursoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_ins_cur" | "not_fin_usu" | "por_asi_fin_usu", ExtArgs["result"]["inscripcion_curso"]>
  export type inscripcion_cursoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscripcion?: boolean | inscripcionDefaultArgs<ExtArgs>
  }
  export type inscripcion_cursoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscripcion?: boolean | inscripcionDefaultArgs<ExtArgs>
  }
  export type inscripcion_cursoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inscripcion?: boolean | inscripcionDefaultArgs<ExtArgs>
  }

  export type $inscripcion_cursoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "inscripcion_curso"
    objects: {
      inscripcion: Prisma.$inscripcionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id_ins_cur: string
      not_fin_usu: number | null
      por_asi_fin_usu: number | null
    }, ExtArgs["result"]["inscripcion_curso"]>
    composites: {}
  }

  type inscripcion_cursoGetPayload<S extends boolean | null | undefined | inscripcion_cursoDefaultArgs> = $Result.GetResult<Prisma.$inscripcion_cursoPayload, S>

  type inscripcion_cursoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<inscripcion_cursoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Inscripcion_cursoCountAggregateInputType | true
    }

  export interface inscripcion_cursoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['inscripcion_curso'], meta: { name: 'inscripcion_curso' } }
    /**
     * Find zero or one Inscripcion_curso that matches the filter.
     * @param {inscripcion_cursoFindUniqueArgs} args - Arguments to find a Inscripcion_curso
     * @example
     * // Get one Inscripcion_curso
     * const inscripcion_curso = await prisma.inscripcion_curso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends inscripcion_cursoFindUniqueArgs>(args: SelectSubset<T, inscripcion_cursoFindUniqueArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Inscripcion_curso that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {inscripcion_cursoFindUniqueOrThrowArgs} args - Arguments to find a Inscripcion_curso
     * @example
     * // Get one Inscripcion_curso
     * const inscripcion_curso = await prisma.inscripcion_curso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends inscripcion_cursoFindUniqueOrThrowArgs>(args: SelectSubset<T, inscripcion_cursoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inscripcion_curso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcion_cursoFindFirstArgs} args - Arguments to find a Inscripcion_curso
     * @example
     * // Get one Inscripcion_curso
     * const inscripcion_curso = await prisma.inscripcion_curso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends inscripcion_cursoFindFirstArgs>(args?: SelectSubset<T, inscripcion_cursoFindFirstArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Inscripcion_curso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcion_cursoFindFirstOrThrowArgs} args - Arguments to find a Inscripcion_curso
     * @example
     * // Get one Inscripcion_curso
     * const inscripcion_curso = await prisma.inscripcion_curso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends inscripcion_cursoFindFirstOrThrowArgs>(args?: SelectSubset<T, inscripcion_cursoFindFirstOrThrowArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Inscripcion_cursos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcion_cursoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Inscripcion_cursos
     * const inscripcion_cursos = await prisma.inscripcion_curso.findMany()
     * 
     * // Get first 10 Inscripcion_cursos
     * const inscripcion_cursos = await prisma.inscripcion_curso.findMany({ take: 10 })
     * 
     * // Only select the `id_ins_cur`
     * const inscripcion_cursoWithId_ins_curOnly = await prisma.inscripcion_curso.findMany({ select: { id_ins_cur: true } })
     * 
     */
    findMany<T extends inscripcion_cursoFindManyArgs>(args?: SelectSubset<T, inscripcion_cursoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Inscripcion_curso.
     * @param {inscripcion_cursoCreateArgs} args - Arguments to create a Inscripcion_curso.
     * @example
     * // Create one Inscripcion_curso
     * const Inscripcion_curso = await prisma.inscripcion_curso.create({
     *   data: {
     *     // ... data to create a Inscripcion_curso
     *   }
     * })
     * 
     */
    create<T extends inscripcion_cursoCreateArgs>(args: SelectSubset<T, inscripcion_cursoCreateArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Inscripcion_cursos.
     * @param {inscripcion_cursoCreateManyArgs} args - Arguments to create many Inscripcion_cursos.
     * @example
     * // Create many Inscripcion_cursos
     * const inscripcion_curso = await prisma.inscripcion_curso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends inscripcion_cursoCreateManyArgs>(args?: SelectSubset<T, inscripcion_cursoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Inscripcion_cursos and returns the data saved in the database.
     * @param {inscripcion_cursoCreateManyAndReturnArgs} args - Arguments to create many Inscripcion_cursos.
     * @example
     * // Create many Inscripcion_cursos
     * const inscripcion_curso = await prisma.inscripcion_curso.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Inscripcion_cursos and only return the `id_ins_cur`
     * const inscripcion_cursoWithId_ins_curOnly = await prisma.inscripcion_curso.createManyAndReturn({
     *   select: { id_ins_cur: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends inscripcion_cursoCreateManyAndReturnArgs>(args?: SelectSubset<T, inscripcion_cursoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Inscripcion_curso.
     * @param {inscripcion_cursoDeleteArgs} args - Arguments to delete one Inscripcion_curso.
     * @example
     * // Delete one Inscripcion_curso
     * const Inscripcion_curso = await prisma.inscripcion_curso.delete({
     *   where: {
     *     // ... filter to delete one Inscripcion_curso
     *   }
     * })
     * 
     */
    delete<T extends inscripcion_cursoDeleteArgs>(args: SelectSubset<T, inscripcion_cursoDeleteArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Inscripcion_curso.
     * @param {inscripcion_cursoUpdateArgs} args - Arguments to update one Inscripcion_curso.
     * @example
     * // Update one Inscripcion_curso
     * const inscripcion_curso = await prisma.inscripcion_curso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends inscripcion_cursoUpdateArgs>(args: SelectSubset<T, inscripcion_cursoUpdateArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Inscripcion_cursos.
     * @param {inscripcion_cursoDeleteManyArgs} args - Arguments to filter Inscripcion_cursos to delete.
     * @example
     * // Delete a few Inscripcion_cursos
     * const { count } = await prisma.inscripcion_curso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends inscripcion_cursoDeleteManyArgs>(args?: SelectSubset<T, inscripcion_cursoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inscripcion_cursos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcion_cursoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Inscripcion_cursos
     * const inscripcion_curso = await prisma.inscripcion_curso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends inscripcion_cursoUpdateManyArgs>(args: SelectSubset<T, inscripcion_cursoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Inscripcion_cursos and returns the data updated in the database.
     * @param {inscripcion_cursoUpdateManyAndReturnArgs} args - Arguments to update many Inscripcion_cursos.
     * @example
     * // Update many Inscripcion_cursos
     * const inscripcion_curso = await prisma.inscripcion_curso.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Inscripcion_cursos and only return the `id_ins_cur`
     * const inscripcion_cursoWithId_ins_curOnly = await prisma.inscripcion_curso.updateManyAndReturn({
     *   select: { id_ins_cur: true },
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
    updateManyAndReturn<T extends inscripcion_cursoUpdateManyAndReturnArgs>(args: SelectSubset<T, inscripcion_cursoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Inscripcion_curso.
     * @param {inscripcion_cursoUpsertArgs} args - Arguments to update or create a Inscripcion_curso.
     * @example
     * // Update or create a Inscripcion_curso
     * const inscripcion_curso = await prisma.inscripcion_curso.upsert({
     *   create: {
     *     // ... data to create a Inscripcion_curso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Inscripcion_curso we want to update
     *   }
     * })
     */
    upsert<T extends inscripcion_cursoUpsertArgs>(args: SelectSubset<T, inscripcion_cursoUpsertArgs<ExtArgs>>): Prisma__inscripcion_cursoClient<$Result.GetResult<Prisma.$inscripcion_cursoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Inscripcion_cursos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcion_cursoCountArgs} args - Arguments to filter Inscripcion_cursos to count.
     * @example
     * // Count the number of Inscripcion_cursos
     * const count = await prisma.inscripcion_curso.count({
     *   where: {
     *     // ... the filter for the Inscripcion_cursos we want to count
     *   }
     * })
    **/
    count<T extends inscripcion_cursoCountArgs>(
      args?: Subset<T, inscripcion_cursoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Inscripcion_cursoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Inscripcion_curso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Inscripcion_cursoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Inscripcion_cursoAggregateArgs>(args: Subset<T, Inscripcion_cursoAggregateArgs>): Prisma.PrismaPromise<GetInscripcion_cursoAggregateType<T>>

    /**
     * Group by Inscripcion_curso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {inscripcion_cursoGroupByArgs} args - Group by arguments.
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
      T extends inscripcion_cursoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: inscripcion_cursoGroupByArgs['orderBy'] }
        : { orderBy?: inscripcion_cursoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, inscripcion_cursoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInscripcion_cursoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the inscripcion_curso model
   */
  readonly fields: inscripcion_cursoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for inscripcion_curso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__inscripcion_cursoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inscripcion<T extends inscripcionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, inscripcionDefaultArgs<ExtArgs>>): Prisma__inscripcionClient<$Result.GetResult<Prisma.$inscripcionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the inscripcion_curso model
   */
  interface inscripcion_cursoFieldRefs {
    readonly id_ins_cur: FieldRef<"inscripcion_curso", 'String'>
    readonly not_fin_usu: FieldRef<"inscripcion_curso", 'Float'>
    readonly por_asi_fin_usu: FieldRef<"inscripcion_curso", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * inscripcion_curso findUnique
   */
  export type inscripcion_cursoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion_curso to fetch.
     */
    where: inscripcion_cursoWhereUniqueInput
  }

  /**
   * inscripcion_curso findUniqueOrThrow
   */
  export type inscripcion_cursoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion_curso to fetch.
     */
    where: inscripcion_cursoWhereUniqueInput
  }

  /**
   * inscripcion_curso findFirst
   */
  export type inscripcion_cursoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion_curso to fetch.
     */
    where?: inscripcion_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcion_cursos to fetch.
     */
    orderBy?: inscripcion_cursoOrderByWithRelationInput | inscripcion_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inscripcion_cursos.
     */
    cursor?: inscripcion_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcion_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcion_cursos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inscripcion_cursos.
     */
    distinct?: Inscripcion_cursoScalarFieldEnum | Inscripcion_cursoScalarFieldEnum[]
  }

  /**
   * inscripcion_curso findFirstOrThrow
   */
  export type inscripcion_cursoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion_curso to fetch.
     */
    where?: inscripcion_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcion_cursos to fetch.
     */
    orderBy?: inscripcion_cursoOrderByWithRelationInput | inscripcion_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for inscripcion_cursos.
     */
    cursor?: inscripcion_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcion_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcion_cursos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of inscripcion_cursos.
     */
    distinct?: Inscripcion_cursoScalarFieldEnum | Inscripcion_cursoScalarFieldEnum[]
  }

  /**
   * inscripcion_curso findMany
   */
  export type inscripcion_cursoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * Filter, which inscripcion_cursos to fetch.
     */
    where?: inscripcion_cursoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of inscripcion_cursos to fetch.
     */
    orderBy?: inscripcion_cursoOrderByWithRelationInput | inscripcion_cursoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing inscripcion_cursos.
     */
    cursor?: inscripcion_cursoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` inscripcion_cursos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` inscripcion_cursos.
     */
    skip?: number
    distinct?: Inscripcion_cursoScalarFieldEnum | Inscripcion_cursoScalarFieldEnum[]
  }

  /**
   * inscripcion_curso create
   */
  export type inscripcion_cursoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * The data needed to create a inscripcion_curso.
     */
    data: XOR<inscripcion_cursoCreateInput, inscripcion_cursoUncheckedCreateInput>
  }

  /**
   * inscripcion_curso createMany
   */
  export type inscripcion_cursoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many inscripcion_cursos.
     */
    data: inscripcion_cursoCreateManyInput | inscripcion_cursoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * inscripcion_curso createManyAndReturn
   */
  export type inscripcion_cursoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * The data used to create many inscripcion_cursos.
     */
    data: inscripcion_cursoCreateManyInput | inscripcion_cursoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * inscripcion_curso update
   */
  export type inscripcion_cursoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * The data needed to update a inscripcion_curso.
     */
    data: XOR<inscripcion_cursoUpdateInput, inscripcion_cursoUncheckedUpdateInput>
    /**
     * Choose, which inscripcion_curso to update.
     */
    where: inscripcion_cursoWhereUniqueInput
  }

  /**
   * inscripcion_curso updateMany
   */
  export type inscripcion_cursoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update inscripcion_cursos.
     */
    data: XOR<inscripcion_cursoUpdateManyMutationInput, inscripcion_cursoUncheckedUpdateManyInput>
    /**
     * Filter which inscripcion_cursos to update
     */
    where?: inscripcion_cursoWhereInput
    /**
     * Limit how many inscripcion_cursos to update.
     */
    limit?: number
  }

  /**
   * inscripcion_curso updateManyAndReturn
   */
  export type inscripcion_cursoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * The data used to update inscripcion_cursos.
     */
    data: XOR<inscripcion_cursoUpdateManyMutationInput, inscripcion_cursoUncheckedUpdateManyInput>
    /**
     * Filter which inscripcion_cursos to update
     */
    where?: inscripcion_cursoWhereInput
    /**
     * Limit how many inscripcion_cursos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * inscripcion_curso upsert
   */
  export type inscripcion_cursoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * The filter to search for the inscripcion_curso to update in case it exists.
     */
    where: inscripcion_cursoWhereUniqueInput
    /**
     * In case the inscripcion_curso found by the `where` argument doesn't exist, create a new inscripcion_curso with this data.
     */
    create: XOR<inscripcion_cursoCreateInput, inscripcion_cursoUncheckedCreateInput>
    /**
     * In case the inscripcion_curso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<inscripcion_cursoUpdateInput, inscripcion_cursoUncheckedUpdateInput>
  }

  /**
   * inscripcion_curso delete
   */
  export type inscripcion_cursoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
    /**
     * Filter which inscripcion_curso to delete.
     */
    where: inscripcion_cursoWhereUniqueInput
  }

  /**
   * inscripcion_curso deleteMany
   */
  export type inscripcion_cursoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which inscripcion_cursos to delete
     */
    where?: inscripcion_cursoWhereInput
    /**
     * Limit how many inscripcion_cursos to delete.
     */
    limit?: number
  }

  /**
   * inscripcion_curso without action
   */
  export type inscripcion_cursoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the inscripcion_curso
     */
    select?: inscripcion_cursoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the inscripcion_curso
     */
    omit?: inscripcion_cursoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: inscripcion_cursoInclude<ExtArgs> | null
  }


  /**
   * Model facultad
   */

  export type AggregateFacultad = {
    _count: FacultadCountAggregateOutputType | null
    _min: FacultadMinAggregateOutputType | null
    _max: FacultadMaxAggregateOutputType | null
  }

  export type FacultadMinAggregateOutputType = {
    id_fac: string | null
    nom_fac: string | null
    des_fac: string | null
    mis_fac: string | null
    vis_fac: string | null
  }

  export type FacultadMaxAggregateOutputType = {
    id_fac: string | null
    nom_fac: string | null
    des_fac: string | null
    mis_fac: string | null
    vis_fac: string | null
  }

  export type FacultadCountAggregateOutputType = {
    id_fac: number
    nom_fac: number
    des_fac: number
    mis_fac: number
    vis_fac: number
    _all: number
  }


  export type FacultadMinAggregateInputType = {
    id_fac?: true
    nom_fac?: true
    des_fac?: true
    mis_fac?: true
    vis_fac?: true
  }

  export type FacultadMaxAggregateInputType = {
    id_fac?: true
    nom_fac?: true
    des_fac?: true
    mis_fac?: true
    vis_fac?: true
  }

  export type FacultadCountAggregateInputType = {
    id_fac?: true
    nom_fac?: true
    des_fac?: true
    mis_fac?: true
    vis_fac?: true
    _all?: true
  }

  export type FacultadAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which facultad to aggregate.
     */
    where?: facultadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of facultads to fetch.
     */
    orderBy?: facultadOrderByWithRelationInput | facultadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: facultadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` facultads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` facultads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned facultads
    **/
    _count?: true | FacultadCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FacultadMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FacultadMaxAggregateInputType
  }

  export type GetFacultadAggregateType<T extends FacultadAggregateArgs> = {
        [P in keyof T & keyof AggregateFacultad]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFacultad[P]>
      : GetScalarType<T[P], AggregateFacultad[P]>
  }




  export type facultadGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: facultadWhereInput
    orderBy?: facultadOrderByWithAggregationInput | facultadOrderByWithAggregationInput[]
    by: FacultadScalarFieldEnum[] | FacultadScalarFieldEnum
    having?: facultadScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FacultadCountAggregateInputType | true
    _min?: FacultadMinAggregateInputType
    _max?: FacultadMaxAggregateInputType
  }

  export type FacultadGroupByOutputType = {
    id_fac: string
    nom_fac: string
    des_fac: string
    mis_fac: string
    vis_fac: string
    _count: FacultadCountAggregateOutputType | null
    _min: FacultadMinAggregateOutputType | null
    _max: FacultadMaxAggregateOutputType | null
  }

  type GetFacultadGroupByPayload<T extends facultadGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FacultadGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FacultadGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FacultadGroupByOutputType[P]>
            : GetScalarType<T[P], FacultadGroupByOutputType[P]>
        }
      >
    >


  export type facultadSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fac?: boolean
    nom_fac?: boolean
    des_fac?: boolean
    mis_fac?: boolean
    vis_fac?: boolean
    carreras?: boolean | facultad$carrerasArgs<ExtArgs>
    _count?: boolean | FacultadCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["facultad"]>

  export type facultadSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fac?: boolean
    nom_fac?: boolean
    des_fac?: boolean
    mis_fac?: boolean
    vis_fac?: boolean
  }, ExtArgs["result"]["facultad"]>

  export type facultadSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id_fac?: boolean
    nom_fac?: boolean
    des_fac?: boolean
    mis_fac?: boolean
    vis_fac?: boolean
  }, ExtArgs["result"]["facultad"]>

  export type facultadSelectScalar = {
    id_fac?: boolean
    nom_fac?: boolean
    des_fac?: boolean
    mis_fac?: boolean
    vis_fac?: boolean
  }

  export type facultadOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id_fac" | "nom_fac" | "des_fac" | "mis_fac" | "vis_fac", ExtArgs["result"]["facultad"]>
  export type facultadInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carreras?: boolean | facultad$carrerasArgs<ExtArgs>
    _count?: boolean | FacultadCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type facultadIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type facultadIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $facultadPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "facultad"
    objects: {
      carreras: Prisma.$carreraPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id_fac: string
      nom_fac: string
      des_fac: string
      mis_fac: string
      vis_fac: string
    }, ExtArgs["result"]["facultad"]>
    composites: {}
  }

  type facultadGetPayload<S extends boolean | null | undefined | facultadDefaultArgs> = $Result.GetResult<Prisma.$facultadPayload, S>

  type facultadCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<facultadFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FacultadCountAggregateInputType | true
    }

  export interface facultadDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['facultad'], meta: { name: 'facultad' } }
    /**
     * Find zero or one Facultad that matches the filter.
     * @param {facultadFindUniqueArgs} args - Arguments to find a Facultad
     * @example
     * // Get one Facultad
     * const facultad = await prisma.facultad.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends facultadFindUniqueArgs>(args: SelectSubset<T, facultadFindUniqueArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Facultad that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {facultadFindUniqueOrThrowArgs} args - Arguments to find a Facultad
     * @example
     * // Get one Facultad
     * const facultad = await prisma.facultad.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends facultadFindUniqueOrThrowArgs>(args: SelectSubset<T, facultadFindUniqueOrThrowArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Facultad that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {facultadFindFirstArgs} args - Arguments to find a Facultad
     * @example
     * // Get one Facultad
     * const facultad = await prisma.facultad.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends facultadFindFirstArgs>(args?: SelectSubset<T, facultadFindFirstArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Facultad that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {facultadFindFirstOrThrowArgs} args - Arguments to find a Facultad
     * @example
     * // Get one Facultad
     * const facultad = await prisma.facultad.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends facultadFindFirstOrThrowArgs>(args?: SelectSubset<T, facultadFindFirstOrThrowArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Facultads that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {facultadFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Facultads
     * const facultads = await prisma.facultad.findMany()
     * 
     * // Get first 10 Facultads
     * const facultads = await prisma.facultad.findMany({ take: 10 })
     * 
     * // Only select the `id_fac`
     * const facultadWithId_facOnly = await prisma.facultad.findMany({ select: { id_fac: true } })
     * 
     */
    findMany<T extends facultadFindManyArgs>(args?: SelectSubset<T, facultadFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Facultad.
     * @param {facultadCreateArgs} args - Arguments to create a Facultad.
     * @example
     * // Create one Facultad
     * const Facultad = await prisma.facultad.create({
     *   data: {
     *     // ... data to create a Facultad
     *   }
     * })
     * 
     */
    create<T extends facultadCreateArgs>(args: SelectSubset<T, facultadCreateArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Facultads.
     * @param {facultadCreateManyArgs} args - Arguments to create many Facultads.
     * @example
     * // Create many Facultads
     * const facultad = await prisma.facultad.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends facultadCreateManyArgs>(args?: SelectSubset<T, facultadCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Facultads and returns the data saved in the database.
     * @param {facultadCreateManyAndReturnArgs} args - Arguments to create many Facultads.
     * @example
     * // Create many Facultads
     * const facultad = await prisma.facultad.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Facultads and only return the `id_fac`
     * const facultadWithId_facOnly = await prisma.facultad.createManyAndReturn({
     *   select: { id_fac: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends facultadCreateManyAndReturnArgs>(args?: SelectSubset<T, facultadCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Facultad.
     * @param {facultadDeleteArgs} args - Arguments to delete one Facultad.
     * @example
     * // Delete one Facultad
     * const Facultad = await prisma.facultad.delete({
     *   where: {
     *     // ... filter to delete one Facultad
     *   }
     * })
     * 
     */
    delete<T extends facultadDeleteArgs>(args: SelectSubset<T, facultadDeleteArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Facultad.
     * @param {facultadUpdateArgs} args - Arguments to update one Facultad.
     * @example
     * // Update one Facultad
     * const facultad = await prisma.facultad.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends facultadUpdateArgs>(args: SelectSubset<T, facultadUpdateArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Facultads.
     * @param {facultadDeleteManyArgs} args - Arguments to filter Facultads to delete.
     * @example
     * // Delete a few Facultads
     * const { count } = await prisma.facultad.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends facultadDeleteManyArgs>(args?: SelectSubset<T, facultadDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Facultads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {facultadUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Facultads
     * const facultad = await prisma.facultad.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends facultadUpdateManyArgs>(args: SelectSubset<T, facultadUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Facultads and returns the data updated in the database.
     * @param {facultadUpdateManyAndReturnArgs} args - Arguments to update many Facultads.
     * @example
     * // Update many Facultads
     * const facultad = await prisma.facultad.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Facultads and only return the `id_fac`
     * const facultadWithId_facOnly = await prisma.facultad.updateManyAndReturn({
     *   select: { id_fac: true },
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
    updateManyAndReturn<T extends facultadUpdateManyAndReturnArgs>(args: SelectSubset<T, facultadUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Facultad.
     * @param {facultadUpsertArgs} args - Arguments to update or create a Facultad.
     * @example
     * // Update or create a Facultad
     * const facultad = await prisma.facultad.upsert({
     *   create: {
     *     // ... data to create a Facultad
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Facultad we want to update
     *   }
     * })
     */
    upsert<T extends facultadUpsertArgs>(args: SelectSubset<T, facultadUpsertArgs<ExtArgs>>): Prisma__facultadClient<$Result.GetResult<Prisma.$facultadPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Facultads.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {facultadCountArgs} args - Arguments to filter Facultads to count.
     * @example
     * // Count the number of Facultads
     * const count = await prisma.facultad.count({
     *   where: {
     *     // ... the filter for the Facultads we want to count
     *   }
     * })
    **/
    count<T extends facultadCountArgs>(
      args?: Subset<T, facultadCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FacultadCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Facultad.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FacultadAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends FacultadAggregateArgs>(args: Subset<T, FacultadAggregateArgs>): Prisma.PrismaPromise<GetFacultadAggregateType<T>>

    /**
     * Group by Facultad.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {facultadGroupByArgs} args - Group by arguments.
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
      T extends facultadGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: facultadGroupByArgs['orderBy'] }
        : { orderBy?: facultadGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, facultadGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFacultadGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the facultad model
   */
  readonly fields: facultadFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for facultad.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__facultadClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    carreras<T extends facultad$carrerasArgs<ExtArgs> = {}>(args?: Subset<T, facultad$carrerasArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$carreraPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the facultad model
   */
  interface facultadFieldRefs {
    readonly id_fac: FieldRef<"facultad", 'String'>
    readonly nom_fac: FieldRef<"facultad", 'String'>
    readonly des_fac: FieldRef<"facultad", 'String'>
    readonly mis_fac: FieldRef<"facultad", 'String'>
    readonly vis_fac: FieldRef<"facultad", 'String'>
  }
    

  // Custom InputTypes
  /**
   * facultad findUnique
   */
  export type facultadFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * Filter, which facultad to fetch.
     */
    where: facultadWhereUniqueInput
  }

  /**
   * facultad findUniqueOrThrow
   */
  export type facultadFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * Filter, which facultad to fetch.
     */
    where: facultadWhereUniqueInput
  }

  /**
   * facultad findFirst
   */
  export type facultadFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * Filter, which facultad to fetch.
     */
    where?: facultadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of facultads to fetch.
     */
    orderBy?: facultadOrderByWithRelationInput | facultadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for facultads.
     */
    cursor?: facultadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` facultads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` facultads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of facultads.
     */
    distinct?: FacultadScalarFieldEnum | FacultadScalarFieldEnum[]
  }

  /**
   * facultad findFirstOrThrow
   */
  export type facultadFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * Filter, which facultad to fetch.
     */
    where?: facultadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of facultads to fetch.
     */
    orderBy?: facultadOrderByWithRelationInput | facultadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for facultads.
     */
    cursor?: facultadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` facultads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` facultads.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of facultads.
     */
    distinct?: FacultadScalarFieldEnum | FacultadScalarFieldEnum[]
  }

  /**
   * facultad findMany
   */
  export type facultadFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * Filter, which facultads to fetch.
     */
    where?: facultadWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of facultads to fetch.
     */
    orderBy?: facultadOrderByWithRelationInput | facultadOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing facultads.
     */
    cursor?: facultadWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` facultads from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` facultads.
     */
    skip?: number
    distinct?: FacultadScalarFieldEnum | FacultadScalarFieldEnum[]
  }

  /**
   * facultad create
   */
  export type facultadCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * The data needed to create a facultad.
     */
    data: XOR<facultadCreateInput, facultadUncheckedCreateInput>
  }

  /**
   * facultad createMany
   */
  export type facultadCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many facultads.
     */
    data: facultadCreateManyInput | facultadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * facultad createManyAndReturn
   */
  export type facultadCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * The data used to create many facultads.
     */
    data: facultadCreateManyInput | facultadCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * facultad update
   */
  export type facultadUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * The data needed to update a facultad.
     */
    data: XOR<facultadUpdateInput, facultadUncheckedUpdateInput>
    /**
     * Choose, which facultad to update.
     */
    where: facultadWhereUniqueInput
  }

  /**
   * facultad updateMany
   */
  export type facultadUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update facultads.
     */
    data: XOR<facultadUpdateManyMutationInput, facultadUncheckedUpdateManyInput>
    /**
     * Filter which facultads to update
     */
    where?: facultadWhereInput
    /**
     * Limit how many facultads to update.
     */
    limit?: number
  }

  /**
   * facultad updateManyAndReturn
   */
  export type facultadUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * The data used to update facultads.
     */
    data: XOR<facultadUpdateManyMutationInput, facultadUncheckedUpdateManyInput>
    /**
     * Filter which facultads to update
     */
    where?: facultadWhereInput
    /**
     * Limit how many facultads to update.
     */
    limit?: number
  }

  /**
   * facultad upsert
   */
  export type facultadUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * The filter to search for the facultad to update in case it exists.
     */
    where: facultadWhereUniqueInput
    /**
     * In case the facultad found by the `where` argument doesn't exist, create a new facultad with this data.
     */
    create: XOR<facultadCreateInput, facultadUncheckedCreateInput>
    /**
     * In case the facultad was found with the provided `where` argument, update it with this data.
     */
    update: XOR<facultadUpdateInput, facultadUncheckedUpdateInput>
  }

  /**
   * facultad delete
   */
  export type facultadDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
    /**
     * Filter which facultad to delete.
     */
    where: facultadWhereUniqueInput
  }

  /**
   * facultad deleteMany
   */
  export type facultadDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which facultads to delete
     */
    where?: facultadWhereInput
    /**
     * Limit how many facultads to delete.
     */
    limit?: number
  }

  /**
   * facultad.carreras
   */
  export type facultad$carrerasArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
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
    orderBy?: carreraOrderByWithRelationInput | carreraOrderByWithRelationInput[]
    cursor?: carreraWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CarreraScalarFieldEnum | CarreraScalarFieldEnum[]
  }

  /**
   * facultad without action
   */
  export type facultadDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the facultad
     */
    select?: facultadSelect<ExtArgs> | null
    /**
     * Omit specific fields from the facultad
     */
    omit?: facultadOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: facultadInclude<ExtArgs> | null
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
    fec_cre_usu: 'fec_cre_usu',
    com_usu: 'com_usu',
    id_car_est: 'id_car_est'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const CarreraScalarFieldEnum: {
    id_car: 'id_car',
    nom_car: 'nom_car',
    est_car: 'est_car',
    fec_cre_car: 'fec_cre_car',
    id_fac_per: 'id_fac_per'
  };

  export type CarreraScalarFieldEnum = (typeof CarreraScalarFieldEnum)[keyof typeof CarreraScalarFieldEnum]


  export const EventoScalarFieldEnum: {
    id_eve: 'id_eve',
    nom_eve: 'nom_eve',
    des_eve: 'des_eve',
    tip_eve: 'tip_eve',
    fec_ini_eve: 'fec_ini_eve',
    val_eve: 'val_eve',
    est_eve: 'est_eve',
    fec_cre_eve: 'fec_cre_eve',
    img_por_eve: 'img_por_eve',
    dur_hor_eve: 'dur_hor_eve',
    por_min_asi_eve: 'por_min_asi_eve',
    fec_fin_eve: 'fec_fin_eve'
  };

  export type EventoScalarFieldEnum = (typeof EventoScalarFieldEnum)[keyof typeof EventoScalarFieldEnum]


  export const Evento_cursoScalarFieldEnum: {
    id_eve_cur: 'id_eve_cur',
    not_min_cur: 'not_min_cur'
  };

  export type Evento_cursoScalarFieldEnum = (typeof Evento_cursoScalarFieldEnum)[keyof typeof Evento_cursoScalarFieldEnum]


  export const Evento_carreraScalarFieldEnum: {
    id_eve_car: 'id_eve_car',
    id_car_aso: 'id_car_aso',
    id_eve_aso: 'id_eve_aso',
    fec_aso: 'fec_aso'
  };

  export type Evento_carreraScalarFieldEnum = (typeof Evento_carreraScalarFieldEnum)[keyof typeof Evento_carreraScalarFieldEnum]


  export const InscripcionScalarFieldEnum: {
    id_ins: 'id_ins',
    id_usu_ins: 'id_usu_ins',
    id_eve_ins: 'id_eve_ins',
    est_ins: 'est_ins',
    fec_ins: 'fec_ins',
    fec_pag_ins: 'fec_pag_ins',
    cer_eve_env: 'cer_eve_env',
    car_mot_usu: 'car_mot_usu'
  };

  export type InscripcionScalarFieldEnum = (typeof InscripcionScalarFieldEnum)[keyof typeof InscripcionScalarFieldEnum]


  export const Inscripcion_cursoScalarFieldEnum: {
    id_ins_cur: 'id_ins_cur',
    not_fin_usu: 'not_fin_usu',
    por_asi_fin_usu: 'por_asi_fin_usu'
  };

  export type Inscripcion_cursoScalarFieldEnum = (typeof Inscripcion_cursoScalarFieldEnum)[keyof typeof Inscripcion_cursoScalarFieldEnum]


  export const FacultadScalarFieldEnum: {
    id_fac: 'id_fac',
    nom_fac: 'nom_fac',
    des_fac: 'des_fac',
    mis_fac: 'mis_fac',
    vis_fac: 'vis_fac'
  };

  export type FacultadScalarFieldEnum = (typeof FacultadScalarFieldEnum)[keyof typeof FacultadScalarFieldEnum]


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
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'estado_evento'
   */
  export type Enumestado_eventoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'estado_evento'>
    


  /**
   * Reference to a field of type 'estado_evento[]'
   */
  export type ListEnumestado_eventoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'estado_evento[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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
    com_usu?: StringNullableFilter<"usuario"> | string | null
    id_car_est?: StringNullableFilter<"usuario"> | string | null
    carrera?: XOR<CarreraNullableScalarRelationFilter, carreraWhereInput> | null
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
    com_usu?: SortOrderInput | SortOrder
    id_car_est?: SortOrderInput | SortOrder
    carrera?: carreraOrderByWithRelationInput
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
    com_usu?: StringNullableFilter<"usuario"> | string | null
    id_car_est?: StringNullableFilter<"usuario"> | string | null
    carrera?: XOR<CarreraNullableScalarRelationFilter, carreraWhereInput> | null
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
    com_usu?: SortOrderInput | SortOrder
    id_car_est?: SortOrderInput | SortOrder
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
    com_usu?: StringNullableWithAggregatesFilter<"usuario"> | string | null
    id_car_est?: StringNullableWithAggregatesFilter<"usuario"> | string | null
  }

  export type carreraWhereInput = {
    AND?: carreraWhereInput | carreraWhereInput[]
    OR?: carreraWhereInput[]
    NOT?: carreraWhereInput | carreraWhereInput[]
    id_car?: StringFilter<"carrera"> | string
    nom_car?: StringFilter<"carrera"> | string
    est_car?: BoolFilter<"carrera"> | boolean
    fec_cre_car?: DateTimeFilter<"carrera"> | Date | string
    id_fac_per?: StringFilter<"carrera"> | string
    facultad?: XOR<FacultadScalarRelationFilter, facultadWhereInput>
    usuario?: UsuarioListRelationFilter
    eventos?: Evento_carreraListRelationFilter
  }

  export type carreraOrderByWithRelationInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    id_fac_per?: SortOrder
    facultad?: facultadOrderByWithRelationInput
    usuario?: usuarioOrderByRelationAggregateInput
    eventos?: evento_carreraOrderByRelationAggregateInput
  }

  export type carreraWhereUniqueInput = Prisma.AtLeast<{
    id_car?: string
    nom_car?: string
    AND?: carreraWhereInput | carreraWhereInput[]
    OR?: carreraWhereInput[]
    NOT?: carreraWhereInput | carreraWhereInput[]
    est_car?: BoolFilter<"carrera"> | boolean
    fec_cre_car?: DateTimeFilter<"carrera"> | Date | string
    id_fac_per?: StringFilter<"carrera"> | string
    facultad?: XOR<FacultadScalarRelationFilter, facultadWhereInput>
    usuario?: UsuarioListRelationFilter
    eventos?: Evento_carreraListRelationFilter
  }, "id_car" | "nom_car">

  export type carreraOrderByWithAggregationInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    id_fac_per?: SortOrder
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
    id_fac_per?: StringWithAggregatesFilter<"carrera"> | string
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
    val_eve?: FloatFilter<"evento"> | number
    est_eve?: Enumestado_eventoFilter<"evento"> | $Enums.estado_evento
    fec_cre_eve?: DateTimeFilter<"evento"> | Date | string
    img_por_eve?: StringFilter<"evento"> | string
    dur_hor_eve?: IntFilter<"evento"> | number
    por_min_asi_eve?: FloatFilter<"evento"> | number
    fec_fin_eve?: DateTimeFilter<"evento"> | Date | string
    inscritos?: InscripcionListRelationFilter
    eventos_carrera?: Evento_carreraListRelationFilter
    eventos_curso?: XOR<Evento_cursoNullableScalarRelationFilter, evento_cursoWhereInput> | null
  }

  export type eventoOrderByWithRelationInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrderInput | SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    val_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    img_por_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
    fec_fin_eve?: SortOrder
    inscritos?: inscripcionOrderByRelationAggregateInput
    eventos_carrera?: evento_carreraOrderByRelationAggregateInput
    eventos_curso?: evento_cursoOrderByWithRelationInput
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
    val_eve?: FloatFilter<"evento"> | number
    est_eve?: Enumestado_eventoFilter<"evento"> | $Enums.estado_evento
    fec_cre_eve?: DateTimeFilter<"evento"> | Date | string
    img_por_eve?: StringFilter<"evento"> | string
    dur_hor_eve?: IntFilter<"evento"> | number
    por_min_asi_eve?: FloatFilter<"evento"> | number
    fec_fin_eve?: DateTimeFilter<"evento"> | Date | string
    inscritos?: InscripcionListRelationFilter
    eventos_carrera?: Evento_carreraListRelationFilter
    eventos_curso?: XOR<Evento_cursoNullableScalarRelationFilter, evento_cursoWhereInput> | null
  }, "id_eve">

  export type eventoOrderByWithAggregationInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrderInput | SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    val_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    img_por_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
    fec_fin_eve?: SortOrder
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
    val_eve?: FloatWithAggregatesFilter<"evento"> | number
    est_eve?: Enumestado_eventoWithAggregatesFilter<"evento"> | $Enums.estado_evento
    fec_cre_eve?: DateTimeWithAggregatesFilter<"evento"> | Date | string
    img_por_eve?: StringWithAggregatesFilter<"evento"> | string
    dur_hor_eve?: IntWithAggregatesFilter<"evento"> | number
    por_min_asi_eve?: FloatWithAggregatesFilter<"evento"> | number
    fec_fin_eve?: DateTimeWithAggregatesFilter<"evento"> | Date | string
  }

  export type evento_cursoWhereInput = {
    AND?: evento_cursoWhereInput | evento_cursoWhereInput[]
    OR?: evento_cursoWhereInput[]
    NOT?: evento_cursoWhereInput | evento_cursoWhereInput[]
    id_eve_cur?: StringFilter<"evento_curso"> | string
    not_min_cur?: FloatFilter<"evento_curso"> | number
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
  }

  export type evento_cursoOrderByWithRelationInput = {
    id_eve_cur?: SortOrder
    not_min_cur?: SortOrder
    evento?: eventoOrderByWithRelationInput
  }

  export type evento_cursoWhereUniqueInput = Prisma.AtLeast<{
    id_eve_cur?: string
    AND?: evento_cursoWhereInput | evento_cursoWhereInput[]
    OR?: evento_cursoWhereInput[]
    NOT?: evento_cursoWhereInput | evento_cursoWhereInput[]
    not_min_cur?: FloatFilter<"evento_curso"> | number
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
  }, "id_eve_cur">

  export type evento_cursoOrderByWithAggregationInput = {
    id_eve_cur?: SortOrder
    not_min_cur?: SortOrder
    _count?: evento_cursoCountOrderByAggregateInput
    _avg?: evento_cursoAvgOrderByAggregateInput
    _max?: evento_cursoMaxOrderByAggregateInput
    _min?: evento_cursoMinOrderByAggregateInput
    _sum?: evento_cursoSumOrderByAggregateInput
  }

  export type evento_cursoScalarWhereWithAggregatesInput = {
    AND?: evento_cursoScalarWhereWithAggregatesInput | evento_cursoScalarWhereWithAggregatesInput[]
    OR?: evento_cursoScalarWhereWithAggregatesInput[]
    NOT?: evento_cursoScalarWhereWithAggregatesInput | evento_cursoScalarWhereWithAggregatesInput[]
    id_eve_cur?: StringWithAggregatesFilter<"evento_curso"> | string
    not_min_cur?: FloatWithAggregatesFilter<"evento_curso"> | number
  }

  export type evento_carreraWhereInput = {
    AND?: evento_carreraWhereInput | evento_carreraWhereInput[]
    OR?: evento_carreraWhereInput[]
    NOT?: evento_carreraWhereInput | evento_carreraWhereInput[]
    id_eve_car?: StringFilter<"evento_carrera"> | string
    id_car_aso?: StringFilter<"evento_carrera"> | string
    id_eve_aso?: StringFilter<"evento_carrera"> | string
    fec_aso?: DateTimeFilter<"evento_carrera"> | Date | string
    carrera?: XOR<CarreraScalarRelationFilter, carreraWhereInput>
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
  }

  export type evento_carreraOrderByWithRelationInput = {
    id_eve_car?: SortOrder
    id_car_aso?: SortOrder
    id_eve_aso?: SortOrder
    fec_aso?: SortOrder
    carrera?: carreraOrderByWithRelationInput
    evento?: eventoOrderByWithRelationInput
  }

  export type evento_carreraWhereUniqueInput = Prisma.AtLeast<{
    id_eve_car?: string
    AND?: evento_carreraWhereInput | evento_carreraWhereInput[]
    OR?: evento_carreraWhereInput[]
    NOT?: evento_carreraWhereInput | evento_carreraWhereInput[]
    id_car_aso?: StringFilter<"evento_carrera"> | string
    id_eve_aso?: StringFilter<"evento_carrera"> | string
    fec_aso?: DateTimeFilter<"evento_carrera"> | Date | string
    carrera?: XOR<CarreraScalarRelationFilter, carreraWhereInput>
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
  }, "id_eve_car">

  export type evento_carreraOrderByWithAggregationInput = {
    id_eve_car?: SortOrder
    id_car_aso?: SortOrder
    id_eve_aso?: SortOrder
    fec_aso?: SortOrder
    _count?: evento_carreraCountOrderByAggregateInput
    _max?: evento_carreraMaxOrderByAggregateInput
    _min?: evento_carreraMinOrderByAggregateInput
  }

  export type evento_carreraScalarWhereWithAggregatesInput = {
    AND?: evento_carreraScalarWhereWithAggregatesInput | evento_carreraScalarWhereWithAggregatesInput[]
    OR?: evento_carreraScalarWhereWithAggregatesInput[]
    NOT?: evento_carreraScalarWhereWithAggregatesInput | evento_carreraScalarWhereWithAggregatesInput[]
    id_eve_car?: StringWithAggregatesFilter<"evento_carrera"> | string
    id_car_aso?: StringWithAggregatesFilter<"evento_carrera"> | string
    id_eve_aso?: StringWithAggregatesFilter<"evento_carrera"> | string
    fec_aso?: DateTimeWithAggregatesFilter<"evento_carrera"> | Date | string
  }

  export type inscripcionWhereInput = {
    AND?: inscripcionWhereInput | inscripcionWhereInput[]
    OR?: inscripcionWhereInput[]
    NOT?: inscripcionWhereInput | inscripcionWhereInput[]
    id_ins?: StringFilter<"inscripcion"> | string
    id_usu_ins?: StringFilter<"inscripcion"> | string
    id_eve_ins?: StringFilter<"inscripcion"> | string
    est_ins?: Enumestado_inscripcionFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeFilter<"inscripcion"> | Date | string
    fec_pag_ins?: DateTimeNullableFilter<"inscripcion"> | Date | string | null
    cer_eve_env?: BoolFilter<"inscripcion"> | boolean
    car_mot_usu?: StringNullableFilter<"inscripcion"> | string | null
    usuario?: XOR<UsuarioScalarRelationFilter, usuarioWhereInput>
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
    inscripcion_curso?: XOR<Inscripcion_cursoNullableScalarRelationFilter, inscripcion_cursoWhereInput> | null
  }

  export type inscripcionOrderByWithRelationInput = {
    id_ins?: SortOrder
    id_usu_ins?: SortOrder
    id_eve_ins?: SortOrder
    est_ins?: SortOrder
    fec_ins?: SortOrder
    fec_pag_ins?: SortOrderInput | SortOrder
    cer_eve_env?: SortOrder
    car_mot_usu?: SortOrderInput | SortOrder
    usuario?: usuarioOrderByWithRelationInput
    evento?: eventoOrderByWithRelationInput
    inscripcion_curso?: inscripcion_cursoOrderByWithRelationInput
  }

  export type inscripcionWhereUniqueInput = Prisma.AtLeast<{
    id_ins?: string
    AND?: inscripcionWhereInput | inscripcionWhereInput[]
    OR?: inscripcionWhereInput[]
    NOT?: inscripcionWhereInput | inscripcionWhereInput[]
    id_usu_ins?: StringFilter<"inscripcion"> | string
    id_eve_ins?: StringFilter<"inscripcion"> | string
    est_ins?: Enumestado_inscripcionFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeFilter<"inscripcion"> | Date | string
    fec_pag_ins?: DateTimeNullableFilter<"inscripcion"> | Date | string | null
    cer_eve_env?: BoolFilter<"inscripcion"> | boolean
    car_mot_usu?: StringNullableFilter<"inscripcion"> | string | null
    usuario?: XOR<UsuarioScalarRelationFilter, usuarioWhereInput>
    evento?: XOR<EventoScalarRelationFilter, eventoWhereInput>
    inscripcion_curso?: XOR<Inscripcion_cursoNullableScalarRelationFilter, inscripcion_cursoWhereInput> | null
  }, "id_ins">

  export type inscripcionOrderByWithAggregationInput = {
    id_ins?: SortOrder
    id_usu_ins?: SortOrder
    id_eve_ins?: SortOrder
    est_ins?: SortOrder
    fec_ins?: SortOrder
    fec_pag_ins?: SortOrderInput | SortOrder
    cer_eve_env?: SortOrder
    car_mot_usu?: SortOrderInput | SortOrder
    _count?: inscripcionCountOrderByAggregateInput
    _max?: inscripcionMaxOrderByAggregateInput
    _min?: inscripcionMinOrderByAggregateInput
  }

  export type inscripcionScalarWhereWithAggregatesInput = {
    AND?: inscripcionScalarWhereWithAggregatesInput | inscripcionScalarWhereWithAggregatesInput[]
    OR?: inscripcionScalarWhereWithAggregatesInput[]
    NOT?: inscripcionScalarWhereWithAggregatesInput | inscripcionScalarWhereWithAggregatesInput[]
    id_ins?: StringWithAggregatesFilter<"inscripcion"> | string
    id_usu_ins?: StringWithAggregatesFilter<"inscripcion"> | string
    id_eve_ins?: StringWithAggregatesFilter<"inscripcion"> | string
    est_ins?: Enumestado_inscripcionWithAggregatesFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeWithAggregatesFilter<"inscripcion"> | Date | string
    fec_pag_ins?: DateTimeNullableWithAggregatesFilter<"inscripcion"> | Date | string | null
    cer_eve_env?: BoolWithAggregatesFilter<"inscripcion"> | boolean
    car_mot_usu?: StringNullableWithAggregatesFilter<"inscripcion"> | string | null
  }

  export type inscripcion_cursoWhereInput = {
    AND?: inscripcion_cursoWhereInput | inscripcion_cursoWhereInput[]
    OR?: inscripcion_cursoWhereInput[]
    NOT?: inscripcion_cursoWhereInput | inscripcion_cursoWhereInput[]
    id_ins_cur?: StringFilter<"inscripcion_curso"> | string
    not_fin_usu?: FloatNullableFilter<"inscripcion_curso"> | number | null
    por_asi_fin_usu?: FloatNullableFilter<"inscripcion_curso"> | number | null
    inscripcion?: XOR<InscripcionScalarRelationFilter, inscripcionWhereInput>
  }

  export type inscripcion_cursoOrderByWithRelationInput = {
    id_ins_cur?: SortOrder
    not_fin_usu?: SortOrderInput | SortOrder
    por_asi_fin_usu?: SortOrderInput | SortOrder
    inscripcion?: inscripcionOrderByWithRelationInput
  }

  export type inscripcion_cursoWhereUniqueInput = Prisma.AtLeast<{
    id_ins_cur?: string
    AND?: inscripcion_cursoWhereInput | inscripcion_cursoWhereInput[]
    OR?: inscripcion_cursoWhereInput[]
    NOT?: inscripcion_cursoWhereInput | inscripcion_cursoWhereInput[]
    not_fin_usu?: FloatNullableFilter<"inscripcion_curso"> | number | null
    por_asi_fin_usu?: FloatNullableFilter<"inscripcion_curso"> | number | null
    inscripcion?: XOR<InscripcionScalarRelationFilter, inscripcionWhereInput>
  }, "id_ins_cur">

  export type inscripcion_cursoOrderByWithAggregationInput = {
    id_ins_cur?: SortOrder
    not_fin_usu?: SortOrderInput | SortOrder
    por_asi_fin_usu?: SortOrderInput | SortOrder
    _count?: inscripcion_cursoCountOrderByAggregateInput
    _avg?: inscripcion_cursoAvgOrderByAggregateInput
    _max?: inscripcion_cursoMaxOrderByAggregateInput
    _min?: inscripcion_cursoMinOrderByAggregateInput
    _sum?: inscripcion_cursoSumOrderByAggregateInput
  }

  export type inscripcion_cursoScalarWhereWithAggregatesInput = {
    AND?: inscripcion_cursoScalarWhereWithAggregatesInput | inscripcion_cursoScalarWhereWithAggregatesInput[]
    OR?: inscripcion_cursoScalarWhereWithAggregatesInput[]
    NOT?: inscripcion_cursoScalarWhereWithAggregatesInput | inscripcion_cursoScalarWhereWithAggregatesInput[]
    id_ins_cur?: StringWithAggregatesFilter<"inscripcion_curso"> | string
    not_fin_usu?: FloatNullableWithAggregatesFilter<"inscripcion_curso"> | number | null
    por_asi_fin_usu?: FloatNullableWithAggregatesFilter<"inscripcion_curso"> | number | null
  }

  export type facultadWhereInput = {
    AND?: facultadWhereInput | facultadWhereInput[]
    OR?: facultadWhereInput[]
    NOT?: facultadWhereInput | facultadWhereInput[]
    id_fac?: StringFilter<"facultad"> | string
    nom_fac?: StringFilter<"facultad"> | string
    des_fac?: StringFilter<"facultad"> | string
    mis_fac?: StringFilter<"facultad"> | string
    vis_fac?: StringFilter<"facultad"> | string
    carreras?: CarreraListRelationFilter
  }

  export type facultadOrderByWithRelationInput = {
    id_fac?: SortOrder
    nom_fac?: SortOrder
    des_fac?: SortOrder
    mis_fac?: SortOrder
    vis_fac?: SortOrder
    carreras?: carreraOrderByRelationAggregateInput
  }

  export type facultadWhereUniqueInput = Prisma.AtLeast<{
    id_fac?: string
    nom_fac?: string
    AND?: facultadWhereInput | facultadWhereInput[]
    OR?: facultadWhereInput[]
    NOT?: facultadWhereInput | facultadWhereInput[]
    des_fac?: StringFilter<"facultad"> | string
    mis_fac?: StringFilter<"facultad"> | string
    vis_fac?: StringFilter<"facultad"> | string
    carreras?: CarreraListRelationFilter
  }, "id_fac" | "nom_fac">

  export type facultadOrderByWithAggregationInput = {
    id_fac?: SortOrder
    nom_fac?: SortOrder
    des_fac?: SortOrder
    mis_fac?: SortOrder
    vis_fac?: SortOrder
    _count?: facultadCountOrderByAggregateInput
    _max?: facultadMaxOrderByAggregateInput
    _min?: facultadMinOrderByAggregateInput
  }

  export type facultadScalarWhereWithAggregatesInput = {
    AND?: facultadScalarWhereWithAggregatesInput | facultadScalarWhereWithAggregatesInput[]
    OR?: facultadScalarWhereWithAggregatesInput[]
    NOT?: facultadScalarWhereWithAggregatesInput | facultadScalarWhereWithAggregatesInput[]
    id_fac?: StringWithAggregatesFilter<"facultad"> | string
    nom_fac?: StringWithAggregatesFilter<"facultad"> | string
    des_fac?: StringWithAggregatesFilter<"facultad"> | string
    mis_fac?: StringWithAggregatesFilter<"facultad"> | string
    vis_fac?: StringWithAggregatesFilter<"facultad"> | string
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
    com_usu?: string | null
    carrera?: carreraCreateNestedOneWithoutUsuarioInput
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
    com_usu?: string | null
    id_car_est?: string | null
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
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    carrera?: carreraUpdateOneWithoutUsuarioNestedInput
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
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    id_car_est?: NullableStringFieldUpdateOperationsInput | string | null
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
    com_usu?: string | null
    id_car_est?: string | null
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
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
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
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    id_car_est?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type carreraCreateInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    facultad: facultadCreateNestedOneWithoutCarrerasInput
    usuario?: usuarioCreateNestedManyWithoutCarreraInput
    eventos?: evento_carreraCreateNestedManyWithoutCarreraInput
  }

  export type carreraUncheckedCreateInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    id_fac_per: string
    usuario?: usuarioUncheckedCreateNestedManyWithoutCarreraInput
    eventos?: evento_carreraUncheckedCreateNestedManyWithoutCarreraInput
  }

  export type carreraUpdateInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    facultad?: facultadUpdateOneRequiredWithoutCarrerasNestedInput
    usuario?: usuarioUpdateManyWithoutCarreraNestedInput
    eventos?: evento_carreraUpdateManyWithoutCarreraNestedInput
  }

  export type carreraUncheckedUpdateInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    id_fac_per?: StringFieldUpdateOperationsInput | string
    usuario?: usuarioUncheckedUpdateManyWithoutCarreraNestedInput
    eventos?: evento_carreraUncheckedUpdateManyWithoutCarreraNestedInput
  }

  export type carreraCreateManyInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    id_fac_per: string
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
    id_fac_per?: StringFieldUpdateOperationsInput | string
  }

  export type eventoCreateInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    inscritos?: inscripcionCreateNestedManyWithoutEventoInput
    eventos_carrera?: evento_carreraCreateNestedManyWithoutEventoInput
    eventos_curso?: evento_cursoCreateNestedOneWithoutEventoInput
  }

  export type eventoUncheckedCreateInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    inscritos?: inscripcionUncheckedCreateNestedManyWithoutEventoInput
    eventos_carrera?: evento_carreraUncheckedCreateNestedManyWithoutEventoInput
    eventos_curso?: evento_cursoUncheckedCreateNestedOneWithoutEventoInput
  }

  export type eventoUpdateInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscritos?: inscripcionUpdateManyWithoutEventoNestedInput
    eventos_carrera?: evento_carreraUpdateManyWithoutEventoNestedInput
    eventos_curso?: evento_cursoUpdateOneWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscritos?: inscripcionUncheckedUpdateManyWithoutEventoNestedInput
    eventos_carrera?: evento_carreraUncheckedUpdateManyWithoutEventoNestedInput
    eventos_curso?: evento_cursoUncheckedUpdateOneWithoutEventoNestedInput
  }

  export type eventoCreateManyInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
  }

  export type eventoUpdateManyMutationInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type eventoUncheckedUpdateManyInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type evento_cursoCreateInput = {
    not_min_cur: number
    evento: eventoCreateNestedOneWithoutEventos_cursoInput
  }

  export type evento_cursoUncheckedCreateInput = {
    id_eve_cur: string
    not_min_cur: number
  }

  export type evento_cursoUpdateInput = {
    not_min_cur?: FloatFieldUpdateOperationsInput | number
    evento?: eventoUpdateOneRequiredWithoutEventos_cursoNestedInput
  }

  export type evento_cursoUncheckedUpdateInput = {
    id_eve_cur?: StringFieldUpdateOperationsInput | string
    not_min_cur?: FloatFieldUpdateOperationsInput | number
  }

  export type evento_cursoCreateManyInput = {
    id_eve_cur: string
    not_min_cur: number
  }

  export type evento_cursoUpdateManyMutationInput = {
    not_min_cur?: FloatFieldUpdateOperationsInput | number
  }

  export type evento_cursoUncheckedUpdateManyInput = {
    id_eve_cur?: StringFieldUpdateOperationsInput | string
    not_min_cur?: FloatFieldUpdateOperationsInput | number
  }

  export type evento_carreraCreateInput = {
    id_eve_car?: string
    fec_aso?: Date | string
    carrera: carreraCreateNestedOneWithoutEventosInput
    evento: eventoCreateNestedOneWithoutEventos_carreraInput
  }

  export type evento_carreraUncheckedCreateInput = {
    id_eve_car?: string
    id_car_aso: string
    id_eve_aso: string
    fec_aso?: Date | string
  }

  export type evento_carreraUpdateInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
    carrera?: carreraUpdateOneRequiredWithoutEventosNestedInput
    evento?: eventoUpdateOneRequiredWithoutEventos_carreraNestedInput
  }

  export type evento_carreraUncheckedUpdateInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    id_car_aso?: StringFieldUpdateOperationsInput | string
    id_eve_aso?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type evento_carreraCreateManyInput = {
    id_eve_car?: string
    id_car_aso: string
    id_eve_aso: string
    fec_aso?: Date | string
  }

  export type evento_carreraUpdateManyMutationInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type evento_carreraUncheckedUpdateManyInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    id_car_aso?: StringFieldUpdateOperationsInput | string
    id_eve_aso?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type inscripcionCreateInput = {
    id_ins?: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    usuario: usuarioCreateNestedOneWithoutInscripcionesInput
    evento: eventoCreateNestedOneWithoutInscritosInput
    inscripcion_curso?: inscripcion_cursoCreateNestedOneWithoutInscripcionInput
  }

  export type inscripcionUncheckedCreateInput = {
    id_ins?: string
    id_usu_ins: string
    id_eve_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    inscripcion_curso?: inscripcion_cursoUncheckedCreateNestedOneWithoutInscripcionInput
  }

  export type inscripcionUpdateInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    usuario?: usuarioUpdateOneRequiredWithoutInscripcionesNestedInput
    evento?: eventoUpdateOneRequiredWithoutInscritosNestedInput
    inscripcion_curso?: inscripcion_cursoUpdateOneWithoutInscripcionNestedInput
  }

  export type inscripcionUncheckedUpdateInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu_ins?: StringFieldUpdateOperationsInput | string
    id_eve_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    inscripcion_curso?: inscripcion_cursoUncheckedUpdateOneWithoutInscripcionNestedInput
  }

  export type inscripcionCreateManyInput = {
    id_ins?: string
    id_usu_ins: string
    id_eve_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
  }

  export type inscripcionUpdateManyMutationInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type inscripcionUncheckedUpdateManyInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu_ins?: StringFieldUpdateOperationsInput | string
    id_eve_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type inscripcion_cursoCreateInput = {
    not_fin_usu?: number | null
    por_asi_fin_usu?: number | null
    inscripcion: inscripcionCreateNestedOneWithoutInscripcion_cursoInput
  }

  export type inscripcion_cursoUncheckedCreateInput = {
    id_ins_cur: string
    not_fin_usu?: number | null
    por_asi_fin_usu?: number | null
  }

  export type inscripcion_cursoUpdateInput = {
    not_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asi_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    inscripcion?: inscripcionUpdateOneRequiredWithoutInscripcion_cursoNestedInput
  }

  export type inscripcion_cursoUncheckedUpdateInput = {
    id_ins_cur?: StringFieldUpdateOperationsInput | string
    not_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asi_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type inscripcion_cursoCreateManyInput = {
    id_ins_cur: string
    not_fin_usu?: number | null
    por_asi_fin_usu?: number | null
  }

  export type inscripcion_cursoUpdateManyMutationInput = {
    not_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asi_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type inscripcion_cursoUncheckedUpdateManyInput = {
    id_ins_cur?: StringFieldUpdateOperationsInput | string
    not_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asi_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type facultadCreateInput = {
    id_fac?: string
    nom_fac: string
    des_fac: string
    mis_fac: string
    vis_fac: string
    carreras?: carreraCreateNestedManyWithoutFacultadInput
  }

  export type facultadUncheckedCreateInput = {
    id_fac?: string
    nom_fac: string
    des_fac: string
    mis_fac: string
    vis_fac: string
    carreras?: carreraUncheckedCreateNestedManyWithoutFacultadInput
  }

  export type facultadUpdateInput = {
    id_fac?: StringFieldUpdateOperationsInput | string
    nom_fac?: StringFieldUpdateOperationsInput | string
    des_fac?: StringFieldUpdateOperationsInput | string
    mis_fac?: StringFieldUpdateOperationsInput | string
    vis_fac?: StringFieldUpdateOperationsInput | string
    carreras?: carreraUpdateManyWithoutFacultadNestedInput
  }

  export type facultadUncheckedUpdateInput = {
    id_fac?: StringFieldUpdateOperationsInput | string
    nom_fac?: StringFieldUpdateOperationsInput | string
    des_fac?: StringFieldUpdateOperationsInput | string
    mis_fac?: StringFieldUpdateOperationsInput | string
    vis_fac?: StringFieldUpdateOperationsInput | string
    carreras?: carreraUncheckedUpdateManyWithoutFacultadNestedInput
  }

  export type facultadCreateManyInput = {
    id_fac?: string
    nom_fac: string
    des_fac: string
    mis_fac: string
    vis_fac: string
  }

  export type facultadUpdateManyMutationInput = {
    id_fac?: StringFieldUpdateOperationsInput | string
    nom_fac?: StringFieldUpdateOperationsInput | string
    des_fac?: StringFieldUpdateOperationsInput | string
    mis_fac?: StringFieldUpdateOperationsInput | string
    vis_fac?: StringFieldUpdateOperationsInput | string
  }

  export type facultadUncheckedUpdateManyInput = {
    id_fac?: StringFieldUpdateOperationsInput | string
    nom_fac?: StringFieldUpdateOperationsInput | string
    des_fac?: StringFieldUpdateOperationsInput | string
    mis_fac?: StringFieldUpdateOperationsInput | string
    vis_fac?: StringFieldUpdateOperationsInput | string
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

  export type CarreraNullableScalarRelationFilter = {
    is?: carreraWhereInput | null
    isNot?: carreraWhereInput | null
  }

  export type InscripcionListRelationFilter = {
    every?: inscripcionWhereInput
    some?: inscripcionWhereInput
    none?: inscripcionWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
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
    com_usu?: SortOrder
    id_car_est?: SortOrder
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
    com_usu?: SortOrder
    id_car_est?: SortOrder
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
    com_usu?: SortOrder
    id_car_est?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type FacultadScalarRelationFilter = {
    is?: facultadWhereInput
    isNot?: facultadWhereInput
  }

  export type UsuarioListRelationFilter = {
    every?: usuarioWhereInput
    some?: usuarioWhereInput
    none?: usuarioWhereInput
  }

  export type Evento_carreraListRelationFilter = {
    every?: evento_carreraWhereInput
    some?: evento_carreraWhereInput
    none?: evento_carreraWhereInput
  }

  export type usuarioOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type evento_carreraOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type carreraCountOrderByAggregateInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    id_fac_per?: SortOrder
  }

  export type carreraMaxOrderByAggregateInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    id_fac_per?: SortOrder
  }

  export type carreraMinOrderByAggregateInput = {
    id_car?: SortOrder
    nom_car?: SortOrder
    est_car?: SortOrder
    fec_cre_car?: SortOrder
    id_fac_per?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type Enumtipo_eventoFilter<$PrismaModel = never> = {
    equals?: $Enums.tipo_evento | Enumtipo_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumtipo_eventoFilter<$PrismaModel> | $Enums.tipo_evento
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type Enumestado_eventoFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_evento | Enumestado_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_eventoFilter<$PrismaModel> | $Enums.estado_evento
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

  export type Evento_cursoNullableScalarRelationFilter = {
    is?: evento_cursoWhereInput | null
    isNot?: evento_cursoWhereInput | null
  }

  export type eventoCountOrderByAggregateInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    val_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    img_por_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
    fec_fin_eve?: SortOrder
  }

  export type eventoAvgOrderByAggregateInput = {
    val_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
  }

  export type eventoMaxOrderByAggregateInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    val_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    img_por_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
    fec_fin_eve?: SortOrder
  }

  export type eventoMinOrderByAggregateInput = {
    id_eve?: SortOrder
    nom_eve?: SortOrder
    des_eve?: SortOrder
    tip_eve?: SortOrder
    fec_ini_eve?: SortOrder
    val_eve?: SortOrder
    est_eve?: SortOrder
    fec_cre_eve?: SortOrder
    img_por_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
    fec_fin_eve?: SortOrder
  }

  export type eventoSumOrderByAggregateInput = {
    val_eve?: SortOrder
    dur_hor_eve?: SortOrder
    por_min_asi_eve?: SortOrder
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

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type Enumestado_eventoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_evento | Enumestado_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_eventoWithAggregatesFilter<$PrismaModel> | $Enums.estado_evento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumestado_eventoFilter<$PrismaModel>
    _max?: NestedEnumestado_eventoFilter<$PrismaModel>
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

  export type EventoScalarRelationFilter = {
    is?: eventoWhereInput
    isNot?: eventoWhereInput
  }

  export type evento_cursoCountOrderByAggregateInput = {
    id_eve_cur?: SortOrder
    not_min_cur?: SortOrder
  }

  export type evento_cursoAvgOrderByAggregateInput = {
    not_min_cur?: SortOrder
  }

  export type evento_cursoMaxOrderByAggregateInput = {
    id_eve_cur?: SortOrder
    not_min_cur?: SortOrder
  }

  export type evento_cursoMinOrderByAggregateInput = {
    id_eve_cur?: SortOrder
    not_min_cur?: SortOrder
  }

  export type evento_cursoSumOrderByAggregateInput = {
    not_min_cur?: SortOrder
  }

  export type CarreraScalarRelationFilter = {
    is?: carreraWhereInput
    isNot?: carreraWhereInput
  }

  export type evento_carreraCountOrderByAggregateInput = {
    id_eve_car?: SortOrder
    id_car_aso?: SortOrder
    id_eve_aso?: SortOrder
    fec_aso?: SortOrder
  }

  export type evento_carreraMaxOrderByAggregateInput = {
    id_eve_car?: SortOrder
    id_car_aso?: SortOrder
    id_eve_aso?: SortOrder
    fec_aso?: SortOrder
  }

  export type evento_carreraMinOrderByAggregateInput = {
    id_eve_car?: SortOrder
    id_car_aso?: SortOrder
    id_eve_aso?: SortOrder
    fec_aso?: SortOrder
  }

  export type Enumestado_inscripcionFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_inscripcion | Enumestado_inscripcionFieldRefInput<$PrismaModel>
    in?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_inscripcionFilter<$PrismaModel> | $Enums.estado_inscripcion
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UsuarioScalarRelationFilter = {
    is?: usuarioWhereInput
    isNot?: usuarioWhereInput
  }

  export type Inscripcion_cursoNullableScalarRelationFilter = {
    is?: inscripcion_cursoWhereInput | null
    isNot?: inscripcion_cursoWhereInput | null
  }

  export type inscripcionCountOrderByAggregateInput = {
    id_ins?: SortOrder
    id_usu_ins?: SortOrder
    id_eve_ins?: SortOrder
    est_ins?: SortOrder
    fec_ins?: SortOrder
    fec_pag_ins?: SortOrder
    cer_eve_env?: SortOrder
    car_mot_usu?: SortOrder
  }

  export type inscripcionMaxOrderByAggregateInput = {
    id_ins?: SortOrder
    id_usu_ins?: SortOrder
    id_eve_ins?: SortOrder
    est_ins?: SortOrder
    fec_ins?: SortOrder
    fec_pag_ins?: SortOrder
    cer_eve_env?: SortOrder
    car_mot_usu?: SortOrder
  }

  export type inscripcionMinOrderByAggregateInput = {
    id_ins?: SortOrder
    id_usu_ins?: SortOrder
    id_eve_ins?: SortOrder
    est_ins?: SortOrder
    fec_ins?: SortOrder
    fec_pag_ins?: SortOrder
    cer_eve_env?: SortOrder
    car_mot_usu?: SortOrder
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

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
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

  export type InscripcionScalarRelationFilter = {
    is?: inscripcionWhereInput
    isNot?: inscripcionWhereInput
  }

  export type inscripcion_cursoCountOrderByAggregateInput = {
    id_ins_cur?: SortOrder
    not_fin_usu?: SortOrder
    por_asi_fin_usu?: SortOrder
  }

  export type inscripcion_cursoAvgOrderByAggregateInput = {
    not_fin_usu?: SortOrder
    por_asi_fin_usu?: SortOrder
  }

  export type inscripcion_cursoMaxOrderByAggregateInput = {
    id_ins_cur?: SortOrder
    not_fin_usu?: SortOrder
    por_asi_fin_usu?: SortOrder
  }

  export type inscripcion_cursoMinOrderByAggregateInput = {
    id_ins_cur?: SortOrder
    not_fin_usu?: SortOrder
    por_asi_fin_usu?: SortOrder
  }

  export type inscripcion_cursoSumOrderByAggregateInput = {
    not_fin_usu?: SortOrder
    por_asi_fin_usu?: SortOrder
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

  export type CarreraListRelationFilter = {
    every?: carreraWhereInput
    some?: carreraWhereInput
    none?: carreraWhereInput
  }

  export type carreraOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type facultadCountOrderByAggregateInput = {
    id_fac?: SortOrder
    nom_fac?: SortOrder
    des_fac?: SortOrder
    mis_fac?: SortOrder
    vis_fac?: SortOrder
  }

  export type facultadMaxOrderByAggregateInput = {
    id_fac?: SortOrder
    nom_fac?: SortOrder
    des_fac?: SortOrder
    mis_fac?: SortOrder
    vis_fac?: SortOrder
  }

  export type facultadMinOrderByAggregateInput = {
    id_fac?: SortOrder
    nom_fac?: SortOrder
    des_fac?: SortOrder
    mis_fac?: SortOrder
    vis_fac?: SortOrder
  }

  export type carreraCreateNestedOneWithoutUsuarioInput = {
    create?: XOR<carreraCreateWithoutUsuarioInput, carreraUncheckedCreateWithoutUsuarioInput>
    connectOrCreate?: carreraCreateOrConnectWithoutUsuarioInput
    connect?: carreraWhereUniqueInput
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

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type carreraUpdateOneWithoutUsuarioNestedInput = {
    create?: XOR<carreraCreateWithoutUsuarioInput, carreraUncheckedCreateWithoutUsuarioInput>
    connectOrCreate?: carreraCreateOrConnectWithoutUsuarioInput
    upsert?: carreraUpsertWithoutUsuarioInput
    disconnect?: carreraWhereInput | boolean
    delete?: carreraWhereInput | boolean
    connect?: carreraWhereUniqueInput
    update?: XOR<XOR<carreraUpdateToOneWithWhereWithoutUsuarioInput, carreraUpdateWithoutUsuarioInput>, carreraUncheckedUpdateWithoutUsuarioInput>
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

  export type facultadCreateNestedOneWithoutCarrerasInput = {
    create?: XOR<facultadCreateWithoutCarrerasInput, facultadUncheckedCreateWithoutCarrerasInput>
    connectOrCreate?: facultadCreateOrConnectWithoutCarrerasInput
    connect?: facultadWhereUniqueInput
  }

  export type usuarioCreateNestedManyWithoutCarreraInput = {
    create?: XOR<usuarioCreateWithoutCarreraInput, usuarioUncheckedCreateWithoutCarreraInput> | usuarioCreateWithoutCarreraInput[] | usuarioUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: usuarioCreateOrConnectWithoutCarreraInput | usuarioCreateOrConnectWithoutCarreraInput[]
    createMany?: usuarioCreateManyCarreraInputEnvelope
    connect?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
  }

  export type evento_carreraCreateNestedManyWithoutCarreraInput = {
    create?: XOR<evento_carreraCreateWithoutCarreraInput, evento_carreraUncheckedCreateWithoutCarreraInput> | evento_carreraCreateWithoutCarreraInput[] | evento_carreraUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutCarreraInput | evento_carreraCreateOrConnectWithoutCarreraInput[]
    createMany?: evento_carreraCreateManyCarreraInputEnvelope
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
  }

  export type usuarioUncheckedCreateNestedManyWithoutCarreraInput = {
    create?: XOR<usuarioCreateWithoutCarreraInput, usuarioUncheckedCreateWithoutCarreraInput> | usuarioCreateWithoutCarreraInput[] | usuarioUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: usuarioCreateOrConnectWithoutCarreraInput | usuarioCreateOrConnectWithoutCarreraInput[]
    createMany?: usuarioCreateManyCarreraInputEnvelope
    connect?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
  }

  export type evento_carreraUncheckedCreateNestedManyWithoutCarreraInput = {
    create?: XOR<evento_carreraCreateWithoutCarreraInput, evento_carreraUncheckedCreateWithoutCarreraInput> | evento_carreraCreateWithoutCarreraInput[] | evento_carreraUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutCarreraInput | evento_carreraCreateOrConnectWithoutCarreraInput[]
    createMany?: evento_carreraCreateManyCarreraInputEnvelope
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type facultadUpdateOneRequiredWithoutCarrerasNestedInput = {
    create?: XOR<facultadCreateWithoutCarrerasInput, facultadUncheckedCreateWithoutCarrerasInput>
    connectOrCreate?: facultadCreateOrConnectWithoutCarrerasInput
    upsert?: facultadUpsertWithoutCarrerasInput
    connect?: facultadWhereUniqueInput
    update?: XOR<XOR<facultadUpdateToOneWithWhereWithoutCarrerasInput, facultadUpdateWithoutCarrerasInput>, facultadUncheckedUpdateWithoutCarrerasInput>
  }

  export type usuarioUpdateManyWithoutCarreraNestedInput = {
    create?: XOR<usuarioCreateWithoutCarreraInput, usuarioUncheckedCreateWithoutCarreraInput> | usuarioCreateWithoutCarreraInput[] | usuarioUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: usuarioCreateOrConnectWithoutCarreraInput | usuarioCreateOrConnectWithoutCarreraInput[]
    upsert?: usuarioUpsertWithWhereUniqueWithoutCarreraInput | usuarioUpsertWithWhereUniqueWithoutCarreraInput[]
    createMany?: usuarioCreateManyCarreraInputEnvelope
    set?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    disconnect?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    delete?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    connect?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    update?: usuarioUpdateWithWhereUniqueWithoutCarreraInput | usuarioUpdateWithWhereUniqueWithoutCarreraInput[]
    updateMany?: usuarioUpdateManyWithWhereWithoutCarreraInput | usuarioUpdateManyWithWhereWithoutCarreraInput[]
    deleteMany?: usuarioScalarWhereInput | usuarioScalarWhereInput[]
  }

  export type evento_carreraUpdateManyWithoutCarreraNestedInput = {
    create?: XOR<evento_carreraCreateWithoutCarreraInput, evento_carreraUncheckedCreateWithoutCarreraInput> | evento_carreraCreateWithoutCarreraInput[] | evento_carreraUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutCarreraInput | evento_carreraCreateOrConnectWithoutCarreraInput[]
    upsert?: evento_carreraUpsertWithWhereUniqueWithoutCarreraInput | evento_carreraUpsertWithWhereUniqueWithoutCarreraInput[]
    createMany?: evento_carreraCreateManyCarreraInputEnvelope
    set?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    disconnect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    delete?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    update?: evento_carreraUpdateWithWhereUniqueWithoutCarreraInput | evento_carreraUpdateWithWhereUniqueWithoutCarreraInput[]
    updateMany?: evento_carreraUpdateManyWithWhereWithoutCarreraInput | evento_carreraUpdateManyWithWhereWithoutCarreraInput[]
    deleteMany?: evento_carreraScalarWhereInput | evento_carreraScalarWhereInput[]
  }

  export type usuarioUncheckedUpdateManyWithoutCarreraNestedInput = {
    create?: XOR<usuarioCreateWithoutCarreraInput, usuarioUncheckedCreateWithoutCarreraInput> | usuarioCreateWithoutCarreraInput[] | usuarioUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: usuarioCreateOrConnectWithoutCarreraInput | usuarioCreateOrConnectWithoutCarreraInput[]
    upsert?: usuarioUpsertWithWhereUniqueWithoutCarreraInput | usuarioUpsertWithWhereUniqueWithoutCarreraInput[]
    createMany?: usuarioCreateManyCarreraInputEnvelope
    set?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    disconnect?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    delete?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    connect?: usuarioWhereUniqueInput | usuarioWhereUniqueInput[]
    update?: usuarioUpdateWithWhereUniqueWithoutCarreraInput | usuarioUpdateWithWhereUniqueWithoutCarreraInput[]
    updateMany?: usuarioUpdateManyWithWhereWithoutCarreraInput | usuarioUpdateManyWithWhereWithoutCarreraInput[]
    deleteMany?: usuarioScalarWhereInput | usuarioScalarWhereInput[]
  }

  export type evento_carreraUncheckedUpdateManyWithoutCarreraNestedInput = {
    create?: XOR<evento_carreraCreateWithoutCarreraInput, evento_carreraUncheckedCreateWithoutCarreraInput> | evento_carreraCreateWithoutCarreraInput[] | evento_carreraUncheckedCreateWithoutCarreraInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutCarreraInput | evento_carreraCreateOrConnectWithoutCarreraInput[]
    upsert?: evento_carreraUpsertWithWhereUniqueWithoutCarreraInput | evento_carreraUpsertWithWhereUniqueWithoutCarreraInput[]
    createMany?: evento_carreraCreateManyCarreraInputEnvelope
    set?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    disconnect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    delete?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    update?: evento_carreraUpdateWithWhereUniqueWithoutCarreraInput | evento_carreraUpdateWithWhereUniqueWithoutCarreraInput[]
    updateMany?: evento_carreraUpdateManyWithWhereWithoutCarreraInput | evento_carreraUpdateManyWithWhereWithoutCarreraInput[]
    deleteMany?: evento_carreraScalarWhereInput | evento_carreraScalarWhereInput[]
  }

  export type inscripcionCreateNestedManyWithoutEventoInput = {
    create?: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput> | inscripcionCreateWithoutEventoInput[] | inscripcionUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutEventoInput | inscripcionCreateOrConnectWithoutEventoInput[]
    createMany?: inscripcionCreateManyEventoInputEnvelope
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
  }

  export type evento_carreraCreateNestedManyWithoutEventoInput = {
    create?: XOR<evento_carreraCreateWithoutEventoInput, evento_carreraUncheckedCreateWithoutEventoInput> | evento_carreraCreateWithoutEventoInput[] | evento_carreraUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutEventoInput | evento_carreraCreateOrConnectWithoutEventoInput[]
    createMany?: evento_carreraCreateManyEventoInputEnvelope
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
  }

  export type evento_cursoCreateNestedOneWithoutEventoInput = {
    create?: XOR<evento_cursoCreateWithoutEventoInput, evento_cursoUncheckedCreateWithoutEventoInput>
    connectOrCreate?: evento_cursoCreateOrConnectWithoutEventoInput
    connect?: evento_cursoWhereUniqueInput
  }

  export type inscripcionUncheckedCreateNestedManyWithoutEventoInput = {
    create?: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput> | inscripcionCreateWithoutEventoInput[] | inscripcionUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: inscripcionCreateOrConnectWithoutEventoInput | inscripcionCreateOrConnectWithoutEventoInput[]
    createMany?: inscripcionCreateManyEventoInputEnvelope
    connect?: inscripcionWhereUniqueInput | inscripcionWhereUniqueInput[]
  }

  export type evento_carreraUncheckedCreateNestedManyWithoutEventoInput = {
    create?: XOR<evento_carreraCreateWithoutEventoInput, evento_carreraUncheckedCreateWithoutEventoInput> | evento_carreraCreateWithoutEventoInput[] | evento_carreraUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutEventoInput | evento_carreraCreateOrConnectWithoutEventoInput[]
    createMany?: evento_carreraCreateManyEventoInputEnvelope
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
  }

  export type evento_cursoUncheckedCreateNestedOneWithoutEventoInput = {
    create?: XOR<evento_cursoCreateWithoutEventoInput, evento_cursoUncheckedCreateWithoutEventoInput>
    connectOrCreate?: evento_cursoCreateOrConnectWithoutEventoInput
    connect?: evento_cursoWhereUniqueInput
  }

  export type Enumtipo_eventoFieldUpdateOperationsInput = {
    set?: $Enums.tipo_evento
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type Enumestado_eventoFieldUpdateOperationsInput = {
    set?: $Enums.estado_evento
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type evento_carreraUpdateManyWithoutEventoNestedInput = {
    create?: XOR<evento_carreraCreateWithoutEventoInput, evento_carreraUncheckedCreateWithoutEventoInput> | evento_carreraCreateWithoutEventoInput[] | evento_carreraUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutEventoInput | evento_carreraCreateOrConnectWithoutEventoInput[]
    upsert?: evento_carreraUpsertWithWhereUniqueWithoutEventoInput | evento_carreraUpsertWithWhereUniqueWithoutEventoInput[]
    createMany?: evento_carreraCreateManyEventoInputEnvelope
    set?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    disconnect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    delete?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    update?: evento_carreraUpdateWithWhereUniqueWithoutEventoInput | evento_carreraUpdateWithWhereUniqueWithoutEventoInput[]
    updateMany?: evento_carreraUpdateManyWithWhereWithoutEventoInput | evento_carreraUpdateManyWithWhereWithoutEventoInput[]
    deleteMany?: evento_carreraScalarWhereInput | evento_carreraScalarWhereInput[]
  }

  export type evento_cursoUpdateOneWithoutEventoNestedInput = {
    create?: XOR<evento_cursoCreateWithoutEventoInput, evento_cursoUncheckedCreateWithoutEventoInput>
    connectOrCreate?: evento_cursoCreateOrConnectWithoutEventoInput
    upsert?: evento_cursoUpsertWithoutEventoInput
    disconnect?: evento_cursoWhereInput | boolean
    delete?: evento_cursoWhereInput | boolean
    connect?: evento_cursoWhereUniqueInput
    update?: XOR<XOR<evento_cursoUpdateToOneWithWhereWithoutEventoInput, evento_cursoUpdateWithoutEventoInput>, evento_cursoUncheckedUpdateWithoutEventoInput>
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

  export type evento_carreraUncheckedUpdateManyWithoutEventoNestedInput = {
    create?: XOR<evento_carreraCreateWithoutEventoInput, evento_carreraUncheckedCreateWithoutEventoInput> | evento_carreraCreateWithoutEventoInput[] | evento_carreraUncheckedCreateWithoutEventoInput[]
    connectOrCreate?: evento_carreraCreateOrConnectWithoutEventoInput | evento_carreraCreateOrConnectWithoutEventoInput[]
    upsert?: evento_carreraUpsertWithWhereUniqueWithoutEventoInput | evento_carreraUpsertWithWhereUniqueWithoutEventoInput[]
    createMany?: evento_carreraCreateManyEventoInputEnvelope
    set?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    disconnect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    delete?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    connect?: evento_carreraWhereUniqueInput | evento_carreraWhereUniqueInput[]
    update?: evento_carreraUpdateWithWhereUniqueWithoutEventoInput | evento_carreraUpdateWithWhereUniqueWithoutEventoInput[]
    updateMany?: evento_carreraUpdateManyWithWhereWithoutEventoInput | evento_carreraUpdateManyWithWhereWithoutEventoInput[]
    deleteMany?: evento_carreraScalarWhereInput | evento_carreraScalarWhereInput[]
  }

  export type evento_cursoUncheckedUpdateOneWithoutEventoNestedInput = {
    create?: XOR<evento_cursoCreateWithoutEventoInput, evento_cursoUncheckedCreateWithoutEventoInput>
    connectOrCreate?: evento_cursoCreateOrConnectWithoutEventoInput
    upsert?: evento_cursoUpsertWithoutEventoInput
    disconnect?: evento_cursoWhereInput | boolean
    delete?: evento_cursoWhereInput | boolean
    connect?: evento_cursoWhereUniqueInput
    update?: XOR<XOR<evento_cursoUpdateToOneWithWhereWithoutEventoInput, evento_cursoUpdateWithoutEventoInput>, evento_cursoUncheckedUpdateWithoutEventoInput>
  }

  export type eventoCreateNestedOneWithoutEventos_cursoInput = {
    create?: XOR<eventoCreateWithoutEventos_cursoInput, eventoUncheckedCreateWithoutEventos_cursoInput>
    connectOrCreate?: eventoCreateOrConnectWithoutEventos_cursoInput
    connect?: eventoWhereUniqueInput
  }

  export type eventoUpdateOneRequiredWithoutEventos_cursoNestedInput = {
    create?: XOR<eventoCreateWithoutEventos_cursoInput, eventoUncheckedCreateWithoutEventos_cursoInput>
    connectOrCreate?: eventoCreateOrConnectWithoutEventos_cursoInput
    upsert?: eventoUpsertWithoutEventos_cursoInput
    connect?: eventoWhereUniqueInput
    update?: XOR<XOR<eventoUpdateToOneWithWhereWithoutEventos_cursoInput, eventoUpdateWithoutEventos_cursoInput>, eventoUncheckedUpdateWithoutEventos_cursoInput>
  }

  export type carreraCreateNestedOneWithoutEventosInput = {
    create?: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
    connectOrCreate?: carreraCreateOrConnectWithoutEventosInput
    connect?: carreraWhereUniqueInput
  }

  export type eventoCreateNestedOneWithoutEventos_carreraInput = {
    create?: XOR<eventoCreateWithoutEventos_carreraInput, eventoUncheckedCreateWithoutEventos_carreraInput>
    connectOrCreate?: eventoCreateOrConnectWithoutEventos_carreraInput
    connect?: eventoWhereUniqueInput
  }

  export type carreraUpdateOneRequiredWithoutEventosNestedInput = {
    create?: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
    connectOrCreate?: carreraCreateOrConnectWithoutEventosInput
    upsert?: carreraUpsertWithoutEventosInput
    connect?: carreraWhereUniqueInput
    update?: XOR<XOR<carreraUpdateToOneWithWhereWithoutEventosInput, carreraUpdateWithoutEventosInput>, carreraUncheckedUpdateWithoutEventosInput>
  }

  export type eventoUpdateOneRequiredWithoutEventos_carreraNestedInput = {
    create?: XOR<eventoCreateWithoutEventos_carreraInput, eventoUncheckedCreateWithoutEventos_carreraInput>
    connectOrCreate?: eventoCreateOrConnectWithoutEventos_carreraInput
    upsert?: eventoUpsertWithoutEventos_carreraInput
    connect?: eventoWhereUniqueInput
    update?: XOR<XOR<eventoUpdateToOneWithWhereWithoutEventos_carreraInput, eventoUpdateWithoutEventos_carreraInput>, eventoUncheckedUpdateWithoutEventos_carreraInput>
  }

  export type usuarioCreateNestedOneWithoutInscripcionesInput = {
    create?: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
    connectOrCreate?: usuarioCreateOrConnectWithoutInscripcionesInput
    connect?: usuarioWhereUniqueInput
  }

  export type eventoCreateNestedOneWithoutInscritosInput = {
    create?: XOR<eventoCreateWithoutInscritosInput, eventoUncheckedCreateWithoutInscritosInput>
    connectOrCreate?: eventoCreateOrConnectWithoutInscritosInput
    connect?: eventoWhereUniqueInput
  }

  export type inscripcion_cursoCreateNestedOneWithoutInscripcionInput = {
    create?: XOR<inscripcion_cursoCreateWithoutInscripcionInput, inscripcion_cursoUncheckedCreateWithoutInscripcionInput>
    connectOrCreate?: inscripcion_cursoCreateOrConnectWithoutInscripcionInput
    connect?: inscripcion_cursoWhereUniqueInput
  }

  export type inscripcion_cursoUncheckedCreateNestedOneWithoutInscripcionInput = {
    create?: XOR<inscripcion_cursoCreateWithoutInscripcionInput, inscripcion_cursoUncheckedCreateWithoutInscripcionInput>
    connectOrCreate?: inscripcion_cursoCreateOrConnectWithoutInscripcionInput
    connect?: inscripcion_cursoWhereUniqueInput
  }

  export type Enumestado_inscripcionFieldUpdateOperationsInput = {
    set?: $Enums.estado_inscripcion
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type usuarioUpdateOneRequiredWithoutInscripcionesNestedInput = {
    create?: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
    connectOrCreate?: usuarioCreateOrConnectWithoutInscripcionesInput
    upsert?: usuarioUpsertWithoutInscripcionesInput
    connect?: usuarioWhereUniqueInput
    update?: XOR<XOR<usuarioUpdateToOneWithWhereWithoutInscripcionesInput, usuarioUpdateWithoutInscripcionesInput>, usuarioUncheckedUpdateWithoutInscripcionesInput>
  }

  export type eventoUpdateOneRequiredWithoutInscritosNestedInput = {
    create?: XOR<eventoCreateWithoutInscritosInput, eventoUncheckedCreateWithoutInscritosInput>
    connectOrCreate?: eventoCreateOrConnectWithoutInscritosInput
    upsert?: eventoUpsertWithoutInscritosInput
    connect?: eventoWhereUniqueInput
    update?: XOR<XOR<eventoUpdateToOneWithWhereWithoutInscritosInput, eventoUpdateWithoutInscritosInput>, eventoUncheckedUpdateWithoutInscritosInput>
  }

  export type inscripcion_cursoUpdateOneWithoutInscripcionNestedInput = {
    create?: XOR<inscripcion_cursoCreateWithoutInscripcionInput, inscripcion_cursoUncheckedCreateWithoutInscripcionInput>
    connectOrCreate?: inscripcion_cursoCreateOrConnectWithoutInscripcionInput
    upsert?: inscripcion_cursoUpsertWithoutInscripcionInput
    disconnect?: inscripcion_cursoWhereInput | boolean
    delete?: inscripcion_cursoWhereInput | boolean
    connect?: inscripcion_cursoWhereUniqueInput
    update?: XOR<XOR<inscripcion_cursoUpdateToOneWithWhereWithoutInscripcionInput, inscripcion_cursoUpdateWithoutInscripcionInput>, inscripcion_cursoUncheckedUpdateWithoutInscripcionInput>
  }

  export type inscripcion_cursoUncheckedUpdateOneWithoutInscripcionNestedInput = {
    create?: XOR<inscripcion_cursoCreateWithoutInscripcionInput, inscripcion_cursoUncheckedCreateWithoutInscripcionInput>
    connectOrCreate?: inscripcion_cursoCreateOrConnectWithoutInscripcionInput
    upsert?: inscripcion_cursoUpsertWithoutInscripcionInput
    disconnect?: inscripcion_cursoWhereInput | boolean
    delete?: inscripcion_cursoWhereInput | boolean
    connect?: inscripcion_cursoWhereUniqueInput
    update?: XOR<XOR<inscripcion_cursoUpdateToOneWithWhereWithoutInscripcionInput, inscripcion_cursoUpdateWithoutInscripcionInput>, inscripcion_cursoUncheckedUpdateWithoutInscripcionInput>
  }

  export type inscripcionCreateNestedOneWithoutInscripcion_cursoInput = {
    create?: XOR<inscripcionCreateWithoutInscripcion_cursoInput, inscripcionUncheckedCreateWithoutInscripcion_cursoInput>
    connectOrCreate?: inscripcionCreateOrConnectWithoutInscripcion_cursoInput
    connect?: inscripcionWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type inscripcionUpdateOneRequiredWithoutInscripcion_cursoNestedInput = {
    create?: XOR<inscripcionCreateWithoutInscripcion_cursoInput, inscripcionUncheckedCreateWithoutInscripcion_cursoInput>
    connectOrCreate?: inscripcionCreateOrConnectWithoutInscripcion_cursoInput
    upsert?: inscripcionUpsertWithoutInscripcion_cursoInput
    connect?: inscripcionWhereUniqueInput
    update?: XOR<XOR<inscripcionUpdateToOneWithWhereWithoutInscripcion_cursoInput, inscripcionUpdateWithoutInscripcion_cursoInput>, inscripcionUncheckedUpdateWithoutInscripcion_cursoInput>
  }

  export type carreraCreateNestedManyWithoutFacultadInput = {
    create?: XOR<carreraCreateWithoutFacultadInput, carreraUncheckedCreateWithoutFacultadInput> | carreraCreateWithoutFacultadInput[] | carreraUncheckedCreateWithoutFacultadInput[]
    connectOrCreate?: carreraCreateOrConnectWithoutFacultadInput | carreraCreateOrConnectWithoutFacultadInput[]
    createMany?: carreraCreateManyFacultadInputEnvelope
    connect?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
  }

  export type carreraUncheckedCreateNestedManyWithoutFacultadInput = {
    create?: XOR<carreraCreateWithoutFacultadInput, carreraUncheckedCreateWithoutFacultadInput> | carreraCreateWithoutFacultadInput[] | carreraUncheckedCreateWithoutFacultadInput[]
    connectOrCreate?: carreraCreateOrConnectWithoutFacultadInput | carreraCreateOrConnectWithoutFacultadInput[]
    createMany?: carreraCreateManyFacultadInputEnvelope
    connect?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
  }

  export type carreraUpdateManyWithoutFacultadNestedInput = {
    create?: XOR<carreraCreateWithoutFacultadInput, carreraUncheckedCreateWithoutFacultadInput> | carreraCreateWithoutFacultadInput[] | carreraUncheckedCreateWithoutFacultadInput[]
    connectOrCreate?: carreraCreateOrConnectWithoutFacultadInput | carreraCreateOrConnectWithoutFacultadInput[]
    upsert?: carreraUpsertWithWhereUniqueWithoutFacultadInput | carreraUpsertWithWhereUniqueWithoutFacultadInput[]
    createMany?: carreraCreateManyFacultadInputEnvelope
    set?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    disconnect?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    delete?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    connect?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    update?: carreraUpdateWithWhereUniqueWithoutFacultadInput | carreraUpdateWithWhereUniqueWithoutFacultadInput[]
    updateMany?: carreraUpdateManyWithWhereWithoutFacultadInput | carreraUpdateManyWithWhereWithoutFacultadInput[]
    deleteMany?: carreraScalarWhereInput | carreraScalarWhereInput[]
  }

  export type carreraUncheckedUpdateManyWithoutFacultadNestedInput = {
    create?: XOR<carreraCreateWithoutFacultadInput, carreraUncheckedCreateWithoutFacultadInput> | carreraCreateWithoutFacultadInput[] | carreraUncheckedCreateWithoutFacultadInput[]
    connectOrCreate?: carreraCreateOrConnectWithoutFacultadInput | carreraCreateOrConnectWithoutFacultadInput[]
    upsert?: carreraUpsertWithWhereUniqueWithoutFacultadInput | carreraUpsertWithWhereUniqueWithoutFacultadInput[]
    createMany?: carreraCreateManyFacultadInputEnvelope
    set?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    disconnect?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    delete?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    connect?: carreraWhereUniqueInput | carreraWhereUniqueInput[]
    update?: carreraUpdateWithWhereUniqueWithoutFacultadInput | carreraUpdateWithWhereUniqueWithoutFacultadInput[]
    updateMany?: carreraUpdateManyWithWhereWithoutFacultadInput | carreraUpdateManyWithWhereWithoutFacultadInput[]
    deleteMany?: carreraScalarWhereInput | carreraScalarWhereInput[]
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

  export type NestedEnumtipo_eventoFilter<$PrismaModel = never> = {
    equals?: $Enums.tipo_evento | Enumtipo_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.tipo_evento[] | ListEnumtipo_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumtipo_eventoFilter<$PrismaModel> | $Enums.tipo_evento
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

  export type NestedEnumestado_eventoFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_evento | Enumestado_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_eventoFilter<$PrismaModel> | $Enums.estado_evento
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

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedEnumestado_eventoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_evento | Enumestado_eventoFieldRefInput<$PrismaModel>
    in?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_evento[] | ListEnumestado_eventoFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_eventoWithAggregatesFilter<$PrismaModel> | $Enums.estado_evento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumestado_eventoFilter<$PrismaModel>
    _max?: NestedEnumestado_eventoFilter<$PrismaModel>
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

  export type NestedEnumestado_inscripcionFilter<$PrismaModel = never> = {
    equals?: $Enums.estado_inscripcion | Enumestado_inscripcionFieldRefInput<$PrismaModel>
    in?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    notIn?: $Enums.estado_inscripcion[] | ListEnumestado_inscripcionFieldRefInput<$PrismaModel>
    not?: NestedEnumestado_inscripcionFilter<$PrismaModel> | $Enums.estado_inscripcion
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
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

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
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

  export type carreraCreateWithoutUsuarioInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    facultad: facultadCreateNestedOneWithoutCarrerasInput
    eventos?: evento_carreraCreateNestedManyWithoutCarreraInput
  }

  export type carreraUncheckedCreateWithoutUsuarioInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    id_fac_per: string
    eventos?: evento_carreraUncheckedCreateNestedManyWithoutCarreraInput
  }

  export type carreraCreateOrConnectWithoutUsuarioInput = {
    where: carreraWhereUniqueInput
    create: XOR<carreraCreateWithoutUsuarioInput, carreraUncheckedCreateWithoutUsuarioInput>
  }

  export type inscripcionCreateWithoutUsuarioInput = {
    id_ins?: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    evento: eventoCreateNestedOneWithoutInscritosInput
    inscripcion_curso?: inscripcion_cursoCreateNestedOneWithoutInscripcionInput
  }

  export type inscripcionUncheckedCreateWithoutUsuarioInput = {
    id_ins?: string
    id_eve_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    inscripcion_curso?: inscripcion_cursoUncheckedCreateNestedOneWithoutInscripcionInput
  }

  export type inscripcionCreateOrConnectWithoutUsuarioInput = {
    where: inscripcionWhereUniqueInput
    create: XOR<inscripcionCreateWithoutUsuarioInput, inscripcionUncheckedCreateWithoutUsuarioInput>
  }

  export type inscripcionCreateManyUsuarioInputEnvelope = {
    data: inscripcionCreateManyUsuarioInput | inscripcionCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type carreraUpsertWithoutUsuarioInput = {
    update: XOR<carreraUpdateWithoutUsuarioInput, carreraUncheckedUpdateWithoutUsuarioInput>
    create: XOR<carreraCreateWithoutUsuarioInput, carreraUncheckedCreateWithoutUsuarioInput>
    where?: carreraWhereInput
  }

  export type carreraUpdateToOneWithWhereWithoutUsuarioInput = {
    where?: carreraWhereInput
    data: XOR<carreraUpdateWithoutUsuarioInput, carreraUncheckedUpdateWithoutUsuarioInput>
  }

  export type carreraUpdateWithoutUsuarioInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    facultad?: facultadUpdateOneRequiredWithoutCarrerasNestedInput
    eventos?: evento_carreraUpdateManyWithoutCarreraNestedInput
  }

  export type carreraUncheckedUpdateWithoutUsuarioInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    id_fac_per?: StringFieldUpdateOperationsInput | string
    eventos?: evento_carreraUncheckedUpdateManyWithoutCarreraNestedInput
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
    id_usu_ins?: StringFilter<"inscripcion"> | string
    id_eve_ins?: StringFilter<"inscripcion"> | string
    est_ins?: Enumestado_inscripcionFilter<"inscripcion"> | $Enums.estado_inscripcion
    fec_ins?: DateTimeFilter<"inscripcion"> | Date | string
    fec_pag_ins?: DateTimeNullableFilter<"inscripcion"> | Date | string | null
    cer_eve_env?: BoolFilter<"inscripcion"> | boolean
    car_mot_usu?: StringNullableFilter<"inscripcion"> | string | null
  }

  export type facultadCreateWithoutCarrerasInput = {
    id_fac?: string
    nom_fac: string
    des_fac: string
    mis_fac: string
    vis_fac: string
  }

  export type facultadUncheckedCreateWithoutCarrerasInput = {
    id_fac?: string
    nom_fac: string
    des_fac: string
    mis_fac: string
    vis_fac: string
  }

  export type facultadCreateOrConnectWithoutCarrerasInput = {
    where: facultadWhereUniqueInput
    create: XOR<facultadCreateWithoutCarrerasInput, facultadUncheckedCreateWithoutCarrerasInput>
  }

  export type usuarioCreateWithoutCarreraInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
    com_usu?: string | null
    inscripciones?: inscripcionCreateNestedManyWithoutUsuarioInput
  }

  export type usuarioUncheckedCreateWithoutCarreraInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
    com_usu?: string | null
    inscripciones?: inscripcionUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type usuarioCreateOrConnectWithoutCarreraInput = {
    where: usuarioWhereUniqueInput
    create: XOR<usuarioCreateWithoutCarreraInput, usuarioUncheckedCreateWithoutCarreraInput>
  }

  export type usuarioCreateManyCarreraInputEnvelope = {
    data: usuarioCreateManyCarreraInput | usuarioCreateManyCarreraInput[]
    skipDuplicates?: boolean
  }

  export type evento_carreraCreateWithoutCarreraInput = {
    id_eve_car?: string
    fec_aso?: Date | string
    evento: eventoCreateNestedOneWithoutEventos_carreraInput
  }

  export type evento_carreraUncheckedCreateWithoutCarreraInput = {
    id_eve_car?: string
    id_eve_aso: string
    fec_aso?: Date | string
  }

  export type evento_carreraCreateOrConnectWithoutCarreraInput = {
    where: evento_carreraWhereUniqueInput
    create: XOR<evento_carreraCreateWithoutCarreraInput, evento_carreraUncheckedCreateWithoutCarreraInput>
  }

  export type evento_carreraCreateManyCarreraInputEnvelope = {
    data: evento_carreraCreateManyCarreraInput | evento_carreraCreateManyCarreraInput[]
    skipDuplicates?: boolean
  }

  export type facultadUpsertWithoutCarrerasInput = {
    update: XOR<facultadUpdateWithoutCarrerasInput, facultadUncheckedUpdateWithoutCarrerasInput>
    create: XOR<facultadCreateWithoutCarrerasInput, facultadUncheckedCreateWithoutCarrerasInput>
    where?: facultadWhereInput
  }

  export type facultadUpdateToOneWithWhereWithoutCarrerasInput = {
    where?: facultadWhereInput
    data: XOR<facultadUpdateWithoutCarrerasInput, facultadUncheckedUpdateWithoutCarrerasInput>
  }

  export type facultadUpdateWithoutCarrerasInput = {
    id_fac?: StringFieldUpdateOperationsInput | string
    nom_fac?: StringFieldUpdateOperationsInput | string
    des_fac?: StringFieldUpdateOperationsInput | string
    mis_fac?: StringFieldUpdateOperationsInput | string
    vis_fac?: StringFieldUpdateOperationsInput | string
  }

  export type facultadUncheckedUpdateWithoutCarrerasInput = {
    id_fac?: StringFieldUpdateOperationsInput | string
    nom_fac?: StringFieldUpdateOperationsInput | string
    des_fac?: StringFieldUpdateOperationsInput | string
    mis_fac?: StringFieldUpdateOperationsInput | string
    vis_fac?: StringFieldUpdateOperationsInput | string
  }

  export type usuarioUpsertWithWhereUniqueWithoutCarreraInput = {
    where: usuarioWhereUniqueInput
    update: XOR<usuarioUpdateWithoutCarreraInput, usuarioUncheckedUpdateWithoutCarreraInput>
    create: XOR<usuarioCreateWithoutCarreraInput, usuarioUncheckedCreateWithoutCarreraInput>
  }

  export type usuarioUpdateWithWhereUniqueWithoutCarreraInput = {
    where: usuarioWhereUniqueInput
    data: XOR<usuarioUpdateWithoutCarreraInput, usuarioUncheckedUpdateWithoutCarreraInput>
  }

  export type usuarioUpdateManyWithWhereWithoutCarreraInput = {
    where: usuarioScalarWhereInput
    data: XOR<usuarioUpdateManyMutationInput, usuarioUncheckedUpdateManyWithoutCarreraInput>
  }

  export type usuarioScalarWhereInput = {
    AND?: usuarioScalarWhereInput | usuarioScalarWhereInput[]
    OR?: usuarioScalarWhereInput[]
    NOT?: usuarioScalarWhereInput | usuarioScalarWhereInput[]
    id_usu?: StringFilter<"usuario"> | string
    ced_usu?: StringFilter<"usuario"> | string
    nom_usu?: StringFilter<"usuario"> | string
    ape_usu?: StringFilter<"usuario"> | string
    cor_usu?: StringFilter<"usuario"> | string
    con_usu?: StringFilter<"usuario"> | string
    cel_usu?: StringFilter<"usuario"> | string
    rol_usu?: Enumrol_usuarioFilter<"usuario"> | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFilter<"usuario"> | Date | string
    com_usu?: StringNullableFilter<"usuario"> | string | null
    id_car_est?: StringNullableFilter<"usuario"> | string | null
  }

  export type evento_carreraUpsertWithWhereUniqueWithoutCarreraInput = {
    where: evento_carreraWhereUniqueInput
    update: XOR<evento_carreraUpdateWithoutCarreraInput, evento_carreraUncheckedUpdateWithoutCarreraInput>
    create: XOR<evento_carreraCreateWithoutCarreraInput, evento_carreraUncheckedCreateWithoutCarreraInput>
  }

  export type evento_carreraUpdateWithWhereUniqueWithoutCarreraInput = {
    where: evento_carreraWhereUniqueInput
    data: XOR<evento_carreraUpdateWithoutCarreraInput, evento_carreraUncheckedUpdateWithoutCarreraInput>
  }

  export type evento_carreraUpdateManyWithWhereWithoutCarreraInput = {
    where: evento_carreraScalarWhereInput
    data: XOR<evento_carreraUpdateManyMutationInput, evento_carreraUncheckedUpdateManyWithoutCarreraInput>
  }

  export type evento_carreraScalarWhereInput = {
    AND?: evento_carreraScalarWhereInput | evento_carreraScalarWhereInput[]
    OR?: evento_carreraScalarWhereInput[]
    NOT?: evento_carreraScalarWhereInput | evento_carreraScalarWhereInput[]
    id_eve_car?: StringFilter<"evento_carrera"> | string
    id_car_aso?: StringFilter<"evento_carrera"> | string
    id_eve_aso?: StringFilter<"evento_carrera"> | string
    fec_aso?: DateTimeFilter<"evento_carrera"> | Date | string
  }

  export type inscripcionCreateWithoutEventoInput = {
    id_ins?: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    usuario: usuarioCreateNestedOneWithoutInscripcionesInput
    inscripcion_curso?: inscripcion_cursoCreateNestedOneWithoutInscripcionInput
  }

  export type inscripcionUncheckedCreateWithoutEventoInput = {
    id_ins?: string
    id_usu_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    inscripcion_curso?: inscripcion_cursoUncheckedCreateNestedOneWithoutInscripcionInput
  }

  export type inscripcionCreateOrConnectWithoutEventoInput = {
    where: inscripcionWhereUniqueInput
    create: XOR<inscripcionCreateWithoutEventoInput, inscripcionUncheckedCreateWithoutEventoInput>
  }

  export type inscripcionCreateManyEventoInputEnvelope = {
    data: inscripcionCreateManyEventoInput | inscripcionCreateManyEventoInput[]
    skipDuplicates?: boolean
  }

  export type evento_carreraCreateWithoutEventoInput = {
    id_eve_car?: string
    fec_aso?: Date | string
    carrera: carreraCreateNestedOneWithoutEventosInput
  }

  export type evento_carreraUncheckedCreateWithoutEventoInput = {
    id_eve_car?: string
    id_car_aso: string
    fec_aso?: Date | string
  }

  export type evento_carreraCreateOrConnectWithoutEventoInput = {
    where: evento_carreraWhereUniqueInput
    create: XOR<evento_carreraCreateWithoutEventoInput, evento_carreraUncheckedCreateWithoutEventoInput>
  }

  export type evento_carreraCreateManyEventoInputEnvelope = {
    data: evento_carreraCreateManyEventoInput | evento_carreraCreateManyEventoInput[]
    skipDuplicates?: boolean
  }

  export type evento_cursoCreateWithoutEventoInput = {
    not_min_cur: number
  }

  export type evento_cursoUncheckedCreateWithoutEventoInput = {
    not_min_cur: number
  }

  export type evento_cursoCreateOrConnectWithoutEventoInput = {
    where: evento_cursoWhereUniqueInput
    create: XOR<evento_cursoCreateWithoutEventoInput, evento_cursoUncheckedCreateWithoutEventoInput>
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

  export type evento_carreraUpsertWithWhereUniqueWithoutEventoInput = {
    where: evento_carreraWhereUniqueInput
    update: XOR<evento_carreraUpdateWithoutEventoInput, evento_carreraUncheckedUpdateWithoutEventoInput>
    create: XOR<evento_carreraCreateWithoutEventoInput, evento_carreraUncheckedCreateWithoutEventoInput>
  }

  export type evento_carreraUpdateWithWhereUniqueWithoutEventoInput = {
    where: evento_carreraWhereUniqueInput
    data: XOR<evento_carreraUpdateWithoutEventoInput, evento_carreraUncheckedUpdateWithoutEventoInput>
  }

  export type evento_carreraUpdateManyWithWhereWithoutEventoInput = {
    where: evento_carreraScalarWhereInput
    data: XOR<evento_carreraUpdateManyMutationInput, evento_carreraUncheckedUpdateManyWithoutEventoInput>
  }

  export type evento_cursoUpsertWithoutEventoInput = {
    update: XOR<evento_cursoUpdateWithoutEventoInput, evento_cursoUncheckedUpdateWithoutEventoInput>
    create: XOR<evento_cursoCreateWithoutEventoInput, evento_cursoUncheckedCreateWithoutEventoInput>
    where?: evento_cursoWhereInput
  }

  export type evento_cursoUpdateToOneWithWhereWithoutEventoInput = {
    where?: evento_cursoWhereInput
    data: XOR<evento_cursoUpdateWithoutEventoInput, evento_cursoUncheckedUpdateWithoutEventoInput>
  }

  export type evento_cursoUpdateWithoutEventoInput = {
    not_min_cur?: FloatFieldUpdateOperationsInput | number
  }

  export type evento_cursoUncheckedUpdateWithoutEventoInput = {
    not_min_cur?: FloatFieldUpdateOperationsInput | number
  }

  export type eventoCreateWithoutEventos_cursoInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    inscritos?: inscripcionCreateNestedManyWithoutEventoInput
    eventos_carrera?: evento_carreraCreateNestedManyWithoutEventoInput
  }

  export type eventoUncheckedCreateWithoutEventos_cursoInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    inscritos?: inscripcionUncheckedCreateNestedManyWithoutEventoInput
    eventos_carrera?: evento_carreraUncheckedCreateNestedManyWithoutEventoInput
  }

  export type eventoCreateOrConnectWithoutEventos_cursoInput = {
    where: eventoWhereUniqueInput
    create: XOR<eventoCreateWithoutEventos_cursoInput, eventoUncheckedCreateWithoutEventos_cursoInput>
  }

  export type eventoUpsertWithoutEventos_cursoInput = {
    update: XOR<eventoUpdateWithoutEventos_cursoInput, eventoUncheckedUpdateWithoutEventos_cursoInput>
    create: XOR<eventoCreateWithoutEventos_cursoInput, eventoUncheckedCreateWithoutEventos_cursoInput>
    where?: eventoWhereInput
  }

  export type eventoUpdateToOneWithWhereWithoutEventos_cursoInput = {
    where?: eventoWhereInput
    data: XOR<eventoUpdateWithoutEventos_cursoInput, eventoUncheckedUpdateWithoutEventos_cursoInput>
  }

  export type eventoUpdateWithoutEventos_cursoInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscritos?: inscripcionUpdateManyWithoutEventoNestedInput
    eventos_carrera?: evento_carreraUpdateManyWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateWithoutEventos_cursoInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscritos?: inscripcionUncheckedUpdateManyWithoutEventoNestedInput
    eventos_carrera?: evento_carreraUncheckedUpdateManyWithoutEventoNestedInput
  }

  export type carreraCreateWithoutEventosInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    facultad: facultadCreateNestedOneWithoutCarrerasInput
    usuario?: usuarioCreateNestedManyWithoutCarreraInput
  }

  export type carreraUncheckedCreateWithoutEventosInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    id_fac_per: string
    usuario?: usuarioUncheckedCreateNestedManyWithoutCarreraInput
  }

  export type carreraCreateOrConnectWithoutEventosInput = {
    where: carreraWhereUniqueInput
    create: XOR<carreraCreateWithoutEventosInput, carreraUncheckedCreateWithoutEventosInput>
  }

  export type eventoCreateWithoutEventos_carreraInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    inscritos?: inscripcionCreateNestedManyWithoutEventoInput
    eventos_curso?: evento_cursoCreateNestedOneWithoutEventoInput
  }

  export type eventoUncheckedCreateWithoutEventos_carreraInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    inscritos?: inscripcionUncheckedCreateNestedManyWithoutEventoInput
    eventos_curso?: evento_cursoUncheckedCreateNestedOneWithoutEventoInput
  }

  export type eventoCreateOrConnectWithoutEventos_carreraInput = {
    where: eventoWhereUniqueInput
    create: XOR<eventoCreateWithoutEventos_carreraInput, eventoUncheckedCreateWithoutEventos_carreraInput>
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
    facultad?: facultadUpdateOneRequiredWithoutCarrerasNestedInput
    usuario?: usuarioUpdateManyWithoutCarreraNestedInput
  }

  export type carreraUncheckedUpdateWithoutEventosInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    id_fac_per?: StringFieldUpdateOperationsInput | string
    usuario?: usuarioUncheckedUpdateManyWithoutCarreraNestedInput
  }

  export type eventoUpsertWithoutEventos_carreraInput = {
    update: XOR<eventoUpdateWithoutEventos_carreraInput, eventoUncheckedUpdateWithoutEventos_carreraInput>
    create: XOR<eventoCreateWithoutEventos_carreraInput, eventoUncheckedCreateWithoutEventos_carreraInput>
    where?: eventoWhereInput
  }

  export type eventoUpdateToOneWithWhereWithoutEventos_carreraInput = {
    where?: eventoWhereInput
    data: XOR<eventoUpdateWithoutEventos_carreraInput, eventoUncheckedUpdateWithoutEventos_carreraInput>
  }

  export type eventoUpdateWithoutEventos_carreraInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscritos?: inscripcionUpdateManyWithoutEventoNestedInput
    eventos_curso?: evento_cursoUpdateOneWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateWithoutEventos_carreraInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    inscritos?: inscripcionUncheckedUpdateManyWithoutEventoNestedInput
    eventos_curso?: evento_cursoUncheckedUpdateOneWithoutEventoNestedInput
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
    com_usu?: string | null
    carrera?: carreraCreateNestedOneWithoutUsuarioInput
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
    com_usu?: string | null
    id_car_est?: string | null
  }

  export type usuarioCreateOrConnectWithoutInscripcionesInput = {
    where: usuarioWhereUniqueInput
    create: XOR<usuarioCreateWithoutInscripcionesInput, usuarioUncheckedCreateWithoutInscripcionesInput>
  }

  export type eventoCreateWithoutInscritosInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    eventos_carrera?: evento_carreraCreateNestedManyWithoutEventoInput
    eventos_curso?: evento_cursoCreateNestedOneWithoutEventoInput
  }

  export type eventoUncheckedCreateWithoutInscritosInput = {
    id_eve?: string
    nom_eve: string
    des_eve?: string | null
    tip_eve: $Enums.tipo_evento
    fec_ini_eve: Date | string
    val_eve: number
    est_eve?: $Enums.estado_evento
    fec_cre_eve?: Date | string
    img_por_eve: string
    dur_hor_eve: number
    por_min_asi_eve: number
    fec_fin_eve: Date | string
    eventos_carrera?: evento_carreraUncheckedCreateNestedManyWithoutEventoInput
    eventos_curso?: evento_cursoUncheckedCreateNestedOneWithoutEventoInput
  }

  export type eventoCreateOrConnectWithoutInscritosInput = {
    where: eventoWhereUniqueInput
    create: XOR<eventoCreateWithoutInscritosInput, eventoUncheckedCreateWithoutInscritosInput>
  }

  export type inscripcion_cursoCreateWithoutInscripcionInput = {
    not_fin_usu?: number | null
    por_asi_fin_usu?: number | null
  }

  export type inscripcion_cursoUncheckedCreateWithoutInscripcionInput = {
    not_fin_usu?: number | null
    por_asi_fin_usu?: number | null
  }

  export type inscripcion_cursoCreateOrConnectWithoutInscripcionInput = {
    where: inscripcion_cursoWhereUniqueInput
    create: XOR<inscripcion_cursoCreateWithoutInscripcionInput, inscripcion_cursoUncheckedCreateWithoutInscripcionInput>
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
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    carrera?: carreraUpdateOneWithoutUsuarioNestedInput
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
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    id_car_est?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type eventoUpsertWithoutInscritosInput = {
    update: XOR<eventoUpdateWithoutInscritosInput, eventoUncheckedUpdateWithoutInscritosInput>
    create: XOR<eventoCreateWithoutInscritosInput, eventoUncheckedCreateWithoutInscritosInput>
    where?: eventoWhereInput
  }

  export type eventoUpdateToOneWithWhereWithoutInscritosInput = {
    where?: eventoWhereInput
    data: XOR<eventoUpdateWithoutInscritosInput, eventoUncheckedUpdateWithoutInscritosInput>
  }

  export type eventoUpdateWithoutInscritosInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    eventos_carrera?: evento_carreraUpdateManyWithoutEventoNestedInput
    eventos_curso?: evento_cursoUpdateOneWithoutEventoNestedInput
  }

  export type eventoUncheckedUpdateWithoutInscritosInput = {
    id_eve?: StringFieldUpdateOperationsInput | string
    nom_eve?: StringFieldUpdateOperationsInput | string
    des_eve?: NullableStringFieldUpdateOperationsInput | string | null
    tip_eve?: Enumtipo_eventoFieldUpdateOperationsInput | $Enums.tipo_evento
    fec_ini_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    val_eve?: FloatFieldUpdateOperationsInput | number
    est_eve?: Enumestado_eventoFieldUpdateOperationsInput | $Enums.estado_evento
    fec_cre_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    img_por_eve?: StringFieldUpdateOperationsInput | string
    dur_hor_eve?: IntFieldUpdateOperationsInput | number
    por_min_asi_eve?: FloatFieldUpdateOperationsInput | number
    fec_fin_eve?: DateTimeFieldUpdateOperationsInput | Date | string
    eventos_carrera?: evento_carreraUncheckedUpdateManyWithoutEventoNestedInput
    eventos_curso?: evento_cursoUncheckedUpdateOneWithoutEventoNestedInput
  }

  export type inscripcion_cursoUpsertWithoutInscripcionInput = {
    update: XOR<inscripcion_cursoUpdateWithoutInscripcionInput, inscripcion_cursoUncheckedUpdateWithoutInscripcionInput>
    create: XOR<inscripcion_cursoCreateWithoutInscripcionInput, inscripcion_cursoUncheckedCreateWithoutInscripcionInput>
    where?: inscripcion_cursoWhereInput
  }

  export type inscripcion_cursoUpdateToOneWithWhereWithoutInscripcionInput = {
    where?: inscripcion_cursoWhereInput
    data: XOR<inscripcion_cursoUpdateWithoutInscripcionInput, inscripcion_cursoUncheckedUpdateWithoutInscripcionInput>
  }

  export type inscripcion_cursoUpdateWithoutInscripcionInput = {
    not_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asi_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type inscripcion_cursoUncheckedUpdateWithoutInscripcionInput = {
    not_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
    por_asi_fin_usu?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type inscripcionCreateWithoutInscripcion_cursoInput = {
    id_ins?: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
    usuario: usuarioCreateNestedOneWithoutInscripcionesInput
    evento: eventoCreateNestedOneWithoutInscritosInput
  }

  export type inscripcionUncheckedCreateWithoutInscripcion_cursoInput = {
    id_ins?: string
    id_usu_ins: string
    id_eve_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
  }

  export type inscripcionCreateOrConnectWithoutInscripcion_cursoInput = {
    where: inscripcionWhereUniqueInput
    create: XOR<inscripcionCreateWithoutInscripcion_cursoInput, inscripcionUncheckedCreateWithoutInscripcion_cursoInput>
  }

  export type inscripcionUpsertWithoutInscripcion_cursoInput = {
    update: XOR<inscripcionUpdateWithoutInscripcion_cursoInput, inscripcionUncheckedUpdateWithoutInscripcion_cursoInput>
    create: XOR<inscripcionCreateWithoutInscripcion_cursoInput, inscripcionUncheckedCreateWithoutInscripcion_cursoInput>
    where?: inscripcionWhereInput
  }

  export type inscripcionUpdateToOneWithWhereWithoutInscripcion_cursoInput = {
    where?: inscripcionWhereInput
    data: XOR<inscripcionUpdateWithoutInscripcion_cursoInput, inscripcionUncheckedUpdateWithoutInscripcion_cursoInput>
  }

  export type inscripcionUpdateWithoutInscripcion_cursoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    usuario?: usuarioUpdateOneRequiredWithoutInscripcionesNestedInput
    evento?: eventoUpdateOneRequiredWithoutInscritosNestedInput
  }

  export type inscripcionUncheckedUpdateWithoutInscripcion_cursoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu_ins?: StringFieldUpdateOperationsInput | string
    id_eve_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type carreraCreateWithoutFacultadInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    usuario?: usuarioCreateNestedManyWithoutCarreraInput
    eventos?: evento_carreraCreateNestedManyWithoutCarreraInput
  }

  export type carreraUncheckedCreateWithoutFacultadInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
    usuario?: usuarioUncheckedCreateNestedManyWithoutCarreraInput
    eventos?: evento_carreraUncheckedCreateNestedManyWithoutCarreraInput
  }

  export type carreraCreateOrConnectWithoutFacultadInput = {
    where: carreraWhereUniqueInput
    create: XOR<carreraCreateWithoutFacultadInput, carreraUncheckedCreateWithoutFacultadInput>
  }

  export type carreraCreateManyFacultadInputEnvelope = {
    data: carreraCreateManyFacultadInput | carreraCreateManyFacultadInput[]
    skipDuplicates?: boolean
  }

  export type carreraUpsertWithWhereUniqueWithoutFacultadInput = {
    where: carreraWhereUniqueInput
    update: XOR<carreraUpdateWithoutFacultadInput, carreraUncheckedUpdateWithoutFacultadInput>
    create: XOR<carreraCreateWithoutFacultadInput, carreraUncheckedCreateWithoutFacultadInput>
  }

  export type carreraUpdateWithWhereUniqueWithoutFacultadInput = {
    where: carreraWhereUniqueInput
    data: XOR<carreraUpdateWithoutFacultadInput, carreraUncheckedUpdateWithoutFacultadInput>
  }

  export type carreraUpdateManyWithWhereWithoutFacultadInput = {
    where: carreraScalarWhereInput
    data: XOR<carreraUpdateManyMutationInput, carreraUncheckedUpdateManyWithoutFacultadInput>
  }

  export type carreraScalarWhereInput = {
    AND?: carreraScalarWhereInput | carreraScalarWhereInput[]
    OR?: carreraScalarWhereInput[]
    NOT?: carreraScalarWhereInput | carreraScalarWhereInput[]
    id_car?: StringFilter<"carrera"> | string
    nom_car?: StringFilter<"carrera"> | string
    est_car?: BoolFilter<"carrera"> | boolean
    fec_cre_car?: DateTimeFilter<"carrera"> | Date | string
    id_fac_per?: StringFilter<"carrera"> | string
  }

  export type inscripcionCreateManyUsuarioInput = {
    id_ins?: string
    id_eve_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
  }

  export type inscripcionUpdateWithoutUsuarioInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    evento?: eventoUpdateOneRequiredWithoutInscritosNestedInput
    inscripcion_curso?: inscripcion_cursoUpdateOneWithoutInscripcionNestedInput
  }

  export type inscripcionUncheckedUpdateWithoutUsuarioInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_eve_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    inscripcion_curso?: inscripcion_cursoUncheckedUpdateOneWithoutInscripcionNestedInput
  }

  export type inscripcionUncheckedUpdateManyWithoutUsuarioInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_eve_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type usuarioCreateManyCarreraInput = {
    id_usu?: string
    ced_usu: string
    nom_usu: string
    ape_usu: string
    cor_usu: string
    con_usu: string
    cel_usu: string
    rol_usu: $Enums.rol_usuario
    fec_cre_usu?: Date | string
    com_usu?: string | null
  }

  export type evento_carreraCreateManyCarreraInput = {
    id_eve_car?: string
    id_eve_aso: string
    fec_aso?: Date | string
  }

  export type usuarioUpdateWithoutCarreraInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    inscripciones?: inscripcionUpdateManyWithoutUsuarioNestedInput
  }

  export type usuarioUncheckedUpdateWithoutCarreraInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
    inscripciones?: inscripcionUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type usuarioUncheckedUpdateManyWithoutCarreraInput = {
    id_usu?: StringFieldUpdateOperationsInput | string
    ced_usu?: StringFieldUpdateOperationsInput | string
    nom_usu?: StringFieldUpdateOperationsInput | string
    ape_usu?: StringFieldUpdateOperationsInput | string
    cor_usu?: StringFieldUpdateOperationsInput | string
    con_usu?: StringFieldUpdateOperationsInput | string
    cel_usu?: StringFieldUpdateOperationsInput | string
    rol_usu?: Enumrol_usuarioFieldUpdateOperationsInput | $Enums.rol_usuario
    fec_cre_usu?: DateTimeFieldUpdateOperationsInput | Date | string
    com_usu?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type evento_carreraUpdateWithoutCarreraInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
    evento?: eventoUpdateOneRequiredWithoutEventos_carreraNestedInput
  }

  export type evento_carreraUncheckedUpdateWithoutCarreraInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    id_eve_aso?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type evento_carreraUncheckedUpdateManyWithoutCarreraInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    id_eve_aso?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type inscripcionCreateManyEventoInput = {
    id_ins?: string
    id_usu_ins: string
    est_ins?: $Enums.estado_inscripcion
    fec_ins?: Date | string
    fec_pag_ins?: Date | string | null
    cer_eve_env?: boolean
    car_mot_usu?: string | null
  }

  export type evento_carreraCreateManyEventoInput = {
    id_eve_car?: string
    id_car_aso: string
    fec_aso?: Date | string
  }

  export type inscripcionUpdateWithoutEventoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    usuario?: usuarioUpdateOneRequiredWithoutInscripcionesNestedInput
    inscripcion_curso?: inscripcion_cursoUpdateOneWithoutInscripcionNestedInput
  }

  export type inscripcionUncheckedUpdateWithoutEventoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
    inscripcion_curso?: inscripcion_cursoUncheckedUpdateOneWithoutInscripcionNestedInput
  }

  export type inscripcionUncheckedUpdateManyWithoutEventoInput = {
    id_ins?: StringFieldUpdateOperationsInput | string
    id_usu_ins?: StringFieldUpdateOperationsInput | string
    est_ins?: Enumestado_inscripcionFieldUpdateOperationsInput | $Enums.estado_inscripcion
    fec_ins?: DateTimeFieldUpdateOperationsInput | Date | string
    fec_pag_ins?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cer_eve_env?: BoolFieldUpdateOperationsInput | boolean
    car_mot_usu?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type evento_carreraUpdateWithoutEventoInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
    carrera?: carreraUpdateOneRequiredWithoutEventosNestedInput
  }

  export type evento_carreraUncheckedUpdateWithoutEventoInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    id_car_aso?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type evento_carreraUncheckedUpdateManyWithoutEventoInput = {
    id_eve_car?: StringFieldUpdateOperationsInput | string
    id_car_aso?: StringFieldUpdateOperationsInput | string
    fec_aso?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type carreraCreateManyFacultadInput = {
    id_car?: string
    nom_car: string
    est_car?: boolean
    fec_cre_car?: Date | string
  }

  export type carreraUpdateWithoutFacultadInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: usuarioUpdateManyWithoutCarreraNestedInput
    eventos?: evento_carreraUpdateManyWithoutCarreraNestedInput
  }

  export type carreraUncheckedUpdateWithoutFacultadInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: usuarioUncheckedUpdateManyWithoutCarreraNestedInput
    eventos?: evento_carreraUncheckedUpdateManyWithoutCarreraNestedInput
  }

  export type carreraUncheckedUpdateManyWithoutFacultadInput = {
    id_car?: StringFieldUpdateOperationsInput | string
    nom_car?: StringFieldUpdateOperationsInput | string
    est_car?: BoolFieldUpdateOperationsInput | boolean
    fec_cre_car?: DateTimeFieldUpdateOperationsInput | Date | string
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