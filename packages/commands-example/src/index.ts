#! /usr/bin/env node
import { CommandService } from "@anchan828/nest-commands";
import { NestFactory } from "@nestjs/core";
import { ExampleModule } from "./app.module";

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(ExampleModule, {
    logger: false,
  });
  app.get(CommandService).exec();
})();
