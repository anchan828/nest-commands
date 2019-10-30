import { CommandModule } from "@anchan828/nest-commands";
import { Module } from "@nestjs/common";
import { AuthorModule } from "./author/author.module";

@Module({
  imports: [CommandModule.register(), AuthorModule],
})
export class ExampleModule {}
