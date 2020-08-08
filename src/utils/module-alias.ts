import moduleAlias from 'module-alias';
import * as path from 'path';
const files = path.resolve(__dirname, '../..');

console.log(files)

moduleAlias.addAliases({
    '@src': path.join(files, 'src'),
    '@test': path.join(files, 'test')
})