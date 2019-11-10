import { Module } from "@nestjs/common";
import { FileCommander } from "./file.commander";

@Module({ providers: [FileCommander] })
export class FileModule {}
