import { Command, Commander, CommandOption } from "@anchan828/nest-commands";
import * as browser from "open";
@Commander({ describe: "Show author information", name: "author" })
export class AuthorCommander {
  @Command({ name: "github" })
  public async github(
    @CommandOption({ alias: "o", default: false, describe: "Open github page", name: "open", type: "boolean" })
    open: boolean,
  ): Promise<void> {
    if (open) {
      await browser("https://github.com/anchan828");
    } else {
      console.table({
        name: "anchan828",
        url: "https://github.com/anchan828",
      });
    }
  }

  @Command({ name: "twitter" })
  public async twitter(
    @CommandOption({ alias: "o", default: false, describe: "Open twitter page", name: "open", type: "boolean" })
    open: boolean,
  ): Promise<void> {
    if (open) {
      await browser("https://twitter.com/kyusyukeigo");
    } else {
      console.table({
        name: "@kyusyukeigo",
        url: "https://twitter.com/kyusyukeigo",
      });
    }
  }
}
