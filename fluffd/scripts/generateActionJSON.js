const { createMarkdownObjectTableSync } = require("parse-markdown-table");
const fs = require("fs");
const path = require("path");

const actionList = fs.readFileSync(path.resolve(__dirname, './actiontable.md')).toString();
const table = createMarkdownObjectTableSync(actionList);

const actionArrayObject = JSON.stringify({ actions: [...table] });

fs.writeFileSync(path.resolve(__dirname, './actionList.json'), actionArrayObject);
console.log('done!');



