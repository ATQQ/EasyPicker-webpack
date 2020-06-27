const { getDirFileByType } = require('./fileUtil')
const path = require('path')
function getEntry() {
    const files = getDirFileByType('./src/js/views', '.js')
    let entry = {}
    files.forEach(file => {
        const fileName = path.basename(file)
        const key = fileName.slice(0, fileName.lastIndexOf('.js'))
        entry[key] = file
    })
    return entry
}

console.log(getEntry());