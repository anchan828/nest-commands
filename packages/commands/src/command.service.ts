import { Inject, Injectable } from "@nestjs/common";
import * as yargs from "yargs";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { Command, Commander, CommandModuleOptions } from "./command.interface";
@Injectable()
export class CommandService {
  public commanders: Commander[] = [];

  constructor(@Inject(COMMAND_MODULE_OPTIONS) private readonly options: CommandModuleOptions) {
    yargs.reset();
  }

  public exec(): void {
    if (this.commanders.length === 0) {
      return;
    }

    this.parser().argv;
  }

  private parser(): yargs.Argv {
    if (this.options.scriptName) {
      yargs.scriptName(this.options.scriptName);
    }

    if (this.options.usage) {
      yargs.usage(this.options.usage);
    }

    if (this.options.locale) {
      yargs.locale(this.options.locale);
    }

    for (const commander of this.commanders) {
      if (commander.commands.length == 0) {
        continue;
      }

      if (this.isNestedCommand(commander)) {
        yargs.command(commander.name, commander.describe || "", y => {
          this.buildCommander(commander, y);
          return y.showHelpOnFail(true).demandCommand();
        });
      } else {
        this.buildCommander(commander, yargs);
      }
    }

    return yargs.showHelpOnFail(true).demandCommand();
  }

  private buildCommander(commander: Commander, argv: yargs.Argv): void {
    for (const command of commander.commands) {
      this.buildCommand(command, argv);
    }
  }

  private buildCommand(command: Command, argv: yargs.Argv): void {
    const commandName = [command.name];
    for (const positional of command.positionals) {
      if (positional.options.required) {
        commandName.push(`<${positional.options.name}>`);
      } else {
        commandName.push(`[${positional.options.name}]`);
      }
    }

    if (command.positionals.length !== 0) {
      argv.demandCommand();
    }

    argv.command(
      commandName.join(" "),
      command.describe || "",
      y => {
        for (const positional of command.positionals) {
          y.positional(positional.options.name, positional.options);
        }
        for (const option of command.options) {
          y.option(option.options.name, option.options);
        }
        return y;
      },
      args => {
        const params = Array(command.positionals.length + command.options.length);
        for (const key of Object.keys(args).filter(key => !["_", "$0"].includes(key))) {
          for (const positional of command.positionals) {
            if (positional.options.name === key || positional.options.alias === key) {
              params[positional.parameterIndex] = args[key];
            }
          }
          for (const option of command.options) {
            if (option.options.name === key || option.options.alias === key) {
              params[option.parameterIndex] = args[key];
            }
          }
        }
        command.instance(...params);
      },
    );
  }

  private isNestedCommand(commander: Commander): commander is Required<Commander> {
    return commander.name !== undefined;
  }
}
