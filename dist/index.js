'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _promise = require('mysql2/promise');

var _promise2 = _interopRequireDefault(_promise);

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function createModule(config) {
    var pool = _promise2.default.createPool(config); // json or string ( connection string ) 
    async function getConnection() {
        return await pool.getConnection();
    };
    async function doQuery(_ref) {
        var conn = _ref.conn,
            query = _ref.query,
            params = _ref.params,
            expect = _ref.expect;

        var _ref2 = await conn.query(query, params),
            _ref3 = _slicedToArray(_ref2, 2),
            rows = _ref3[0],
            fields = _ref3[1];

        if (_lodash2.default.isEmpty(fields)) {
            // insert or update
            return rows;
        } else {
            if (expect === 'single') return rows[0];else return rows;
        }
    }
    var queryModule = {
        execute: async function execute(_ref4) {
            var _ref4$query = _ref4.query,
                query = _ref4$query === undefined ? '' : _ref4$query,
                _ref4$params = _ref4.params,
                params = _ref4$params === undefined ? [] : _ref4$params,
                _ref4$expect = _ref4.expect,
                expect = _ref4$expect === undefined ? 'many' : _ref4$expect,
                _ref4$camelCase = _ref4.camelCase,
                camelCase = _ref4$camelCase === undefined ? true : _ref4$camelCase;

            var conn = await getConnection();
            try {
                var rows = await doQuery({ conn: conn, query: query, params: params, expect: expect });
                conn.release();
                if (camelCase === true) {
                    if (_lodash2.default.isArray(rows)) return _lodash2.default.map(rows, function (row) {
                        return _lodash2.default.mapKeys(row, function (value, key) {
                            return (0, _camelcase2.default)(key);
                        });
                    });else return _lodash2.default.mapKeys(rows, function (value, key) {
                        return (0, _camelcase2.default)(key);
                    });
                } else {
                    return rows;
                }
            } catch (err) {
                conn.release();
                throw err;
            }
        },
        transaction: async function transaction(resources) {
            var conn = await getConnection();
            try {
                await conn.beginTransaction();
                var rows = await _q2.default.all(_lodash2.default.map(resources, function (resource) {
                    return doQuery({ conn: conn, query: resource.query, params: resource.params });
                }));
                await conn.commit();
                conn.release();
                return rows;
            } catch (err) {
                await conn.rollback();
                conn.release();
                throw err;
            }
        }
    };
    await queryModule.execute({ query: 'SELECT NOW() AS NOW FROM DUAL' }); // check connection    
    return queryModule;
};

exports.default = {
    createModule: createModule
};