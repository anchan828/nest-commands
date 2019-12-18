import { DynamicModule, Module } from "@nestjs/common";
import { CommandCoreModule } from "./command.core-module";
import { CommandModuleAsyncOptions, CommandModuleOptions } from "./command.interface";
@Module({})
export class CommandModule {
  public static register(options?: CommandModuleOptions): DynamicModule {
    return {
      imports: [CommandCoreModule.register(options || {})],
      module: CommandModule,
    };
  }

  public static registerAsync(options?: CommandModuleAsyncOptions): DynamicModule {
    return {
      imports: [CommandCoreModule.registerAsync(options || {})],
      module: CommandModule,
    };
  }
}
