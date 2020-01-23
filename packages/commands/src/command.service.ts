import { Inject, Injectable, PipeTransform } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { cosmiconfigSync } from "cosmiconfig";
import { paramCase } from "param-case";
import * as Yargs from "yargs";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import {
  Command,
  Commander,
  CommandModuleOptions,
  CommandPositional,
  GlobalConfigOptions,
  PipeTransformArg,
} from "./command.interface";
@Injectable()
export class CommandService {
  public config?: GlobalConfigOptions;

  public commanders: Commander[] = [];

  private readonly yargs: Yargs.Argv;

  constructor(
    @Inject(COMMAND_MODULE_OPTIONS) private readonly options: CommandModuleOptions,
    private readonly discovery: DiscoveryService,
  ) {
    this.yargs = Yargs(process.argv.slice(2));
  }

  public async exec(): Promise<void> {
    if (this.commanders.length === 0) {
      return;
    }

    const parsed = await this.parser();

    parsed.argv;
  }

  private async parser(): Promise<Yargs.Argv> {
    if (this.options.scriptName) {
      this.yargs.scriptName(this.options.scriptName);
    }

    if (this.options.usage) {
      this.yargs.usage(this.options.usage);
    }

    if (this.options.locale) {
      this.yargs.locale(this.options.locale);
    }

    await this.setGlobalConfig(this.config || this.options.config);

    for (const commander of this.commanders) {
      if (this.isNestedCommand(commander)) {
        this.yargs.command(commander.name, commander.describe || "", y => {
          this.buildCommander(commander, y);
          return y.showHelpOnFail(true).demandCommand();
        });
      } else {
        this.buildCommander(commander, this.yargs);
      }
    }

    return this.yargs.showHelpOnFail(true).demandCommand();
  }

  private async setGlobalConfig(config?: GlobalConfigOptions): Promise<void> {
    if (!config) {
      return;
    }

    const searchPlaces = [
      "package.json",
      `.${config.name}rc`,
      `.${config.name}rc.json`,
      `.${config.name}rc.yaml`,
      `.${config.name}rc.yml`,
      `.${config.name}rc.js`,
      `${config.name}.config.js`,
    ];

    if (Array.isArray(config.searchPlaces)) {
      searchPlaces.push(...config.searchPlaces);
    }

    const explorer = cosmiconfigSync(config.name, {
      searchPlaces,
    });

    const result = explorer.search();

    let configObject = {};

    if (result) {
      configObject = result.config;
    }

    if (config.processor) {
      configObject = await config.processor(configObject);
    }

    this.yargs.config(configObject);
  }

  private buildCommander(commander: Commander, argv: Yargs.Argv): void {
    for (const command of commander.commands) {
      this.buildCommand(command, argv);
    }

    for (const option of commander.options) {
      argv.option(option.options.name, option.options);
      argv.middleware(args => {
        let arg = this.getArg(args, [
          option.options.name,
          paramCase(option.options.name),
          ...(option.options.alias || []),
        ]);

        if (!arg) {
          arg = Reflect.get(option.instance, option.key);
        }

        Reflect.set(option.instance, option.key, this.transformValue(arg, option.pipes));
      });
    }
  }

  private buildCommand(command: Command, argv: Yargs.Argv): void {
    const commandName = [command.name];

    for (const positional of command.positionals) {
      const message = this.printPositional(positional);
      if (message) {
        commandName.push(message);
      }

      if (positional.options.name.endsWith("..")) {
        positional.options.name = positional.options.name.replace(/\.\.$/g, "");
      }
    }

    if (command.positionals.length !== 0) {
      argv.demandCommand();
    }
    // command: string | ReadonlyArray<string>, description: string, builder?: BuilderCallback<T, U>, handler?: (args: Arguments<U>) => void
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

        for (const positional of command.positionals) {
          const arg = this.getArg(args, [
            positional.options.name,
            paramCase(positional.options.name),
            ...(positional.options.alias || []),
          ]);
          params[positional.parameterIndex] = this.transformValue(arg, positional.pipes);
        }
        for (const option of command.options) {
          const arg = this.getArg(args, [
            option.options.name,
            paramCase(option.options.name),
            ...(option.options.alias || []),
          ]);
          params[option.parameterIndex] = this.transformValue(arg, option.pipes);
        }

        command.instance(...params);
      },
    );
  }

  private printPositional(positional: CommandPositional): string | undefined {
    if (positional.options.demandPositional) {
      return `<${positional.options.name}>`;
    } else {
      return `[${positional.options.name}]`;
    }
  }

  private isNestedCommand(commander: Commander): commander is Required<Commander> {
    return commander.name !== undefined;
  }

  private getArg(args: Record<string, unknown>, searchKeys: string[]): unknown | undefined {
    const argKeys = Object.keys(args).filter(key => !["_", "$0"].includes(key));
    const argKey = argKeys.find(argKey => searchKeys.includes(argKey));
    return argKey ? args[argKey] : undefined;
  }

  private transformValue<T = any>(value: T, pipes: PipeTransformArg[] = []): T {
    let result = value;
    for (const pipe of pipes) {
      const pipeInstance = typeof pipe === "function" ? this.getPipeTransformInstance(pipe) : pipe;
      if (this.isPipeTransform(pipeInstance)) {
        result = pipeInstance.transform(result, { type: "custom" });
      }
    }
    return result;
  }

  private getPipeTransformInstance(pipe: Function): object | undefined {
    const pipeProvider = this.discovery.getProviders().find(p => p.metatype === pipe);
    if (pipeProvider) {
      return pipeProvider.instance;
    }
  }

  private isPipeTransform(pipe?: object): pipe is PipeTransform {
    return pipe !== undefined && Reflect.has(pipe, "transform");
  }
}
