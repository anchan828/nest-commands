import {
  Command,
  Commander,
  CommanderOption,
  CommandModule,
  CommandOption,
  CommandPositional,
} from "@anchan828/nest-commands";
import { Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CommandReferenceModule } from "./reference.module";
describe("CommandReferenceModule", () => {
  it("should cimpile", async () => {
    @Module({
      imports: [CommandModule.register()],
    })
    class TestModule {}
    await expect(
      Test.createTestingModule({ imports: [CommandReferenceModule.register({ module: TestModule })] }).compile(),
    ).resolves.toBeDefined();
  });

  it("should cimpile", async () => {
    @Commander({ describe: "Commander", name: "test" })
    class TestCommander {
      @CommanderOption({ describe: "CommanderOption", name: "commander-option" })
      commanderOption!: string;

      @Command({ describe: "Command", name: "command" })
      command(
        @CommandPositional({ desc: "CommandPositional", name: "positional" })
        positional: string,
        @CommandOption({ defaultDescription: "CommandOption", name: "option" })
        option: string,
      ): void {
        console.log({ option, positional });
      }
    }

    @Module({
      imports: [CommandModule.register()],
      providers: [TestCommander],
    })
    class TestModule {}

    const module = await Test.createTestingModule({
      imports: [CommandReferenceModule.register({ module: TestModule })],
    }).compile();
    await module.init();
  });
});
