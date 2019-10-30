# @anchan828/nest-commands

Make command line tools based on yargs.

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

## Example

You can try to run command!

```shell
npx ts-node ./examples/basic.ts basic --help
npx ts-node ./examples/nested-commands.ts nested show --help
npx ts-node ./examples/positional-and-option.ts serve --help
npx ts-node ./examples/many-modules.ts --help
npx ts-node ./examples/many-modules.ts user show
```

## Tips

You can create single executable file using [nexe](https://github.com/nexe/nexe).
[@anchan828/nest-commands-example](../commands-example)
