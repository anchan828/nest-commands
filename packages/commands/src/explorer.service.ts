import { Injectable } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { isArray } from "util";
import {
  COMMAND_MODULE_COMMANDER_DECORATOR,
  COMMAND_MODULE_COMMANDER_OPTION_DECORATOR,
  COMMAND_MODULE_COMMAND_CONFIG_DECORATOR,
  COMMAND_MODULE_COMMAND_CONFIG_PROCESSOR,
  COMMAND_MODULE_COMMAND_DECORATOR,
  COMMAND_MODULE_COMMAND_OPTION_DECORATOR,
  COMMAND_MODULE_COMMAND_POSITIONAL_DECORATOR,
} from "./command.constants";
import {
  Command,
  Commander,
  CommanderOption,
  CommandOption,
  CommandPositional,
  GlobalConfigOptions,
} from "./command.interface";
@Injectable()
export class ExplorerService {
  constructor(private readonly discoveryService: DiscoveryService, private readonly metadataScanner: MetadataScanner) {}

  public explore(): {
    config?: GlobalConfigOptions;
    commanders: Commander[];
  } {
    const commanders = this.getCommanders();

    for (const commander of commanders) {
      const commands = this.getCommands(commander);

      commander.options = this.getCommanderOptions(commander);

      for (const command of commands) {
        command.options = this.getCommandOptions(commander, command);
        command.positionals = this.getCommandPositionals(commander, command);
      }

      commander.commands = commands;
    }
    return {
      commanders: this.mergeCommanders(commanders),
      config: this.getGlobalConfigOptions(),
    };
  }

  private getGlobalConfigOptions(): GlobalConfigOptions | undefined {
    const classInstanceWrappers = this.discoveryService
      .getProviders()
      .filter((instanceWrapper) => instanceWrapper.metatype);

    for (const classInstanceWrapper of classInstanceWrappers) {
      const metadata = Reflect.getMetadata(COMMAND_MODULE_COMMAND_CONFIG_DECORATOR, classInstanceWrapper.metatype);

      if (metadata) {
        const instance = classInstanceWrapper.instance;
        const prototype = Object.getPrototypeOf(instance);
        let processor: Function | undefined;
        for (const methodName of this.metadataScanner.getAllFilteredMethodNames(prototype)) {
          const value = Reflect.getMetadata(COMMAND_MODULE_COMMAND_CONFIG_PROCESSOR, prototype[methodName]);
          if (value) {
            processor = prototype[methodName].bind(instance);
          }
        }

        return { processor, ...metadata } as GlobalConfigOptions;
      }
    }
  }

  private getCommanders(): Commander[] {
    const commanders: Commander[] = [];

    const classInstanceWrappers = this.discoveryService
      .getProviders()
      .filter((instanceWrapper) => instanceWrapper.metatype);

    for (const classInstanceWrapper of classInstanceWrappers) {
      const metadata = Reflect.getMetadata(COMMAND_MODULE_COMMANDER_DECORATOR, classInstanceWrapper.metatype);

      if (metadata && isArray(metadata)) {
        commanders.push(...metadata.map((m: any) => ({ instance: classInstanceWrapper.instance, ...m })));
      }
    }

    return commanders;
  }

  private getCommands(commander: Commander): Command[] {
    const instance = commander.instance;
    const prototype = Object.getPrototypeOf(instance);
    const commands: Command[] = [];

    for (const methodName of this.metadataScanner.getAllFilteredMethodNames(prototype)) {
      const metadata = Reflect.getMetadata(COMMAND_MODULE_COMMAND_DECORATOR, prototype[methodName]);
      if (metadata) {
        commands.push({ instance: prototype[methodName].bind(instance), ...metadata });
      }
    }

    return commands;
  }

  private getCommanderOptions(commander: Commander): CommanderOption[] {
    const instance = commander.instance;
    let options: CommanderOption[] = Reflect.getMetadata(COMMAND_MODULE_COMMANDER_OPTION_DECORATOR, instance);

    if (!Array.isArray(options)) {
      options = [];
    }

    for (const option of options) {
      option.instance = instance;
    }

    return options;
  }

  private getCommandOptions(commander: Commander, command: Command): CommandOption[] {
    const options = Reflect.getMetadata(
      COMMAND_MODULE_COMMAND_OPTION_DECORATOR,
      commander.instance,
      command.instance.name.replace("bound ", ""),
    ) as CommandOption[];

    if (Array.isArray(options)) {
      return options;
    }
    return [];
  }

  private getCommandPositionals(commander: Commander, command: Command): CommandPositional[] {
    const positionals = Reflect.getMetadata(
      COMMAND_MODULE_COMMAND_POSITIONAL_DECORATOR,
      commander.instance,
      command.instance.name.replace("bound ", ""),
    ) as CommandPositional[];

    if (Array.isArray(positionals)) {
      return positionals;
    }

    return [];
  }

  private mergeCommanders(commanders: Commander[]): Commander[] {
    const mergedCommanders: Map<string, Commander> = new Map<string, Commander>();
    for (const commander of commanders) {
      const commanderName = commander.name ?? "";
      let mergedCommander = mergedCommanders.get(commanderName);
      if (mergedCommander) {
        mergedCommander.commands.push(...commander.commands);
        mergedCommander.options.push(...commander.options);
      } else {
        mergedCommander = commander;
      }

      mergedCommander.describe = mergedCommander.describe || commander.describe;

      mergedCommanders.set(commanderName, mergedCommander);
    }

    return Array.from(mergedCommanders.values()).filter(
      (commander) => commander.options.length !== 0 || commander.commands.length !== 0,
    );
  }
}
