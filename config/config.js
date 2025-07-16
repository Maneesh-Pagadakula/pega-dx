import PropertiesReader from 'properties-reader';
import path from 'path';

const properties = PropertiesReader(path.resolve('./Config.properties'));

const config = {};
properties.each((key, value) => {
  config[key] = value;
});

export default config;
