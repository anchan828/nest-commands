import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandService } from "../src";

// ts-node -T ./examples/basic.ts basic
@Commander()
class TestCommander {
  @Command({ name: "basic" })
  public basic(): void {
    console.log("hello!");
  }
}

@Module({
  imports: [CommandModule.register()],
  providers: [TestCommander],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
