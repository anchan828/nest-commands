# @anchan828/nest-commands

Make command line tools based on yargs.

```bash
$ nest-commands-example --help
nest-commands-example <command>

Commands:
  nest-commands-example author  Show author information
  nest-commands-example file    Show file information

Options:
  --help     Show help                           [boolean]
  --version  Show version number                 [boolean]
```

## Install

```shell
$ npm i @anchan828/nest-commands
$ npm i --save-dev @types/yargs
```

## Usage

```typescript
import { Commander, Command, CommandModule, CommandService } from "@anchan828/nest-commands";

@Commander()
class TestCommander {
  @Command({ name: "basic" })
  public basic() {
    console.log("hello!");
  }
}

@Module({
  imports: [CommandModule.register()],
  providers: [TestCommander],
})
class TestAppModule {}

(async () => {
  const app = await NestFactory.createApplicationContext(TestAppModule, { logger: false });
  app.get(CommandService).exec();
})();
```

### CommandModule.register

You can set some options

```typescript
CommandModule.register({
   /**
   * Set to yargs.scriptName
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  scriptName?: string;

  /**
   * Set to yargs.usage
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  usage?: string;

  /**
   * Set to yargs.locale
   *
   * @type {string}
   * @memberof CommandModuleOptions
   */
  locale?: string;
})
```

### Nested command

If you want to use nested command, add name to commander.

```typescript
@Commander({ name: "nested" })
class TestCommander {
  @Command({ name: "command1" })
  public command1(): void {
    console.log("Run nested command1");
  }

  @Command({ name: "command2" })
  public command2(): void {
    console.log("Run nested command2");
  }
}
```

### Global options

You can set options to top level. Use `@CommanderOption` and no set commander name

```typescript
@Commander()
class GlobalOptions {
  @CommanderOption({
    description: "Output as json",
    name: "json",
    type: "boolean",
  })
  public json!: boolean;
}
```

### positional and option

```typescript
@Commander()
class TestCommander {
  // See: https://github.com/yargs/yargs#complex-example
  @Command({ describe: "start the server", name: "serve" })
  public serve(
    @CommandPositional({
      default: 5000,
      describe: "port to bind on",
      name: "port",
    })
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
    console.log(`port is ${port}`);
    console.log(`verbose is ${verbose}`);
  }
}
```

### Array positional

If you want to array positional, add `..` at the end.

```typescript
@Commander()
class TestCommander {
  @Command({ describe: "array positional", name: "list" })
  public serve(
    @CommandPositional({
      describe: "show files",
      name: "files..",
    })
    files: string[],
  ): void {
    console.log("Run array positional command");
    console.log(files);
  }
}
```

### Pipe

```typescript
@Injectable()
class StringPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    return `updated ${value}`;
  }
}

@Commander()
class TestCommander {
  @Command({ describe: "start the server", name: "serve" })
  public serve(): void {
    // token is 'updated token'
    console.log(`token is '${this.token}'`);
  }

  @CommanderOption({ demandOption: true, name: "token", type: "string" }, StringPipe)
  public token!: string;
}
```

## Example

You can try to run command!

```shell
npx ts-node -T ./examples/basic.ts basic --help
npx ts-node -T ./examples/nested-commands.ts nested show --help
npx ts-node -T ./examples/positional-and-option.ts serve --help
npx ts-node -T ./examples/many-modules.ts --help
npx ts-node -T ./examples/many-modules.ts user show
npx ts-node -T ./examples/array-positional.ts list test1 test2
npx ts-node -T ./examples/merge-commanders merge --help
npx ts-node -T ./examples/commander-option.ts --token token serve
npx ts-node -T ./examples/global-options.ts --json test show
npx ts-node -T ./examples/use-pipes.ts --token token serve
```

## Tips

You can create single executable file using [nexe](https://github.com/nexe/nexe).

See: [@anchan828/nest-commands-example](../commands-example)
