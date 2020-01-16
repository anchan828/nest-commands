import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandPositional, CommandService } from "../src";

// ts-node -T ./examples/array-positional.ts list test1 test2
@Commander()
class TestCommander {
  @Command({ describe: "array positional", name: "list" })
  public serve(
    @CommandPositional({
      describe: "show files",
      name: "files..",
    })
    files: string[],
  ): void {
    console.log("Run array positional command");
    console.log(files);
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
