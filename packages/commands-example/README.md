# @anchan828/nest-commands-example

This package is example for command line tools

## Install

```shell
npm i -g @anchan828/nest-commands-example
```

## Usage

```shell
$ nest-commands-example --help
$ nest-commands-example author --help
$ nest-commands-example author twitter
$ nest-commands-example author github --open
```

## Tips

This package is creating single executable file using [nexe](https://github.com/nexe/nexe)

```shell
$ npm run nexe
> nexe ./dist/index.js

ℹ nexe 3.3.2
✔ Already downloaded...
✔ Compiling result
✔ Entry: 'dist/index.js' written to: commands-example
✔ Finished in 13.014s
```
