import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandOption, CommandService } from "../src";
// ts-node -T ./examples/config.ts test
@Commander()
class TestCommander {
  @Command({ name: "test" })
  public basic(@CommandOption({ name: "date" }) date: string): void {
    console.log(`Today is ${date}!`);
  }
}
interface TestConfig {
  date: string;
}

@Module({
  imports: [
    CommandModule.register({
      configName: "nest-commands",
      configProcessor: (config: TestConfig): TestConfig => {
        if (typeof config.date === "string" && config.date === "today") {
          config.date = new Date().toDateString();
        }
        return config;
      },
    }),
  ],
  providers: [TestCommander],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
