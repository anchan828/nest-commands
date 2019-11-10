import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandOption, CommandPositional, CommandService } from "../src";

// ts-node ./examples/positional-and-option.ts serve
@Commander()
class TestCommander {
  // See: https://github.com/yargs/yargs#complex-example
  @Command({ describe: "start the server", name: "serve" })
  public serve(
    @CommandPositional({
      default: 5000,
      describe: "port to bind on",
      name: "port",
    })
    port: number,
    @CommandOption({
      alias: "v",
      default: false,
      description: "Run with verbose logging",
      name: "verbose",
      type: "boolean",
    })
    verbose: boolean,
  ): void {
    console.log("Run basic command");
    console.log(`port is ${port}`);
    console.log(`verbose is ${verbose}`);
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
