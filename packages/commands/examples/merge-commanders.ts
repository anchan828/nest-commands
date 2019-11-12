import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandService } from "../src";

// ts-node ./examples/merge-commanders --help
@Commander()
class TestCommander1 {
  @Command({ name: "test1" })
  public serve(): void {
    console.log("Run test1 command");
  }
}

@Commander()
class TestCommander2 {
  @Command({ name: "test2" })
  public serve(): void {
    console.log("Run test2 command");
  }
}

@Module({
  imports: [CommandModule.register()],
  providers: [TestCommander1, TestCommander2],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
