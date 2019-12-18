import { DynamicModule, Module, OnModuleInit, Provider } from "@nestjs/common";
import { ClassProvider, FactoryProvider } from "@nestjs/common/interfaces";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { CommandModuleAsyncOptions, CommandModuleOptions, CommandModuleOptionsFactory } from "./command.interface";
import { CommandService } from "./command.service";
import { ExplorerService } from "./explorer.service";
@Module({
  exports: [CommandService],
  providers: [ExplorerService, CommandService, MetadataScanner],
})
export class CommandCoreModule implements OnModuleInit {
  constructor(private readonly explorer: ExplorerService, private readonly service: CommandService) {}

  public onModuleInit(): void {
    this.service.commanders = this.explorer.explore();
  }

  public static register(options: CommandModuleOptions): DynamicModule {
    return {
      module: CommandCoreModule,
      providers: [{ provide: COMMAND_MODULE_OPTIONS, useValue: options }],
    };
  }

  public static registerAsync(options: CommandModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);
    return {
      exports: asyncProviders,
      imports: [...(options.imports || [])],
      module: CommandCoreModule,
      providers: asyncProviders,
    };
  }

  private static createAsyncProviders(options: CommandModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        inject: [options.inject || []],
        provide: options.useClass,
        useClass: options.useClass,
      } as ClassProvider,
    ];
  }

  private static createAsyncOptionsProvider(options: CommandModuleAsyncOptions): FactoryProvider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: COMMAND_MODULE_OPTIONS,
        useFactory: options.useFactory,
      };
    }
    return {
      inject: options.useClass ? [options.useClass] : [],
      provide: COMMAND_MODULE_OPTIONS,
      useFactory: async (optionsFactory: CommandModuleOptionsFactory): Promise<CommandModuleOptions> =>
        await optionsFactory.createCommandModuleOptions(),
    };
  }
}
