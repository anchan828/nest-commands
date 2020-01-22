import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandOption, CommandService, GlobalConfig } from "../src";
// ts-node -T ./examples/config.ts test
@Commander()
class TestCommander {
  @Command({ name: "test" })
  public basic(@CommandOption({ name: "text" }) text: string): void {
    console.log(`hello ${text}!`);
  }
}

@GlobalConfig({
  name: "nest-commands",
  // You can add custom config name without dot
  searchPlaces: ["nest-commands.json"],
})
class TestGlobalConfig {}

@Module({
  imports: [CommandModule.register()],
  providers: [TestCommander, TestGlobalConfig],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
