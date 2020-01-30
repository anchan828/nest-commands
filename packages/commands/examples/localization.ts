import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  Command,
  Commander,
  CommanderOption,
  CommandModule,
  CommandOption,
  CommandPositional,
  CommandService,
} from "../src";

// ts-node -T ./examples/localization.ts --help
// ts-node -T ./examples/localization.ts auth --help
@Commander({ describe: "Manage authenticated user", name: "auth" })
class TestCommander {
  @Command({ describe: "Show authenticated user", name: "show" })
  public show(
    @CommandPositional({
      describe: "This is test1 description",
      name: "test1",
    })
    test1: string,
    @CommandOption({
      description: "This is test2 description",
      name: "test2",
    })
    test2: string,
  ): void {
    console.log("Run nested command");
    console.log({ test1, test2 });
  }

  @CommanderOption({ defaultDescription: "Set token", name: "token", type: "string" })
  public token!: string;
}

@Module({
  imports: [
    CommandModule.register({
      locale: "ja_JP",
    }),
  ],
  providers: [TestCommander],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, {
    logger: false,
  });
  app.get(CommandService).exec();
})();
