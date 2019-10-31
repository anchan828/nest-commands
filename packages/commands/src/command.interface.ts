import { Options, PositionalOptions } from "yargs";

export interface CommandModuleOptions {
  scriptName?: string;

  usage?: string;

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

export interface Command extends CommandOptions {
  instance: Function;

  options: CommandOption[];

  positionals: CommandPositional[];
}

export interface CommandOption {
  parameterIndex: number;
  options: CommandOptionOptions;
}

export interface CommandPositional {
  parameterIndex: number;
  options: CommandPositionalOptions;
}

export interface Commander extends CommanderOptions {
  commands: Command[];

  instance: Function;
}
