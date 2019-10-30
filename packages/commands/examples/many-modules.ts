import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Command, Commander, CommandModule, CommandService } from "../src";

// ts-node ./examples/many-modules.ts --help
// ts-node ./examples/many-modules.ts user show
@Commander({ name: "user" })
class UserCommander {
  @Command({ name: "show" })
  public show() {
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
  public show() {
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

(async () => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
