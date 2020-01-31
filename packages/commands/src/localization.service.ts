import { Inject, Injectable } from "@nestjs/common";
import Y18N from "y18n";
import yargs from "yargs";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { Commander, CommandModuleOptions } from "./command.interface";

type DescriptionType = { desc?: string; describe?: string; description?: string; defaultDescription?: string };

@Injectable()
export class LocalizationService {
  constructor(@Inject(COMMAND_MODULE_OPTIONS) private readonly options: CommandModuleOptions) {}

  public localizeDescriptions(commanders: Commander[], locale?: string): void {
    const y18n = new Y18N(
      Object.assign(
        { locale: locale || this.options.locale || yargs.locale(), updateFiles: false },
        this.options.y18n,
      ) as any,
    );
    commanders.forEach(commander => this.localizeDescription(commander, y18n));
  }

  private localizeDescription(commander: Commander, y18n: Y18N): void {
    if (commander.describe) {
      this.localizeOptions(commander, y18n);
    }

    for (const option of commander.options) {
      this.localizeOptions(option.options, y18n);
    }

    for (const command of commander.commands) {
      this.localizeOptions(command, y18n);
      for (const option of command.options) {
        this.localizeOptions(option.options, y18n);
      }

      for (const positional of command.positionals) {
        this.localizeOptions(positional.options, y18n);
      }
    }
  }

  private localizeOptions<T extends DescriptionType>(options: T, y18n: Y18N): void {
    if (options.desc) {
      options.desc = y18n.__(options.desc);
    }

    if (options.describe) {
      options.describe = y18n.__(options.describe);
    }

    if (options.description) {
      options.description = y18n.__(options.description);
    }

    if (options.defaultDescription) {
      options.defaultDescription = y18n.__(options.defaultDescription);
    }
  }
}
