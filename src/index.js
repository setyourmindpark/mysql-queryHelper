import mysql2 from 'mysql2/promise';
import camelcase from 'camelcase';
import _ from 'lodash';
import q from 'q';

async function createModule( config ) {    
    const pool = mysql2.createPool( config ); // json or string ( connection string ) 
    async function getConnection() {
        return await pool.getConnection();
    };
    async function doQuery( { conn, query, params, expect }) {
        const [ rows, fields ] = await conn.query( query, params );
        if (_.isEmpty( fields )) {  // insert or update
            return rows;
        } else {
            if ( expect === 'single' ) return rows[0];
            else return rows;
        }
    }
    const queryModule = {        
        execute: async ({ query = '', params = [ ], expect = 'many', camelCase = true }) => {
            const conn = await getConnection();
            try {
                const rows = await doQuery({ conn, query, params, expect } );
                conn.release();
                if ( camelCase === true ){
                    if (_.isArray( rows )) return _.map(rows, row => _.mapKeys( row, ( value, key ) => camelcase( key )));
                    else return _.mapKeys(rows, ( value, key ) => camelcase( key ));                    
                } else {
                    return rows;
                }
            } catch ( err ) {
                conn.release();
                throw err;
            }
        },            
        transaction: async ( resources ) => {
            const conn = await getConnection();
            try {
                await conn.beginTransaction();
                const rows = await q.all( _.map( resources, resource => doQuery({ conn, query: resource.query, params: resource.params })));                
                await conn.commit();
                conn.release();
                return rows;
            } catch ( err ) {
                await conn.rollback();
                conn.release();
                throw err;
            }
        }
    }
    await queryModule.execute({ query: 'SELECT NOW() AS NOW FROM DUAL' });  // check connection    
    return queryModule;
};

export default {
    createModule
};
