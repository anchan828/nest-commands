import { SetMetadata } from "@nestjs/common";
import {
  COMMAND_MODULE_COMMANDER_DECORATOR,
  COMMAND_MODULE_COMMAND_DECORATOR,
  COMMAND_MODULE_COMMAND_OPTION_DECORATOR,
  COMMAND_MODULE_COMMAND_POSITIONAL_DECORATOR,
} from "./command.constants";
import {
  CommanderOptions,
  CommandOption,
  CommandOptionOptions,
  CommandOptions,
  CommandPositional,
  CommandPositionalOptions,
} from "./command.interface";

export function Commander(options?: CommanderOptions): Function {
  return SetMetadata(COMMAND_MODULE_COMMANDER_DECORATOR, options || {});
}

export function Command(options: CommandOptions): Function {
  return SetMetadata(COMMAND_MODULE_COMMAND_DECORATOR, options);
}

export function CommandPositional(options: CommandPositionalOptions): Function {
  return (target: any, key: string, parameterIndex: number): any => {
    const positional = { options, parameterIndex } as CommandPositional;

    let metadata = Reflect.getMetadata(COMMAND_MODULE_COMMAND_POSITIONAL_DECORATOR, target, key) as
      | CommandPositional[]
      | undefined;

    if (!Array.isArray(metadata)) {
      metadata = [];
    }

    metadata.push(positional);
    Reflect.defineMetadata(
      COMMAND_MODULE_COMMAND_POSITIONAL_DECORATOR,
      metadata.sort((a, b) => a.parameterIndex - b.parameterIndex),
      target,
      key,
    );
  };
}

export function CommandOption(options: CommandOptionOptions): Function {
  return (target: any, key: string, parameterIndex: number): any => {
    const option = { options, parameterIndex } as CommandOption;

    let metadata = Reflect.getMetadata(COMMAND_MODULE_COMMAND_OPTION_DECORATOR, target, key) as
      | CommandOption[]
      | undefined;

    if (!Array.isArray(metadata)) {
      metadata = [];
    }

    metadata.push(option);

    Reflect.defineMetadata(
      COMMAND_MODULE_COMMAND_OPTION_DECORATOR,
      metadata.sort((a, b) => a.parameterIndex - b.parameterIndex),
      target,
      key,
    );
  };
}
