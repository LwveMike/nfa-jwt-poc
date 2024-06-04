import { Inject, Injectable } from "@nestjs/common";
import * as schema from '../drizzle/schema'
import { MySql2Database } from "drizzle-orm/mysql2";
import { DATABASE_TAG } from "../drizzle/drizzle.module";

type CreateSessionArgs = {
  userId: number
  device?: string
  browser?: string
  os?: string
  ip?: string
}


@Injectable()
export class SessionService {
  constructor(
    @Inject(DATABASE_TAG) private readonly drizzle: MySql2Database<typeof schema>
  ) { }

  async createSession({ userId, device, browser, os, ip }: CreateSessionArgs) {
    const session = await this.drizzle
      .insert(schema.session)
      .values({
        userId,
        device,
        browser,
        os,
        ip
      })

    return session[0].affectedRows === 1
  }
}
