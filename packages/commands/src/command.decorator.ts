import { SetMetadata } from "@nestjs/common";
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
  CommanderOption,
  CommanderOptions,
  CommandOption,
  CommandOptions,
  CommandPositional,
  CommandPositionalOptions,
  GlobalConfigOptions,
  OptionOptions,
  PipeTransformArg,
} from "./command.interface";

export function GlobalConfig(options: GlobalConfigOptions): ClassDecorator {
  return SetMetadata(COMMAND_MODULE_COMMAND_CONFIG_DECORATOR, options);
}

export function GlobalConfigProcessor(): MethodDecorator {
  return SetMetadata(COMMAND_MODULE_COMMAND_CONFIG_PROCESSOR, "set");
}

export function Commander(options?: CommanderOptions): ClassDecorator {
  return (target: Record<string, any>): void => {
    const commanderOption = options || { name: undefined };

    let metadata = Reflect.getMetadata(COMMAND_MODULE_COMMANDER_DECORATOR, target) as CommanderOptions[] | undefined;

    if (!Array.isArray(metadata)) {
      metadata = [];
    }
    metadata.push(commanderOption);
    Reflect.defineMetadata(COMMAND_MODULE_COMMANDER_DECORATOR, metadata, target);
  };
}

export function Command(options: CommandOptions): MethodDecorator {
  return SetMetadata(COMMAND_MODULE_COMMAND_DECORATOR, options);
}

export function CommanderOption(options: OptionOptions, ...pipes: PipeTransformArg[]): PropertyDecorator {
  return (target: Record<string, any>, key: string | symbol): void => {
    const commanderOption = { key, options, pipes } as CommanderOption;

    let metadata = Reflect.getMetadata(COMMAND_MODULE_COMMANDER_OPTION_DECORATOR, target) as
      | CommanderOption[]
      | undefined;

    if (!Array.isArray(metadata)) {
      metadata = [];
    }

    metadata.push(commanderOption);

    Reflect.defineMetadata(
      COMMAND_MODULE_COMMANDER_OPTION_DECORATOR,
      metadata.sort((a, b) => a.key.localeCompare(b.key)),
      target,
    );

    Object.defineProperty(target, key, { writable: true });
  };
}

export function CommandPositional(options: CommandPositionalOptions, ...pipes: PipeTransformArg[]): ParameterDecorator {
  return (target: any, key: string | symbol, parameterIndex: number): void => {
    const positional = { options, parameterIndex, pipes } as CommandPositional;

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

export function CommandOption(options: OptionOptions, ...pipes: PipeTransformArg[]): ParameterDecorator {
  return (target: any, key: string | symbol, parameterIndex: number): any => {
    const option = { options, parameterIndex, pipes } as CommandOption;

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
