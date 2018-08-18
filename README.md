## mysql-queryHelper
### features
- support query results what you want ( *see example* )
- handle chunk of transactions at once ( *see example* )
- you can generate multiple modules ( support multi connections ) 

### dependencies
- mysql2
- lodash
- camelcase
- bluebird

## install
set config in your package.json
``` 
...
"dependencies": {
    ...
    "mysql-queryHelper": "git+https://github.com/setyourmindpark/mysql-queryHelper.git"
    ...
  }
...
```

### example
``` javascript
import mysqlQueryHelper from 'mysql-queryHelper';

const queryHelper = mysqlQueryHelper.createModule({ host: 'localhost', port: '3306', user: 'user', database: 'database', password: 'password', connectionLimit: 10 });

(async () => {
    const select = await queryHelper.execute({ query: 'SELECT NOW() AS ? FROM DUAL', params: ['NOW'], expect: 'single', camelCase: true });
    // { now: 2018-08-18T07:47:37.000Z }
    const transaction = await queryHelper.transaction([
        { query: 'INSERT INTO SAMPLE VALUES(NULL, ?,?,?,?,?)', params: ['A', 'A', 'A', 'A', 'A'] },
        { query: 'INSERT INTO SAMPLE VALUES(NULL, "A","B","C","D","E")' }
    ])
    // [ ResultSetHeader {
    //     fieldCount: 0,
    //     affectedRows: 1,
    //     insertId: 1,
    //     info: '',
    //     serverStatus: 3,
    //     warningStatus: 0 },
    // ResultSetHeader {
    //     fieldCount: 0,
    //     affectedRows: 1,
    //     insertId: 2,
    //     info: '',
    //     serverStatus: 3,
    //     warningStatus: 0 } ]
})()
```
- **query** : required 
- **params** : optional
- **expect** : optional ( default is 'many' )
- **camelCase** : optional ( default is true )