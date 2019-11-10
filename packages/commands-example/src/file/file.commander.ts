import { Command, Commander, CommandPositional } from "@anchan828/nest-commands";
import { lstatSync, readdirSync } from "fs";
@Commander({ describe: "Show file information", name: "file" })
export class FileCommander {
  /**
   *
   * @example ts-node src/index.ts file ls src dist package.json
   * ```
   * src:
   *   app.module.spec.ts
   *   app.module.ts
   *   author
   *   file
   *   index.ts
   * dist:
   *   app.module.d.ts
   *   app.module.js
   *   app.module.spec.d.ts
   *   app.module.spec.js
   *   file
   *   index.d.ts
   *   index.js
   * package.json
   * ```
   * @param {string[]} files
   * @returns {Promise<void>}
   * @memberof FileCommander
   */
  @Command({ name: "ls" })
  public async ls(@CommandPositional({ name: "files.." }) files: string[]): Promise<void> {
    for (const file of files) {
      const stats = lstatSync(file);
      if (stats.isDirectory()) {
        console.log(`${file}:`);
        console.log(`  ${readdirSync(file).join("\n  ")}`);
      } else {
        console.log(file);
      }
    }
  }
}
