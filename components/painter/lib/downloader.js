
const util = require('./util');
const sha1 = require('./sha1');

const SAVED_FILES_KEY = 'savedFiles';
const KEY_TOTAL_SIZE = 'totalSize';
const KEY_PATH = 'path';
const KEY_TIME = 'time';
const KEY_SIZE = 'size';

let MAX_SPACE_IN_B = 6 * 1024 * 1024;
let savedFiles = {};

export default class Dowloader {
  constructor() {
    
    if (getApp().PAINTER_MAX_LRU_SPACE) {
      MAX_SPACE_IN_B = getApp().PAINTER_MAX_LRU_SPACE;
    }
    wx.getStorage({
      key: SAVED_FILES_KEY,
      success: function (res) {
        if (res.data) {
          savedFiles = res.data;
        }
      },
    });
  }

  download(url, lru) {
    return new Promise((resolve, reject) => {
      if (!(url && util.isValidUrl(url))) {
        resolve(url);
        return;
      }
      const fileName = getFileName(url);
      if (!lru) {
        
        wx.getFileSystemManager().getFileInfo({
          filePath: fileName,
          success: () => {
            resolve(url);
          },
          fail: () => {
            if (util.isOnlineUrl(url)) {
              downloadFile(url, lru).then((path) => {
                resolve(path);
              }, () => {
                reject();
              });
            } else if (util.isDataUrl(url)) {
              transformBase64File(url, lru).then(path => {
                resolve(path);
              }, () => {
                reject();
              });
            }
          },
        })
        return
      }

      const file = getFile(fileName);

      if (file) {
        if (file[KEY_PATH].indexOf('//usr/') !== -1) {
          wx.getFileSystemManager().getFileInfo({
            filePath: file[KEY_PATH],
            success() {
              resolve(file[KEY_PATH]);
            },
            fail(error) {
              console.error(`base64 file broken, ${JSON.stringify(error)}`);
              transformBase64File(url, lru).then(path => {
                resolve(path);
              }, () => {
                reject();
              });
            }
          })
        } else {
          
          wx.getSavedFileInfo({
            filePath: file[KEY_PATH],
            success: (res) => {
              resolve(file[KEY_PATH]);
            },
            fail: (error) => {
              console.error(`the file is broken, redownload it, ${JSON.stringify(error)}`);
              downloadFile(url, lru).then((path) => {
                resolve(path);
              }, () => {
                reject();
              });
            },
          });
        }
      } else {
        if (util.isOnlineUrl(url)) {
          downloadFile(url, lru).then((path) => {
            resolve(path);
          }, () => {
            reject();
          });
        } else if (util.isDataUrl(url)) {
          transformBase64File(url, lru).then(path => {
            resolve(path);
          }, () => {
            reject();
          });
        }
      }
    });
  }
}

function getFileName(url) {
  if (util.isDataUrl(url)) { 
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(url) || [];
    const fileName = `${sha1.hex_sha1(bodyData)}.${format}`;
    return fileName;
  } else {
    return url;
  }
}

