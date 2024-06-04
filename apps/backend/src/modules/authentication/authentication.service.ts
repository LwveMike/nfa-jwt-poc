import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { DATABASE_TAG } from "../drizzle/drizzle.module";
import * as schema from '../drizzle/schema'
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { table } from "console";
import { MySql2Client, MySql2Database } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { SessionService } from "../session/session.service";
import * as UaParser from 'ua-parser-js';
import { Request } from 'express';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(DATABASE_TAG) private readonly drizzle: MySql2Database<typeof schema> ,
    private readonly sessionService: SessionService
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

  async signIn(username: string, password: string, req: Request) {
    const user = await this.drizzle
      .select()
      .from(schema.user)
      .where(eq(schema.user.username, username))

    if (user.length === 0) {
      throw new BadRequestException('User with that username does not exist')
    }

    if (user[0].password !== password) {
      throw new BadRequestException('Invalid password')
    }

    const userAgent = req.headers['user-agent']

    const { device, browser, os} = UaParser(userAgent)

    const hasSuccesfullyInserted = await this.sessionService.createSession({
      userId: user[0].id,
      device: device.vendor,
      browser: browser.name,
      os: os.name ,
      ip: req.ip
    })

    if (hasSuccesfullyInserted === false) {
      throw new BadRequestException('Failed to create session')
    }

    return { success: true }
  }
}
