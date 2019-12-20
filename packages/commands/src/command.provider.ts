import { Provider, Type } from "@nestjs/common";
import { ClassProvider, FactoryProvider } from "@nestjs/common/interfaces";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { CommandModuleAsyncOptions, CommandModuleOptions, CommandModuleOptionsFactory } from "./command.interface";

export function createAsyncOptionsProvider(options: CommandModuleAsyncOptions): FactoryProvider {
  if (options.useFactory) {
    return {
      inject: options.inject || [],
      provide: COMMAND_MODULE_OPTIONS,
      useFactory: options.useFactory,
    };
  }
  return {
    inject: [options.useClass || options.useExisting].filter(
      (x): x is Type<CommandModuleOptionsFactory> => x !== undefined,
    ),
    provide: COMMAND_MODULE_OPTIONS,
    useFactory: async (optionsFactory: CommandModuleOptionsFactory): Promise<CommandModuleOptions> =>
      await optionsFactory.createCommandModuleOptions(),
  };
}

export function createAsyncProviders(options: CommandModuleAsyncOptions): Provider[] {
  const asyncOptionsProvider = createAsyncOptionsProvider(options);
  if (options.useExisting || options.useFactory) {
    return [asyncOptionsProvider];
  }
  return [
    asyncOptionsProvider,
    {
      provide: options.useClass,
      useClass: options.useClass,
    } as ClassProvider,
  ];
}
