import { DynamicModule, Module, OnModuleInit } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { CommandModuleOptions } from "./command.interface";
import { CommandService } from "./command.service";
import { ExplorerService } from "./explorer.service";
@Module({
  exports: [CommandService],
  providers: [ExplorerService, CommandService, MetadataScanner],
})
export class CommandModule implements OnModuleInit {
  constructor(private readonly explorer: ExplorerService, private readonly service: CommandService) {}

  public onModuleInit(): void {
    this.service.commanders = this.explorer.explore();
  }

  public static register(options?: CommandModuleOptions): DynamicModule {
    return {
      module: CommandModule,
      providers: [{ provide: COMMAND_MODULE_OPTIONS, useValue: options || {} }],
    };
  }
}
