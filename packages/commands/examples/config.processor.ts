import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  Command,
  Commander,
  CommandModule,
  CommandOption,
  CommandService,
  GlobalConfig,
  GlobalConfigProcessor,
} from "../src";
// ts-node -T ./examples/config.processor.ts test
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

@GlobalConfig({ name: "nest-commands" })
class TestGlobalConfig {
  @GlobalConfigProcessor()
  public async processor(config: TestConfig): Promise<TestConfig> {
    if (config.date === "today") {
      config.date = new Date().toDateString();
    }
    return config;
  }
}

@Module({
  imports: [CommandModule.register()],
  providers: [TestCommander, TestGlobalConfig],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
