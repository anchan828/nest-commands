import { Inject, Injectable } from "@nestjs/common";
import Y18N from "y18n";
import yargs from "yargs";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { Commander, CommandModuleOptions } from "./command.interface";

type DescriptionType = { desc?: string; describe?: string; description?: string; defaultDescription?: string };

@Injectable()
export class LocalizationService {
  private readonly y18nInstance: Y18N;

  public get y18n(): Y18N {
    return this.y18nInstance;
  }

  constructor(@Inject(COMMAND_MODULE_OPTIONS) private readonly options: CommandModuleOptions) {
    this.y18nInstance = new Y18N(
      Object.assign({ locale: this.options.locale || yargs.locale(), updateFiles: false }, this.options.y18n) as any,
    );
  }

  public localizeDescriptions(commanders: Commander[]): void {
    commanders.forEach(commander => this.localizeDescription(commander));
  }

  private localizeDescription(commander: Commander): void {
    if (commander.describe) {
      this.localizeOptions(commander);
    }

    for (const option of commander.options) {
      this.localizeOptions(option.options);
    }

    for (const command of commander.commands) {
      this.localizeOptions(command);
      for (const option of command.options) {
        this.localizeOptions(option.options);
      }

      for (const positional of command.positionals) {
        this.localizeOptions(positional.options);
      }
    }
  }

  private localizeOptions<T extends DescriptionType>(options: T): void {
    if (options.desc) {
      options.desc = this.y18n.__(options.desc);
    }

    if (options.describe) {
      options.describe = this.y18n.__(options.describe);
    }

    if (options.description) {
      options.description = this.y18n.__(options.description);
    }

    if (options.defaultDescription) {
      options.defaultDescription = this.y18n.__(options.defaultDescription);
    }
  }
}
