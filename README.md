## MYSQL-QUERYHELPER
### FEATURES
- support query results what you want by using **expect** and **camelcase** options
- handle chunk of transactions at once ( no need to know connection releases )
- you can use multiple modules ( support multi connections ) 

### DEPENDENCIES
- mysql2
- lodash
- camelcase
- q

### INSTALL
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

### EXAMPLE
``` javascript
import mysqlQueryHelper from 'mysql-queryHelper';

const queryHelper1 = mysqlQueryHelper.createModule({ host: 'host1', port: 'port', user: 'user', database: 'database', password: 'password', connectionLimit: 10 });
const queryHelper2 = mysqlQueryHelper.createModule({ host: 'host2', port: 'port', user: 'user', database: 'database', password: 'password', connectionLimit: 10 });

(async () => {
    const select = await queryHelper1.execute({ query: 'SELECT NOW() AS ? FROM DUAL', params: ['NOW'], expect: 'single', camelCase: true });
    // { now: 2018-08-18T07:47:37.000Z }
    const transaction = await queryHelper1.transaction([
        { query: 'INSERT INTO SAMPLE VALUES(NULL, ?,?,?,?,?)', params: ['A', 'A', 'A', 'A', 'A'] },
        { query: 'INSERT INTO SAMPLE VALUES(NULL, "A","B","C","D","E")' },
        // ...
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

    // you can switch your other db
    queryHelper2.execute({ ... })
    queryHelper2.transaction({ ... })
})()
```
- **query** : required 
- **params** : optional
- **expect** : optional ( default is 'many' )
- **camelCase** : optional ( default is true )
