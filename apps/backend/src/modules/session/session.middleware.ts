import { ForbiddenException, Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express'
import { z } from 'zod'
import { JwtService, ParsedServices } from '../jwt/jwt.service'
import { SessionService } from './session.service'

interface VerifyAccessTokenArgs {
  token: string
  res: ExpressResponse
}

// const permissionsSchema = z.record(
//   z.string(),
//   z.object({
//     permissions: z.array(z.enum(['read', 'change', 'delete'] as const)),
//     z.record(
//       z.string(),
//     )
//   })
// )

// TODO(lwvemike): maybe reuse the part of the schema from signup
const accessTokenSchema = z.object({
  // services: z.record(z.string(), z.array(z.string())),
  services: z.record(
    z.string(),

  ),
  username: z.string().min(3).max(64),
  exp: z.number().int().positive(),
  iat: z.number().int().positive(),
})

const refreshTokenSchema = z.object({
  sessionId: z.number().int().min(1),
  exp: z.number().int().positive(),
  iat: z.number().int().positive(),
})

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  readonly #logger = new Logger(SessionMiddleware.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) { }

  /**
   * @description To keep this example simple, will pass the request to session service that will set the meta
   */
  async use(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    const accessToken: string | null = req.cookies?.[JwtService.ACCESS_TOKEN_NAME] ?? null
    const refreshToken: string | null = req.cookies?.[JwtService.REFRESH_TOKEN_NAME] ?? null

    if (accessToken === null) {
      this.#logger.warn('No access token found')

      if (refreshToken === null) {
        this.#logger.error('No refresh token found')

        throw new ForbiddenException('You need to login')
      }

      const refreshTokenData = this.#verifyRefreshToken({ token: refreshToken, res })

      await this.#handleSessionUpdate(refreshTokenData.sessionId)

      const { name, value, options } = await this.sessionService.generateAccessToken(refreshTokenData.sessionId, req)

      res.cookie(name, value, options)

      return next()
    }

    this.#logger.log('Token access found')

    if (refreshToken === null) {
      this.#logger.error('No refresh token found')
      res.clearCookie(JwtService.ACCESS_TOKEN_NAME)
      throw new ForbiddenException('You need to login')
    }

    const result = this.#verifyAccessToken({ token: accessToken, res })

    const refreshTokenData = this.#verifyRefreshToken({ token: refreshToken, res })

    if (result.state === 'valid') {
      await this.#handleSessionUpdate(refreshTokenData.sessionId)

      this.sessionService.setMeta(req, result.data)

      return next()
    }

    if (result.state === 'expired') {
      this.#logger.warn('Access token expired')

      const { name, value, options } = await this.sessionService.generateAccessToken(refreshTokenData.sessionId, req)

      res.cookie(name, value, options)
      this.#logger.log('New access token generated with the refresh token')

      return next()
    }

    this.#logger.warn('Invalid access token')

    res.clearCookie(JwtService.ACCESS_TOKEN_NAME)
    res.clearCookie(JwtService.REFRESH_TOKEN_NAME)

    throw new ForbiddenException('Invalid token')
  }

  #verifyAccessToken({ token, res }: VerifyAccessTokenArgs) {
    const decodedAccessToken = this.jwtService.decodeAccessToken(token)

    if (decodedAccessToken.state === 'invalid') {
      this.#logger.warn('Invalid access token')
      res.clearCookie(JwtService.ACCESS_TOKEN_NAME)

      throw new ForbiddenException('Invalid token')
    }

    if (decodedAccessToken.state === 'expired') {
      this.#logger.warn('Access token expired')

      return { state: 'expired', data: null } as const
    }

    // const result = accessTokenSchema.safeParse(decodedAccessToken.data)

    // if (result.success === false) {
    //   this.#logger.error('Invalid access token after validation')

    //   throw new ForbiddenException('Invalid token')
    // }

    return { state: 'valid', data: decodedAccessToken.data as ParsedServices } as const
  }

  #verifyRefreshToken({ token, res }: VerifyAccessTokenArgs) {
    const decodedRefreshToken = this.jwtService.decodeRefreshToken(token)

    if (decodedRefreshToken.state === 'invalid' || decodedRefreshToken.state === 'expired') {
      this.#logger.warn('Invalid refresh token or is expired')
      res.clearCookie(JwtService.REFRESH_TOKEN_NAME)

      throw new ForbiddenException('Invalid refresh token or expired')
    }

    const result = refreshTokenSchema.safeParse(decodedRefreshToken.data)

    if (result.success === false) {
      this.#logger.error('Invalid refresh token after validation')

      throw new ForbiddenException('Invalid refresh token')
    }

    return result.data
  }

  async #handleSessionUpdate(sessionId: number) {
    await this.sessionService.updateSession(sessionId)
  }

  static readonly EXCLUDE_ROUTES = ['/sign-up', '/sign-in']
}