function transformBase64File(base64data, lru) {
  return new Promise((resolve, reject) => {
    const [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
    if (!format) {
      console.error('base parse failed');
      reject();
      return;
    }
    const fileName = `${sha1.hex_sha1(bodyData)}.${format}`;
    const path = `${wx.env.USER_DATA_PATH}/${fileName}`;
    const buffer = wx.base64ToArrayBuffer(bodyData.replace(/[\r\n]/g, ""));
    wx.getFileSystemManager().writeFile({
      filePath: path,
      data: buffer,
      encoding: 'binary',
      success() {
        wx.getFileSystemManager().getFileInfo({
          filePath: path,
          success: (tmpRes) => {
            const newFileSize = tmpRes.size;
            lru ? doLru(newFileSize).then(() => {
              saveFile(fileName, newFileSize, path, true).then((filePath) => {
                resolve(filePath);
              });
            }, () => {
              resolve(path);
            }) : resolve(path);
          },
          fail: (error) => {
          
            console.error(`getFileInfo ${path} failed, ${JSON.stringify(error)}`);
            resolve(path);
          },
        });
      },
      fail(err) {
        console.log(err)
      }
    })
  });  
}

function downloadFile(url, lru) {
  return new Promise((resolve, reject) => {
    const downloader = url.startsWith('cloud://')?wx.cloud.downloadFile:wx.downloadFile
    downloader({
      url: url,
      fileID: url,
      success: function (res) {
        if (res.statusCode !== 200) {
          console.error(`downloadFile ${url} failed res.statusCode is not 200`);
          reject();
          return;
        }
        const {
          tempFilePath
        } = res;
        wx.getFileSystemManager().getFileInfo({
          filePath: tempFilePath,
          success: (tmpRes) => {
            const newFileSize = tmpRes.size;
            lru ? doLru(newFileSize).then(() => {
              saveFile(url, newFileSize, tempFilePath).then((filePath) => {
                resolve(filePath);
              });
            }, () => {
              resolve(tempFilePath);
            }) : resolve(tempFilePath);
          },
          fail: (error) => {
            
            console.error(`getFileInfo ${res.tempFilePath} failed, ${JSON.stringify(error)}`);
            resolve(res.tempFilePath);
          },
        });
      },
      fail: function (error) {
        console.error(`downloadFile failed, ${JSON.stringify(error)} `);
        reject();
      },
    });
  });
}

function saveFile(key, newFileSize, tempFilePath, isDataUrl = false) {
  return new Promise((resolve, reject) => {
    if (isDataUrl) {
      const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
      savedFiles[key] = {};
      savedFiles[key][KEY_PATH] = tempFilePath;
      savedFiles[key][KEY_TIME] = new Date().getTime();
      savedFiles[key][KEY_SIZE] = newFileSize;
      savedFiles['totalSize'] = newFileSize + totalSize;
      wx.setStorage({
        key: SAVED_FILES_KEY,
        data: savedFiles,
      });
      resolve(tempFilePath);
      return;
    }
    wx.saveFile({
      tempFilePath: tempFilePath,
      success: (fileRes) => {
        const totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;
        savedFiles[key] = {};
        savedFiles[key][KEY_PATH] = fileRes.savedFilePath;
        savedFiles[key][KEY_TIME] = new Date().getTime();
        savedFiles[key][KEY_SIZE] = newFileSize;
        savedFiles['totalSize'] = newFileSize + totalSize;
        wx.setStorage({
          key: SAVED_FILES_KEY,
          data: savedFiles,
        });
        resolve(fileRes.savedFilePath);
      },
      fail: (error) => {
        console.error(`saveFile ${key} failed, then we delete all files, ${JSON.stringify(error)}`);
        
        resolve(tempFilePath);
        
        reset();
      },
    });
  });
}

function reset() {
  wx.removeStorage({
    key: SAVED_FILES_KEY,
    success: () => {
      wx.getSavedFileList({
        success: (listRes) => {
          removeFiles(listRes.fileList);
        },
        fail: (getError) => {
          console.error(`getSavedFileList failed, ${JSON.stringify(getError)}`);
        },
      });
    },
  });
}

function doLru(size) {
  if (size > MAX_SPACE_IN_B) {
    return Promise.reject()
  }
  return new Promise((resolve, reject) => {
    let totalSize = savedFiles[KEY_TOTAL_SIZE] ? savedFiles[KEY_TOTAL_SIZE] : 0;

    if (size + totalSize <= MAX_SPACE_IN_B) {
      resolve();
      return;
    }
    
    const pathsShouldDelete = [];
    
    const allFiles = JSON.parse(JSON.stringify(savedFiles));
    delete allFiles[KEY_TOTAL_SIZE];
    const sortedKeys = Object.keys(allFiles).sort((a, b) => {
      return allFiles[a][KEY_TIME] - allFiles[b][KEY_TIME];
    });

    for (const sortedKey of sortedKeys) {
      totalSize -= savedFiles[sortedKey].size;
      pathsShouldDelete.push(savedFiles[sortedKey][KEY_PATH]);
      delete savedFiles[sortedKey];
      if (totalSize + size < MAX_SPACE_IN_B) {
        break;
      }
    }

    savedFiles['totalSize'] = totalSize;

    wx.setStorage({
      key: SAVED_FILES_KEY,
      data: savedFiles,
      success: () => {
        
        if (pathsShouldDelete.length > 0) {
          removeFiles(pathsShouldDelete);
        }
        resolve();
      },
      fail: (error) => {
        console.error(`doLru setStorage failed, ${JSON.stringify(error)}`);
        reject();
      },
    });
  });
}

function removeFiles(pathsShouldDelete) {
  for (const pathDel of pathsShouldDelete) {
    let delPath = pathDel;
    if (typeof pathDel === 'object') {
      delPath = pathDel.filePath;
    }
    if (delPath.indexOf('//usr/') !== -1) {
      wx.getFileSystemManager().unlink({
        filePath: delPath,
        fail(error) {
          console.error(`removeSavedFile ${pathDel} failed, ${JSON.stringify(error)}`);
        }
      })
    } else {
      wx.removeSavedFile({
        filePath: delPath,
        fail: (error) => {
          console.error(`removeSavedFile ${pathDel} failed, ${JSON.stringify(error)}`);
        },
      });
    }
  }
}

function getFile(key) {
  if (!savedFiles[key]) {
    return;
  }
  savedFiles[key]['time'] = new Date().getTime();
  wx.setStorage({
    key: SAVED_FILES_KEY,
    data: savedFiles,
  });
  return savedFiles[key];
}