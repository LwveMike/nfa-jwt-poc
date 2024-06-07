import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TokenExpiredError, sign, verify } from 'jsonwebtoken'
import type { CookieOptions } from 'express'
import { Config } from '../configuration/parse-config'

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
}

interface CreateRefreshCookieArgs {
  sessionId: number
}

@Injectable()
export class JwtService {
  readonly #logger = new Logger(JwtService.name)

  constructor(
    private readonly configService: ConfigService,
  ) { }

  #createToken({ payload, privKey, expiresIn}: CreateTokenArgs) {
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
          expiresIn
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

  public createAccessCookie({ username }: CreateAccessCookieArgs) {
    const { privKey, expiry } = this.configService.get<Config['accessKeys']>('accessKeys')!

    const token = this.#createToken({
      privKey,
      payload: {
        username,
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
    const { privKey, expiry} = this.configService.get<Config['refreshKeys']>('refreshKeys')!

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
