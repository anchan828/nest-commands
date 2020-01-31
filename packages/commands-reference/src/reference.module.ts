import { DynamicModule, Global, Module, ValueProvider } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { existsSync, mkdirSync } from "fs";
import { COMMAND_REFERENCE_MODULE_OPTIONS } from "./command.constants";
import { CommandReferenceModuleOptions } from "./reference.interface";
import { CommandReferenceService } from "./reference.service";
@Global()
@Module({})
export class CommandReferenceModule {
  public static register(options: CommandReferenceModuleOptions): DynamicModule {
    if (!options.output) {
      options.output = "./docs";
    }

    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }

    const providers = [
      { provide: COMMAND_REFERENCE_MODULE_OPTIONS, useValue: options } as ValueProvider,
      CommandReferenceService,
    ];

    return {
      exports: providers,
      imports: [options.module, DiscoveryModule],
      module: CommandReferenceModule,
      providers,
    };
  }
}
