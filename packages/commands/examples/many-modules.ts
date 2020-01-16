import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandService } from "../src";

// ts-node -T ./examples/many-modules.ts --help
// ts-node -T ./examples/many-modules.ts user show
@Commander({ name: "user" })
class UserCommander {
  @Command({ name: "show" })
  public show(): void {
    console.log("user!");
  }
}

@Module({
  providers: [UserCommander],
})
class UserModule {}

@Commander({ name: "group" })
class GroupCommander {
  @Command({ name: "show" })
  public show(): void {
    console.log("group!");
  }
}

@Module({
  providers: [GroupCommander],
})
class GroupModule {}

@Module({
  imports: [CommandModule.register(), UserModule, GroupModule],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
