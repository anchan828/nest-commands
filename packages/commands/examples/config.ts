import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandOption, CommandService } from "../src";
// ts-node -T ./examples/config.ts test
@Commander()
class TestCommander {
  @Command({ name: "test" })
  public basic(@CommandOption({ name: "text" }) text: string): void {
    console.log(`hello ${text}!`);
  }
}

@Module({
  imports: [
    CommandModule.register({
      configName: "nest-commands",
    }),
  ],
  providers: [TestCommander],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
