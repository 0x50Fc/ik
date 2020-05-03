function copy(dst, src) {
    for (var key in src) {
        dst[key] = src[key];
    }
}

copy(ik || module.exports, require('../core/Context'));
copy(ik || module.exports, require('../core/Logic'));
copy(ik || module.exports, require('../core/ik'));
copy(ik || module.exports, require('./http'));
copy(ik || module.exports, require('./page'));
copy(ik || module.exports, require('./store'));
copy(ik || module.exports, require('./event'));