import { permission } from 'node:process'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TokenExpiredError, sign, verify } from 'jsonwebtoken'
import type { CookieOptions } from 'express'
import { MySql2Database } from 'drizzle-orm/mysql2'
import { and, eq, inArray } from 'drizzle-orm'
import { Config } from '../configuration/parse-config'
import { DATABASE_TAG } from '../drizzle/drizzle.module'
import * as schema from '../drizzle/schema'

type Permission = 'read' | 'change' | 'delete'

interface Service {
  serviceName: string
  permission: Permission[]
}

export type ParsedServices =
  & Record<'permissions', Permission[]>
  & { [serviceName: string]: ParsedServices }

interface AddPermissionsArgs {
  paths: string[]
  collection: ParsedServices
}

// function addPermissions({ paths, collection, service }: AddPermissionsArgs) {
//   paths.forEach((path, index) => {
//     if (paths.length === index + 1) {
//       collection[path] ??= {
//         permissions: [],
//       } as unknown as ParsedServices

//       collection[path].permissions.push(service.permission)

//       return
//     }

//     if (path in collection) {
//       collection[path] ??= {} as ParsedServices

//       return addPermissions({
//         paths: paths.slice(index + 1),
//         collection: collection[path],
//       })
//     }
//   })
// }

function createPermissionAdder(service: Service) {
  return function addPermissions({ paths, collection }: AddPermissionsArgs) {
    console.log(paths)
    paths.forEach((path, index) => {
      if (paths.length === index + 1) {
        collection[path] ??= {
          // @ts-expect-error
          permissions: service.permissions,
        } as unknown as ParsedServices

        // collection[path].permissions.push(service.permission)

        return
      }

      if (path in collection) {
        collection[path] ??= {} as ParsedServices

        return addPermissions({
          paths: paths.slice(index + 1),
          collection: collection[path],
        })
      }
    })
  }
}

function parseServices(services: Service[]): ParsedServices {
  const result = {
    api: {
      permissions: [],
    },
  } as unknown as ParsedServices

  for (const service of services) {
    const addPermissions = createPermissionAdder(service)
    const paths = service.serviceName.split('.')

    console.log(paths)
    addPermissions({ paths, collection: result.api })
  }

  return result
}

type TokenVerificationState =
  | { state: 'valid', data: unknown }
  | { state: 'expired' }
  | { state: 'invalid' }

function createExpires(expirySeconds: number) {
  const dateMs = Date.now()
  const offsetMs = (new Date().getTimezoneOffset()) * 60_000

  const expires = dateMs + expirySeconds * 1_000

  if (Math.sign(offsetMs) === -1) {
    return new Date(expires + Math.abs(offsetMs))
  }

  return new Date(expires - Math.abs(offsetMs))
}

interface CreateTokenArgs {
  payload: Record<string, unknown>
  privKey: string
  expiresIn: number
}

interface CreateAccessCookieArgs {
  username: string
  id: number
  roleId: number
}

interface CreateRefreshCookieArgs {
  sessionId: number
}

@Injectable()
export class JwtService {
  readonly #logger = new Logger(JwtService.name)

  constructor(
    private readonly configService: ConfigService,
    @Inject(DATABASE_TAG) private readonly drizzle: MySql2Database<typeof schema>,
  ) { }

