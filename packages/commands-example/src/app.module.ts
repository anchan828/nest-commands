import { CommandModule } from "@anchan828/nest-commands";
import { Module } from "@nestjs/common";
import { AuthorModule } from "./author/author.module";
import { FileModule } from "./file/file.module";

@Module({
  imports: [CommandModule.register(), AuthorModule, FileModule],
})
export class ExampleModule {}
