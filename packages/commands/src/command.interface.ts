import { Type } from "@nestjs/common";
import { ModuleMetadata, PipeTransform } from "@nestjs/common/interfaces";
import { Options, PositionalOptions } from "yargs";

export interface CommandConfigOptions {
  /**
   * Name of config file. This name is used by cosmiconfigSync(configName)
   * See: https://github.com/davidtheclark/cosmiconfig
   * @type {string}
   * @memberof CommandConfigOptions
   */
  name: string;

  /**
   * Customize config object. for example, if config has `extends` property, you can load more data.
   * @memberof CommandConfigOptions
   */
  processor?: (config: any) => any;

  /**
   * An array of places that search() will check in each directory as it moves up the directory tree. Each place is relative to the directory being searched, and the places are checked in the specified order.
   * This values append to default searchPlaces. See https://github.com/davidtheclark/cosmiconfig#searchplaces
   * @type {string[]}
   * @memberof CommandConfigOptions
   */
  searchPlaces?: string[];
}

export interface CommandModuleOptions {
  /**
   * Set to yargs.scriptName
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  scriptName?: string;

  /**
   * Set to yargs.usage
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  usage?: string;

  /**
   * Set to yargs.locale
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  locale?: string;

  /**
   * Config file options
   *
   * @memberof CommandModuleOptions
   */
  config?: CommandConfigOptions;
}

export interface CommandModuleAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useClass?: Type<CommandModuleOptionsFactory>;
  useExisting?: Type<CommandModuleOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<CommandModuleOptions> | CommandModuleOptions;
  inject?: Array<Type<CommandModuleOptionsFactory> | string | any>;
}

export interface CommandModuleOptionsFactory {
  createCommandModuleOptions(): Promise<CommandModuleOptions> | CommandModuleOptions;
}

export interface CommanderOptions {
  /**
   * Set name if you want to use nested command
   *
   * @type {string}
   * @memberof CommanderOptions
   */
  name?: string;

  /**
   * Set description if you want to use nested command
   *
   * @type {string}
   * @memberof CommanderOptions
   */
  describe?: string;
}

export interface CommandOptions {
  /**
   * Command name
   *
   * @type {string}
   * @memberof CommandOptions
   */
  name: string;

  /**
   * Description
   *
   * @type {string}
   * @memberof CommandOptions
   */
  describe?: string;
}

export interface CommandPositionalOptions extends PositionalOptions {
  name: string;
  demandPositional?: boolean;
}

export interface CommandOptionOptions extends Options {
  name: string;
}

export interface CommanderOptionOptions extends Options {
  name: string;
}

export interface Command extends CommandOptions {
  instance: Function;

  options: CommandOption[];

  positionals: CommandPositional[];
}

export interface CommandOption {
  parameterIndex: number;
  options: CommandOptionOptions;
  pipes: PipeTransformArg[];
}

export interface CommanderOption {
  key: string;
  options: CommanderOptionOptions;
  pipes: PipeTransformArg[];
}

export interface CommandPositional {
  parameterIndex: number;
  options: CommandPositionalOptions;
  pipes: PipeTransformArg[];
}

export interface Commander extends CommanderOptions {
  commands: Command[];

  options: CommanderOption[];

  instance: Function;
}

export type PipeTransformArg = PipeTransform | Function;
