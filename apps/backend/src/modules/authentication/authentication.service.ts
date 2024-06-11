import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { MySql2Database } from 'drizzle-orm/mysql2'
import { eq } from 'drizzle-orm'
import * as UaParser from 'ua-parser-js'
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'
import { JwtService } from '../jwt/jwt.service'
import * as schema from '../drizzle/schema'
import { SessionService } from '../session/session.service'
import { DATABASE_TAG } from '../drizzle/drizzle.module'

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(DATABASE_TAG) private readonly drizzle: MySql2Database<typeof schema>,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(username: string, password: string) {
    const user = await this.drizzle
      .select()
      .from(schema.user)
      .where(eq(schema.user.username, username))

    if (user.length !== 0) {
      throw new BadRequestException('User with that username already exists')
    }

    await this.drizzle
      .insert(schema.user)
      .values({ username, password })

    return { success: true }
  }

  async signIn(username: string, password: string, req: ExpressRequest, res: ExpressResponse) {
    const users = await this.drizzle
      .select()
      .from(schema.user)
      .where(eq(schema.user.username, username))

    if (users.length === 0) {
      throw new BadRequestException('User with that username does not exist')
    }

    const { 0: user } = users

    if (user.password !== password) {
      throw new BadRequestException('Invalid password')
    }

    const userAgent = req.headers['user-agent']

    const { device, browser, os } = UaParser(userAgent)

    const sessionId = await this.sessionService.createSession({
      userId: user.id,
      device: device.vendor,
      browser: browser.name,
      os: os.name,
      ip: req.ip,
    })

    const accessCookie = await this.jwtService.createAccessCookie({ username: user.username, id: user.id, roleId: user.roleId! })
    const refreshCookie = this.jwtService.createRefreshCookie({ sessionId })

    res.cookie(
      accessCookie.name,
      accessCookie.value,
      accessCookie.options,
    )

    res.cookie(
      refreshCookie.name,
      refreshCookie.value,
      refreshCookie.options,
    )

    return { success: true }
  }
}
