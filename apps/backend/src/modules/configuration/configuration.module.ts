import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import parseConfig from "./parse-config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [parseConfig],
    }),
  ],
})
export class ConfigurationModule { }
