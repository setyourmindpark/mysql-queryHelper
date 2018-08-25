import queryModule from './dist';

(async () => {
    const queryHelper = await queryModule.createModule('mysql://user:password@host:port/database');
    // or
    // const queryHelper = await queryModule.createModule({ host: 'host', port: 'port', user: 'user', database: 'database', password: 'password');
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