import { list, createDirectory, getFileContent, remove, move, copy } from './Api.js';
import config from './../config.js';

const messageTranslation = {
    'TypeError: Failed to fetch': 'Cannot get a response from connector.',
};

const handleFetch = (resolve, reject) => {
    return {
        xthen: (response) => {
            const contentType = response.headers.get("content-type");
            if (! response.ok) {
                throw response.json();
            }

            if (/(application|text)\/json/.test(contentType)) {
                response.json().then(json => {
                    return setTimeout(f => {
                        resolve(json);
                    })
                });
            } else {
                // is file content to view
                response.blob().then(blob => {
                    return resolve(blob);
                });
            }
        },
        xcatch: (errorResponse) => {
            // is thrown json
            if (errorResponse && errorResponse.then) {
                errorResponse.then(errJson => {
                    return reject(errJson.errorMsg || JSON.stringify(errJson));
                });
            } else {
                return reject(messageTranslation[errorResponse] || errorResponse);
            }
        }
    }
}

const fixPath = (path) => {
    return ('/' + path).replace(/\/\//g, '/');
};

/**
 * Wrap API response for retrive file liest
 * @param {String} path
 * @returns {Object}
 */
export const getFileList = (path) => {
    path = fixPath(path);
    return new Promise((resolve, reject) => {
        return list(path)
            .then(handleFetch(resolve, reject).xthen)
            .catch(handleFetch(resolve, reject).xcatch)
    })
};

/**
 * Wrap API response for retrive file content
 * @param {String} path
 * @returns {Object}
 */
export const getFileBody = (path, filename) => {
    path = fixPath(path + '/' + filename);
    return new Promise((resolve, reject) => {
        return getFileContent(path)
            .then(handleFetch(resolve, reject).xthen)
            .catch(handleFetch(resolve, reject).xcatch)
    })
};

/**
 * Wrap API response for create folder
 * @param {String} path
 * @param {String} folder
 * @returns {Object}
 */
export const createFolder = (path, folder) => {
    path = fixPath(path);
    return new Promise((resolve, reject) => {
        return createDirectory(path, folder)
            .then(handleFetch(resolve, reject).xthen)
            .catch(handleFetch(resolve, reject).xcatch)
    })
};

/**
 * Wrap API response for remove file or folder
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
export const removeFile = (path, filenames, recursive = true) => {
    path = fixPath(path);
    return new Promise((resolve, reject) => {
        return remove(path, filenames, recursive)
            .then(handleFetch(resolve, reject).xthen)
            .catch(handleFetch(resolve, reject).xcatch)
    })
};

/**
 * Wrap API response for move file or folder
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
export const moveFile = (path, destination, filenames) => {
    path = fixPath(path);
    destination = fixPath(destination);
    return new Promise((resolve, reject) => {
        return move(path, destination, filenames)
            .then(handleFetch(resolve, reject).xthen)
            .catch(handleFetch(resolve, reject).xcatch)
    })
};

/**
 * Wrap API response for copy file or folder
 * @param {String} path
 * @param {Array} filenames
 * @param {Boolean} recursive
 * @returns {Object}
 */
export const copyFile = (path, destination, filenames) => {
    path = fixPath(path);
    return new Promise((resolve, reject) => {
        return copy(path, destination, filenames)
            .then(handleFetch(resolve, reject).xthen)
            .catch(handleFetch(resolve, reject).xcatch)
    })
};

/**
 * Calculate available actions for a file
 * @param {String} filename
 * @param {String} type
 * @returns {Array<String>}
 */
export const getActionsByFile = (filename, type) => {
    let acts = [];
    if (type === 'dir') {
        acts.push('open');
        acts.push('compress');
    }

    if (type === 'file') {
        //(config.isImageFilePattern.test(filename) || config.isEditableFilePattern.test(filename)) && acts.push('open');
        acts.push('download');
        config.isImageFilePattern.test(filename) && acts.push('open');
        config.isEditableFilePattern.test(filename) && acts.push('edit');
        config.isExtractableFilePattern.test(filename) && acts.push('extract');
        acts.push('copy');
    }

    acts.push('move');
    acts.push('perms');
    acts.push('remove');

    return acts;
}