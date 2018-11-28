import config from './config/config.json';
import { User, Product } from './models';

const user = new User();
const product = new Product();

console.log(config.name);

