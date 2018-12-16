import config from './config/config.json';
import { User, Product } from './models';
import DirWatcher from './dirwatcher';
import Importer from './importer';

const user = new User();
const product = new Product();

console.log(config.name);

DirWatcher.watch(config.watchPath, config.watchDelay);
