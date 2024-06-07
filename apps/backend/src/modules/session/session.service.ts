import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { MySql2Database } from 'drizzle-orm/mysql2'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import * as schema from '../drizzle/schema'
import { DATABASE_TAG } from '../drizzle/drizzle.module'
import { JwtService } from '../jwt/jwt.service'
import { Request as ExpressRequest } from 'express';

type GetMetaReturn = {
  username: string
}

interface CreateSessionArgs {
  userId: number
  device?: string
  browser?: string
  os?: string
  ip?: string
}

@Injectable()
export class SessionService {
  readonly #logger = new Logger(SessionService.name)

  readonly #meta: WeakMap<ExpressRequest, any> = new WeakMap<ExpressRequest, any>()

  constructor(
    @Inject(DATABASE_TAG) private readonly drizzle: MySql2Database<typeof schema>,
    private readonly jwtService: JwtService,
  ) { }

  async createSession({ userId, device, browser, os, ip }: CreateSessionArgs) {
    const { 0: { insertId } } = await this.drizzle
      .insert(schema.session)
      .values({
        userId,
        device,
        browser,
        os,
        ip,
      })

    return insertId
  }

  async tieSession(token: string) {
    const tokenSchema = z.object({
      id: z.number().int().min(1),
      username: z.string(),
    })

    const decodedJwt = this.jwtService.decodeAccessToken(token)

    if (decodedJwt === null) {
      // TODO(lwvemike): handle this case
      this.#logger.error('Invalid token')
      return false
    }

    const result = tokenSchema.safeParse(decodedJwt)

    if (result.success === false) {
      this.#logger.error('Invalid token after validation')
      return false
    }

    const queryResult = await this.drizzle
      .select()
      .from(schema.session)
      .where(eq(schema.session.id, result.data.id))

    if (queryResult.length === 0) {
      this.#logger.error('Session not found')
      return false
    }

    const { 0: session } = queryResult

    if (session.isBlacklisted === true) {
      this.#logger.error('Session is blacklisted')
      return false
    }

    return true
  }

  public async updateSession(sessionId: number) {
    const queriedSessions = await this.drizzle
      .select()
      .from(schema.session)
      .where(eq(schema.session.id, sessionId))

    if (queriedSessions.length === 0) {
      this.#logger.warn('Session not found')

      throw new ForbiddenException('Session not found')
    }

    await this.drizzle
      .update(schema.session)
      .set({ lastAccessedAt: new Date() })
      .where(eq(schema.session.id, sessionId))
    }

  // TODO(lwvemike): here the queries can be optimized, but also the schema should be changed
  public async getSessionUser(sessionId: number) {
    const sessions = await this.drizzle
      .select()
      .from(schema.session)
      .where(eq(schema.session.id, sessionId))

    if (sessions.length === 0) {
      this.#logger.warn('Session not found')

      throw new ForbiddenException('Session not found')
    }

    const { 0: session } = sessions

    const users = await this.drizzle
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, session.userId!))

    if (users.length === 0) {
      this.#logger.warn('User not found')

      throw new ForbiddenException('User not found')
    }

    return users[0]
  }

  public async generateAccessToken(sessionId: number) {
    const user = await this.getSessionUser(sessionId)

    return this.jwtService.createAccessCookie({ username: user.username })
  }

  public getMeta(req: ExpressRequest): GetMetaReturn | null {
    return this.#meta.get(req) ?? null
  }

  public setMeta(req: ExpressRequest, data: GetMetaReturn) {
    this.#meta.set(req, data)
  }
}
