import { Injectable, Module, PipeTransform } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  Command,
  Commander,
  CommanderOption,
  CommandModule,
  CommandOption,
  CommandPositional,
  CommandService,
} from "../src";

@Injectable()
class StringPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    return `updated ${value}`;
  }
}

@Injectable()
class IntPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    return value * 2;
  }
}

// ts-node -T ./examples/use-pipes.ts --token token serve
@Commander()
class TestCommander {
  // See: https://github.com/yargs/yargs#complex-example
  @Command({ describe: "start the server", name: "serve" })
  public serve(
    @CommandPositional(
      {
        default: 5000,
        describe: "port to bind on",
        name: "port",
      },
      IntPipe,
      IntPipe,
      IntPipe,
    )
    port: number,
    @CommandOption({
      alias: "v",
      default: false,
      description: "Run with verbose logging",
      name: "verbose",
      type: "boolean",
    })
    verbose: boolean,
  ): void {
    console.log("Run use-pipe command");
    console.log(`port is ${port}`);
    console.log(`verbose is ${verbose}`);
    console.log(`token is ${this.token}`);
  }

  @CommanderOption({ demandOption: true, name: "token", type: "string" }, StringPipe)
  public token!: string;
}

@Module({
  imports: [CommandModule.register()],
  providers: [TestCommander, StringPipe, IntPipe],
})
class TestAppModule {}

(async (): Promise<void> => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
