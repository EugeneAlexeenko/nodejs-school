import config from './config/config.json';
import { User, Product } from './models';
import DirWatcher from './dirwatcher';
import Importer from './importer';

const user = new User();
const product = new Product();
const dirwatcher = new DirWatcher();
const importer = new Importer(dirwatcher);

console.log(config.name);

dirwatcher.watch(config.watchPath, config.watchDelay);
