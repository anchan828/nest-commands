export interface CommandReferenceModuleOptions {
  /**
   * commands module
   *
   * @type {*}
   * @memberof CommandReferenceModuleOptions
   */
  module: any;

  /**
   * The output directory. default `./docs`
   *
   * @type {string}
   * @memberof CommandReferenceModuleOptions
   */
  output?: string;

  /**
   * Set index filename. default index
   *
   * @type {string}
   * @memberof CommandReferenceModuleOptions
   */
  indexName?: string;

  /**
   * Set output locale if you want to build localized reference.
   *
   * @type {string}
   * @memberof CommandReferenceModuleOptions
   */
  locale?: string;
}
