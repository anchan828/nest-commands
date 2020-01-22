import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { CommandModuleAsyncOptions, CommandModuleOptions } from "./command.interface";
import { createAsyncProviders } from "./command.provider";
import { CommandService } from "./command.service";
import { ExplorerService } from "./explorer.service";
@Module({
  exports: [CommandService],
  imports: [DiscoveryModule],
  providers: [ExplorerService, CommandService],
})
export class CommandCoreModule implements OnModuleInit {
  constructor(private readonly explorer: ExplorerService, private readonly service: CommandService) {}

  public onModuleInit(): void {
    const { config, commanders } = this.explorer.explore();
    this.service.config = config;
    this.service.commanders = commanders;
  }

  public static register(options: CommandModuleOptions): DynamicModule {
    return {
      module: CommandCoreModule,
      providers: [{ provide: COMMAND_MODULE_OPTIONS, useValue: options }],
    };
  }

  public static registerAsync(options: CommandModuleAsyncOptions): DynamicModule {
    const asyncProviders = createAsyncProviders(options);
    return {
      exports: asyncProviders,
      imports: [...(options.imports || [])],
      module: CommandCoreModule,
      providers: asyncProviders,
    };
  }
}
