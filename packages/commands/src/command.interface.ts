import { Options, PositionalOptions } from "yargs";

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
}

export interface CommanderOption {
  key: string;
  options: CommanderOptionOptions;
}

export interface CommandPositional {
  parameterIndex: number;
  options: CommandPositionalOptions;
}

export interface Commander extends CommanderOptions {
  commands: Command[];

  options: CommanderOption[];

  instance: Function;
}
