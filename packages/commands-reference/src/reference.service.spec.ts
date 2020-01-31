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
import * as figlet from "figlet";
import { CommandReferenceModule } from "./reference.module";
import { CommandReferenceService } from "./reference.service";
describe("CommandReferenceService", () => {
  describe("exec", () => {
    it("should throw error", async () => {
      @Module({})
      class TestModule {}

      const module = await Test.createTestingModule({
        imports: [CommandReferenceModule.register({ module: TestModule })],
      }).compile();
      await module.init();
      const reference = module.get<CommandReferenceService>(CommandReferenceService);
      expect(() => {
        reference.exec();
      }).toThrowError("CommandService not found. Did you import CommandModule?");
    });
    it("should do", async () => {
      @Commander({ describe: "This is description of global commander" })
      class TestCommander {
        @Command({ describe: "This is basic command", name: "basic" })
        public basic(
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
            name: "option1",
            type: "boolean",
          })
          option1: boolean,
          @CommandOption({
            alias: ["v1", "v2"],
            default: false,
            description: "Run with verbose logging",
            name: "option2",
            type: "boolean",
          })
          option2: boolean,
        ): void {
          console.log({ option1, option2, port });
        }

        @CommanderOption({ describe: "This is description of global commander option", name: "global-option" })
        commanderOption!: string;
      }

      @Commander({ describe: "nested describe", name: "nested" })
      class TestCommander2 {
        @Command({ describe: "This is basic command", name: "basic" })
        public basic(): void {
          console.log("hello!");
        }

        @CommanderOption({
          demandOption: true,
          describe: "This is description of nested commander option",
          name: "nested-option",
        })
        commanderOption!: string;
      }

      @Module({
        imports: [CommandModule.register({ scriptName: "nest-commands", usage: figlet.textSync("Nest Commands") })],
        providers: [TestCommander, TestCommander2],
      })
      class TestModule {}

      const module = await Test.createTestingModule({
        imports: [
          CommandReferenceModule.register({
            indexName: "README",
            module: TestModule,
            output: "test-docs",
          }),
        ],
      }).compile();
      await module.init();
      const reference = module.get<CommandReferenceService>(CommandReferenceService);
      reference.exec();
    });
  });
});
