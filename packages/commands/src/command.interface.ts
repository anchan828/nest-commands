import { Type } from "@nestjs/common";
import { ModuleMetadata, PipeTransform } from "@nestjs/common/interfaces";
import { Options, PositionalOptions } from "yargs";
export interface GlobalConfigOptions {
  /**
   * Name of config file. This name is used by cosmiconfigSync(configName)
   * See: https://github.com/davidtheclark/cosmiconfig
   * @type {string}
   * @memberof GlobalConfigOptions
   */
  name: string;

  /**
   * Customize config object. for example, if config has `extends` property, you can load more data.
   * @memberof GlobalConfigOptions
   */
  processor?: (config: any) => any;

  /**
   * An array of places that search() will check in each directory as it moves up the directory tree. Each place is relative to the directory being searched, and the places are checked in the specified order.
   * This values append to default searchPlaces. See https://github.com/davidtheclark/cosmiconfig#searchplaces
   * @type {string[]}
   * @memberof GlobalConfigOptions
   */
  searchPlaces?: string[];
}
export interface Y18nOptions {
  /**
   * The locale directory, default ./locales.
   */
  directory?: string;
  /**
   * Should newly observed strings be updated in file, default false.
   */
  updateFiles?: boolean;
  /**
   * Should fallback to a language-only file (e.g. en.json) be allowed
   * if a file matching the locale does not exist (e.g. en_US.json), default true.
   */
  fallbackToLanguage?: boolean;
}
export interface CommandModuleOptions {
  /**
   * Config file options
   *
   * @memberof CommandModuleOptions
   */
  config?: GlobalConfigOptions;

  /**
   * Set to yargs.locale
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  locale?: string;
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
   * y18n options
   * see https://github.com/yargs/y18n#requirey18nconfig
   * @type {Y18nOptions}
   * @memberof CommandModuleOptions
   */
  y18n?: Y18nOptions;

  /**
   * Set to yargs.version
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  version?: string;
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
}

export interface OptionOptions extends Options {
  name: string;
}

export interface Command extends CommandOptions {
  instance: Function;

  options: CommandOption[];

  positionals: CommandPositional[];
}

export interface CommandOption {
  parameterIndex: number;
  options: OptionOptions;
  pipes: PipeTransformArg[];
}

export interface CommanderOption {
  instance: Function;
  key: string;
  options: OptionOptions;
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
