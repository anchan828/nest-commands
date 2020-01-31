import { CommandService, COMMAND_MODULE_OPTIONS, LocalizationService } from "@anchan828/nest-commands";
import {
  Command,
  Commander,
  CommanderOption,
  CommandModuleOptions,
  CommandPositional,
  OptionOptions,
} from "@anchan828/nest-commands/dist/command.interface";
import { Inject } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join, relative, resolve } from "path";
import * as prettier from "prettier";
import * as rimraf from "rimraf";
import { COMMAND_REFERENCE_MODULE_OPTIONS } from "./command.constants";
import { CommandReferenceModuleOptions } from "./reference.interface";

type DescriptionType = { desc?: string; describe?: string; description?: string; defaultDescription?: string };

export class CommandReferenceService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    @Inject(COMMAND_REFERENCE_MODULE_OPTIONS)
    private readonly referenceOptions: Required<CommandReferenceModuleOptions>,
  ) {
    referenceOptions.output = referenceOptions.output || "./docs";

    if (referenceOptions.locale) {
      referenceOptions.output = join(referenceOptions.output, referenceOptions.locale);
    }

    referenceOptions.indexName = referenceOptions.indexName || "index";
  }

  public exec(): void {
    rimraf.sync(this.referenceOptions.output);

    const commandService = this.discoveryService.getProviders().find(p => p.name === "CommandService")
      ?.instance as CommandService;
    if (!commandService) {
      throw new Error("CommandService not found. Did you import CommandModule?");
    }
    const localizationService = this.discoveryService.getProviders().find(p => p.metatype === LocalizationService)
      ?.instance as LocalizationService;
    const commandModuleOptions = (this.discoveryService.getProviders().find(p => p.name === COMMAND_MODULE_OPTIONS)
      ?.instance || {}) as CommandModuleOptions;

    if (this.referenceOptions.locale) {
      localizationService.localizeDescriptions(commandService.commanders, this.referenceOptions.locale);
    }

    if (!Array.isArray(commandService.commanders)) {
      return;
    }
    commandModuleOptions.scriptName = commandModuleOptions.scriptName || "cli";

    this.buildGlobalCommander(commandService.commanders, commandModuleOptions);

    for (const commander of commandService.commanders.filter(commander => commander.name)) {
      this.buildCommander(commander, commandModuleOptions);
    }
  }

  private buildGlobalCommander(commanders: Commander[], commandModuleOptions: CommandModuleOptions): void {
    const results: string[] = [`# ${commandModuleOptions.scriptName}`, ``];

    if (commandModuleOptions.usage) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      results.push("```", commandModuleOptions.usage.replace("$0", commandModuleOptions.scriptName!), "```");
    }

    const globalCommander = commanders.find(commander => !commander.name);
    const nestedCommands = commanders.filter(commander => commander.name);

    if (globalCommander) {
      if (globalCommander.describe) {
        results.push(`## Description`, globalCommander.describe, "");
      }

      if (globalCommander.options.length !== 0) {
        results.push(
          "## Global Options\n",
          "| Option Name | Description | Type | Required | Default Value |",
          "| :--- | :------------ | :---: | :---: | :---: |",
        );

        for (const option of globalCommander.options) {
          results.push(
            `| ${option.options.name} | ${this.getDescription(option.options)} | ${option.options.type ||
              "string"} | ${option.options.demandOption || false}|${this.getDefaultValue(option.options.default)}|`,
          );
        }
      }
    }

    if ((globalCommander && globalCommander.commands.length !== 0) || nestedCommands.length !== 0) {
      results.push("## Commands\n", "| Command Name | Description |", "| :--- | :------------ |");
    }
    if (globalCommander) {
      for (const command of globalCommander.commands) {
        results.push(`|[${command.name}](./${command.name}.md)|${this.getDescription(command)}|`);
        this.buildCommand({ name: "", options: [] as CommanderOption[] } as Commander, command, commandModuleOptions);
      }
    }
    if (nestedCommands.length !== 0) {
      for (const commander of nestedCommands) {
        if (!this.isNestedCommand(commander)) {
          continue;
        }

        results.push(
          `|[${commander.name}](./${commander.name}/${this.referenceOptions.indexName}.md)|${this.getDescription(
            commander,
          )}|`,
        );
      }
    }
    this.writeReferenceFile(`${this.referenceOptions.indexName}.md`, results.join("\n"));
  }

  private buildCommander(commander: Commander, commandModuleOptions: CommandModuleOptions): void {
    if (!this.isNestedCommand(commander)) {
      return;
    }

    const runCommand = [commandModuleOptions.scriptName, commander.name].filter(x => x?.trim()).join(" ");

    const results: string[] = [`# ${runCommand}`];

    results.push(
      "```sh",
      `${runCommand} ${this.getCommandOptionUsage(commander.options.map(o => o.options))}`.replace(/  /g, " "),
      "```",
    );

    if (commander.describe) {
      results.push(`## Description`, commander.describe, "");
    }

    if (commander.options.length !== 0) {
      results.push(
        "## Options\n",
        "| Option Name | Description | Type | Required | Default Value |",
        "| :--- | :------------ | :---: | :---: | :---: |",
      );

      for (const option of commander.options) {
        results.push(
          `| ${option.options.name} | ${this.getDescription(option.options)} | ${option.options.type ||
            "string"} | ${option.options.demandOption || false}|${this.getDefaultValue(option.options.default)}|`,
        );
      }
    }

    for (const command of commander.commands) {
      results.push("## Commands\n", "| Command Name | Description |", "| :--- | :------------ |");
      results.push(`|[${command.name}](./${command.name}.md)|${this.getDescription(command)}|`);
      this.buildCommand(commander, command, commandModuleOptions);
    }

    this.writeReferenceFile(join(commander.name || "", `${this.referenceOptions.indexName}.md`), results.join("\n"));
  }

  private buildCommand(commander: Commander, command: Command, commandModuleOptions: CommandModuleOptions): void {
    const runCommand = [commandModuleOptions.scriptName, commander.name, command.name].filter(x => x?.trim()).join(" ");

    const results: string[] = [`# ${runCommand}`];

    results.push(
      "```sh",
      `${runCommand} ${this.getCommandOptionUsage([
        ...commander.options.map(o => o.options),
        ...command.options.map(o => o.options),
      ])} ${this.getCommandPositionalUsage(command.positionals)}`.replace(/  /g, " "),
      "```",
    );

    if (command.describe) {
      results.push(`## Description`, command.describe, "");
    }

    if (command.positionals.length !== 0) {
      results.push(
        "## Positionals\n",
        "| Positional Name | Description | Type | Required | Default Value |",
        "| :--- | :------------ | :---: | :---: | :---: |",
      );

      for (const positional of command.positionals) {
        results.push(
          `| ${positional.options.name} | ${this.getDescription(positional.options)} | ${positional.options.type ||
            "string"} | ${positional.options.demandPositional || false}|${this.getDefaultValue(
            this.getDefaultValue(positional.options.default),
          )}|`,
        );
      }
    }

    if (commander.options.length !== 0 || command.options.length !== 0) {
      results.push(
        "## Options\n",
        "| Option Name | Description | Type | Required | Default Value |",
        "| :--- | :------------ | :---: | :---: | :---: |",
      );
    }
    if (commander.options.length !== 0) {
      for (const option of commander.options) {
        results.push(
          `| ${option.options.name} | ${this.getDescription(option.options)} | ${option.options.type ||
            "string"} | ${option.options.demandOption || false}|${this.getDefaultValue(option.options.default)}|`,
        );
      }
    }
    if (command.options.length !== 0) {
      for (const option of command.options) {
        results.push(
          `| ${option.options.name} | ${this.getDescription(option.options)} | ${option.options.type ||
            "string"} | ${option.options.demandOption || false}|${this.getDefaultValue(option.options.default)}|`,
        );
      }
    }

    const dir = resolve(this.referenceOptions.output, commander.name || "");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.writeReferenceFile(join(commander.name || "", `${command.name}.md`), results.join("\n"));
  }

  private getCommandOptionUsage(options: OptionOptions[]): string {
    if (options.length === 0) {
      return "";
    }

    const results: string[] = [];

    for (const option of options) {
      const fence = option.demandOption ? "  " : "[]";
      const optionUsage = [fence[0]];
      optionUsage.push(`--${option.name}`);

      if (option.alias) {
        if (Array.isArray(option.alias)) {
          for (const alias of option.alias) {
            optionUsage.push(`, -${alias}`);
          }
        } else {
          optionUsage.push(`, -${option.alias}`);
        }
      }
      optionUsage.push(fence[1]);
      results.push(optionUsage.join("").trim());
    }

    return results.join(" ");
  }

  private getCommandPositionalUsage(positionals: CommandPositional[]): string {
    if (positionals.length === 0) {
      return "";
    }

    const results: string[] = [];

    for (const positional of positionals) {
      const fence = positional.options.demandPositional ? "<>" : "[]";
      results.push(`${fence[0]}${positional.options.name}${fence[1]}`.trim());
    }

    return results.join(" ");
  }

  private isNestedCommand(commander: Commander): boolean {
    return commander.commands.length !== 0;
  }

  private getDescription(options: DescriptionType): string {
    if (options.desc) {
      return options.desc;
    }

    if (options.describe) {
      return options.describe;
    }

    if (options.description) {
      return options.description;
    }

    if (options.defaultDescription) {
      return options.defaultDescription;
    }

    return "";
  }

  private getDefaultValue<T>(defaultValue?: T): T | string {
    if (!defaultValue) {
      return "-";
    }

    if (typeof defaultValue === "string" && defaultValue.startsWith(process.cwd())) {
      return relative(process.cwd(), defaultValue) || "./";
    }
    return defaultValue;
  }

  private writeReferenceFile(filename: string, data: string): void {
    const fullPath = resolve(this.referenceOptions.output, filename);
    if (!existsSync(dirname(fullPath))) {
      mkdirSync(dirname(fullPath), { recursive: true });
    }
    writeFileSync(fullPath, prettier.format(data, { parser: "markdown" }), "utf8");
  }
}
