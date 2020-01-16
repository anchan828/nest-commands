import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommanderOption, CommandModule, CommandService } from "../src";

// ts-node -T ./examples/global-options.ts --json test show

@Commander()
class GlobalOptions {
  @CommanderOption({ description: "output as json", name: "json", type: "boolean" })
  public json!: boolean;
}

@Commander({ name: "test" })
class TestCommander {
  constructor(private readonly globalOptions: GlobalOptions) {}

  @Command({ describe: "show data", name: "show" })
  public show(): void {
    console.log("Run global-options command");
    const output = { name: "anchan828" };
    if (this.globalOptions.json) {
      console.log(JSON.stringify(output));
    } else {
      console.table(output);
    }
  }
}

@Module({
  imports: [CommandModule.register()],
  providers: [GlobalOptions, TestCommander],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
