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

function createModule(_ref) {
    var host = _ref.host,
        port = _ref.port,
        user = _ref.user,
        database = _ref.database,
        password = _ref.password,
        connectionLimit = _ref.connectionLimit;

    var pool = _promise2.default.createPool({ host: host, port: port, user: user, database: database, password: password, connectionLimit: connectionLimit });
    async function getConnection() {
        return await pool.getConnection();
    };
    async function doQuery(_ref2) {
        var conn = _ref2.conn,
            query = _ref2.query,
            params = _ref2.params,
            expect = _ref2.expect;

        var _ref3 = await conn.query(query, params),
            _ref4 = _slicedToArray(_ref3, 2),
            rows = _ref4[0],
            fields = _ref4[1];

        if (_lodash2.default.isEmpty(fields)) {
            // insert or update
            return rows;
        } else {
            if (expect === 'single') return rows[0];else return rows;
        }
    }
    var queryModule = {
        execute: async function execute(_ref5) {
            var _ref5$query = _ref5.query,
                query = _ref5$query === undefined ? '' : _ref5$query,
                _ref5$params = _ref5.params,
                params = _ref5$params === undefined ? [] : _ref5$params,
                _ref5$expect = _ref5.expect,
                expect = _ref5$expect === undefined ? 'many' : _ref5$expect,
                _ref5$camelCase = _ref5.camelCase,
                camelCase = _ref5$camelCase === undefined ? true : _ref5$camelCase;

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
    return queryModule;
};

exports.default = {
    createModule: createModule
};