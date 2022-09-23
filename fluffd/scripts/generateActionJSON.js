const { createMarkdownObjectTableSync } = require("parse-markdown-table");
const fs = require("fs");
const path = require("path");

//Input | Index | SubIndex | specific | Action 

const actionList = fs.readFileSync(path.resolve(__dirname, './actiontable.md')).toString();
let table = createMarkdownObjectTableSync(actionList);
table = [...table];
table = table.map(action => {
	const text = `${action.Input} ${action.Index} ${action.SubIndex} ${action.specific} ${action.Action}`
	return {...action, text}
})

const actionArrayObject = JSON.stringify({ actions: table });

fs.writeFileSync(path.resolve(__dirname, './actionList.json'), actionArrayObject);
console.log('done!');



