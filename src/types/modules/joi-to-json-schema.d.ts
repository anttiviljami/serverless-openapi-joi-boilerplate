// DOCS: https://github.com/lightsofapollo/joi-to-json-schema
declare module 'joi-to-json-schema' {
  function joi2js(joi: any, transformer?: (any: any) => any): any;
  export = joi2js;
}