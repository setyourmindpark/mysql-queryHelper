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
    "mysql-queryhelper": "git+https://github.com/setyourmindpark/mysql-queryhelper.git"
    ...
  }
...
```

### EXAMPLE
``` javascript
import mysqlQueryHelper from 'mysql-queryhelper';

(async () => {
    // you can config string ( connection string ) or json. see https://www.npmjs.com/package/mysql2
    const queryHelper1 = await queryModule.createModule('mysql://user:password@host:port/database');
    const queryHelper2 = await queryModule.createModule('mysql://user:password@host2:port/database');    
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