  #createToken({ payload, privKey, expiresIn }: CreateTokenArgs) {
    try {
      const token = sign(
        payload,
        privKey,
        {
          header: {
            typ: 'JWT',
            alg: 'ES256',
          },
          algorithm: 'ES256',
          expiresIn,
        },
      )

      this.#logger.log(`Created new access token`)

      return token
    }
    catch (err: unknown) {
      this.#logger.error('Failed to create access token, most probably this is an internal error')

      if (err instanceof Error) {
        this.#logger.debug(err)
      }

      throw new BadRequestException('Internal Error')
    }
  }

  #createAccessTokenCookieMeta() {
    const { expiry } = this.configService.get<Config['accessKeys']>('accessKeys')!

    return {
      ...JwtService.COOKIE_COMMON_OPTIONS,
      httpOnly: false,
      expires: createExpires(expiry),
    }
  }

  #createRefreshTokenCookieMeta() {
    const { expiry } = this.configService.get<Config['refreshKeys']>('refreshKeys')!

    return {
      ...JwtService.COOKIE_COMMON_OPTIONS,
      httpOnly: true,
      expires: createExpires(expiry),
    }
  }

  // HERE I ADDED some shit code to code it faster
  public async createAccessCookie({ username, roleId }: CreateAccessCookieArgs) {
    const { privKey, expiry } = this.configService.get<Config['accessKeys']>('accessKeys')!

    const result = await this.drizzle
      .select({
        serviceName: schema.services.name,
        permission: schema.servicesPermission.permission,
      })
      .from(schema.role)
      .innerJoin(schema.roleServicesPermissions, eq(schema.role.id, schema.roleServicesPermissions.roleId))
      .innerJoin(schema.servicesPermission, eq(schema.roleServicesPermissions.servicePermissionId, schema.servicesPermission.id))
      .innerJoin(schema.services, eq(schema.servicesPermission.serviceId, schema.services.id))
      .where(eq(schema.role.id, roleId))

    const srv = result.reduce((acc, curr) => {
      // @ts-expect-error
      const srvc = acc.find(s => s.serviceName === curr.serviceName)

      if (srvc === undefined) {
      // @ts-expect-error
        acc.push({
          serviceName: curr.serviceName,
          permissions: [curr.permission],
        })

        return acc
      }

      // @ts-expect-error
      srvc.permissions.push(curr.permission)

      return acc
    }, [])

    const services = parseServices(srv as Service[])

    console.log(services)

    const token = this.#createToken({
      privKey,
      payload: {
        username,
        services,
      },
      expiresIn: expiry,
    })

    return {
      name: JwtService.ACCESS_TOKEN_NAME,
      value: token,
      options: this.#createAccessTokenCookieMeta(),
    }
  }

  public createRefreshCookie({ sessionId }: CreateRefreshCookieArgs) {
    const { privKey, expiry } = this.configService.get<Config['refreshKeys']>('refreshKeys')!

    const token = this.#createToken({
      privKey,
      payload: {
        sessionId,
      },
      expiresIn: expiry,
    })

    return {
      name: JwtService.REFRESH_TOKEN_NAME,
      value: token,
      options: this.#createRefreshTokenCookieMeta(),
    }
  }

  // TODO(lwvemike): make it reusable
  public decodeAccessToken(token: string): TokenVerificationState {
    const { pubKey } = this.configService.get<Config['accessKeys']>('accessKeys')!

    try {
      const data = verify(token, pubKey, {
        algorithms: ['ES256'],
      })

      return { state: 'valid', data }
    }
    catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        this.#logger.warn(`Access token expired at ${err.expiredAt}`)

        return { state: 'expired' }
      }

      this.#logger.warn('Failed to verify access token')

      return { state: 'invalid' }
    }
  }

  public decodeRefreshToken(token: string): TokenVerificationState {
    const { pubKey } = this.configService.get<Config['refreshKeys']>('refreshKeys')!

    try {
      const data = verify(token, pubKey, {
        algorithms: ['ES256'],
      })

      return { state: 'valid', data }
    }
    catch (err: unknown) {
      if (err instanceof TokenExpiredError) {
        this.#logger.warn(`Refresh token expired at ${err.expiredAt}`)

        return { state: 'expired' }
      }

      this.#logger.warn('Failed to verify refresh token')

      return { state: 'invalid' }
    }
  }

  static readonly ACCESS_TOKEN_NAME = 'nfa-access-token'
  static readonly REFRESH_TOKEN_NAME = 'nfa-refresh-token'
  static readonly COOKIE_COMMON_OPTIONS: CookieOptions = {
    sameSite: 'strict',
    secure: true,
    // TODO(lwvemike): look into this
    path: '/',
  }
}
