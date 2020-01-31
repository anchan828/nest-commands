import { Test } from "@nestjs/testing";
import { Command, Commander, CommanderOption, CommandOption, CommandPositional } from "./command.decorator";
import { CommandModule } from "./command.module";
import { CommandService } from "./command.service";
import { LocalizationService } from "./localization.service";

describe("LocalizationService", () => {
  it("should localize descriptions", async () => {
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

    @Commander({ name: "test" })
    class TestCommander2 {
      @Command({ describe: "Command", name: "command" })
      command(
        @CommandPositional({ description: "CommandPositional", name: "positional" })
        positional: string,
      ): void {
        console.log({ positional });
      }
    }

    const module = await Test.createTestingModule({
      imports: [CommandModule.register()],
      providers: [TestCommander, TestCommander2],
    }).compile();
    await module.init();
    const { commanders } = module.get<CommandService>(CommandService);
    const localizationService = module.get<LocalizationService>(LocalizationService);
    expect(commanders).toHaveLength(1);
    localizationService.localizeDescriptions(commanders);
  });
});
