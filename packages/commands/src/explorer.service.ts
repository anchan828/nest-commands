import { Injectable } from "@nestjs/common";
import { Module } from "@nestjs/core/injector/module";
import { ModulesContainer } from "@nestjs/core/injector/modules-container";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import {
  COMMAND_MODULE_COMMANDER_DECORATOR,
  COMMAND_MODULE_COMMAND_DECORATOR,
  COMMAND_MODULE_COMMAND_OPTION_DECORATOR,
  COMMAND_MODULE_COMMAND_POSITIONAL_DECORATOR,
} from "./command.constants";
import { Command, Commander, CommandOption, CommandPositional } from "./command.interface";
@Injectable()
export class ExplorerService {
  constructor(private readonly modulesContainer: ModulesContainer, private readonly metadataScanner: MetadataScanner) {}

  public explore(): Commander[] {
    const modules = [...this.modulesContainer.values()];

    const commanders = this.getCommanders(modules);

    for (const commander of commanders) {
      const commands = this.getCommands(commander);

      for (const command of commands) {
        command.options = this.getOptions(commander, command);
        command.positionals = this.getPositionals(commander, command);
      }

      commander.commands = commands;
    }

    return this.mergeCommanders(commanders);
  }

  private getCommanders(modules: Module[]): Commander[] {
    const commanders: Commander[] = [];
    const instanceWrappers = modules.map(module => [...module.providers.values()]).reduce((a, b) => a.concat(b), []);

    const classInstanceWrappers = instanceWrappers
      .filter(instanceWrapper => instanceWrapper.instance)
      .filter(({ instance }) => instance.constructor);

    for (const classInstanceWrapper of classInstanceWrappers) {
      const metadata = Reflect.getMetadata(
        COMMAND_MODULE_COMMANDER_DECORATOR,
        classInstanceWrapper.instance.constructor,
      );

      if (metadata) {
        commanders.push({ instance: classInstanceWrapper.instance, ...metadata });
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

  private getOptions(commander: Commander, command: Command): CommandOption[] {
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

  private getPositionals(commander: Commander, command: Command): CommandPositional[] {
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
      if (mergedCommanders.has(commanderName)) {
        mergedCommanders.get(commanderName)?.commands.push(...commander.commands);
      } else {
        mergedCommanders.set(commanderName, commander);
      }
    }

    return Array.from(mergedCommanders.values()).filter(commander => commander.commands.length !== 0);
  }
}
