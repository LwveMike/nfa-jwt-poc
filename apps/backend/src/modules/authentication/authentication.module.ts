import { Module } from "@nestjs/common";
import { AuthenticationController } from "./authentication.controller";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { AuthenticationService } from "./authentication.service";
import { SessionModule } from "../session/session.module";

@Module({
  imports: [DrizzleModule, SessionModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
