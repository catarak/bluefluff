const { EditorView, basicSetup } = window.CM.codemirror;
const { javascript } = window.CM["@codemirror/lang-javascript"];
const { markdown } = window.CM["@codemirror/lang-markdown"];
const { html } = window.CM["@codemirror/lang-html"];
const { css } = window.CM["@codemirror/lang-css"];
const { EditorState, StateEffect, StateField, EditorSelection } = window.CM["@codemirror/state"];
const { oneDark } = window.CM['@codemirror/theme-one-dark'];
const { Range, Decoration } = window.CM["@codemirror/view"];

let actionList = null;
let currentAction = 0;
let playing = false;
let controlPanelVisible = true;
let controlPanel = null;
let hideButton = null;
let startButton = null;
let editorView = null;
let actionIndex = 736;
let furbyInterval = null;
const NUM_ACTIONS = 1596;
let furbyStatus;
let actionNumber = null;

const socket = io("http://localhost:3872");

let serverUrl = "http://localhost:3872";
const actionPath = "/cmd/action";
// post with params: {"params":{"input":"1","index":"1","subindex":"1","specific":"1"}}:
const debugPath = "/cmd/debug"

// Example POST method implementation:
async function postData(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		credentials: 'same-origin', // include, *same-origin, omit
		// headers: {
		// 	'Content-Type': 'application/json'
		// 	// 'Content-Type': 'application/x-www-form-urlencoded',
		// },
		redirect: 'follow', // manual, *follow, error
		referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	return response.json(); // parses JSON response into native JavaScript objects
}

function sendAction(index) {
	const action = actionList[index]
	const params = {
		input: action.Input,
		index: action.Index,
		subindex: action.SubIndex,
		specific: action.specific
	}
	postData(`${serverUrl}${actionPath}`, { params }).catch((e) => {
		console.log(e);
	});
}

function sendDebug() {
	const params = {};
	postData(`${serverUrl}${debugPath}`, { params }).catch((e) => {
		console.log(e);
	});
}

function toggleFurby() {
	if(!playing) {
		startFurby();
	} else {
		stopFurby();
	}
}

function startFurby() {
	startButton.textContent = "Stop";
	playing = true;
	actionIndex = parseInt(actionNumber.value);
	sendDebug();
	furbyInterval = setInterval(() => {
		scrollToLine(actionIndex);
		sendAction(actionIndex - 1);
		actionIndex += 1;
		if (actionIndex > NUM_ACTIONS) {
			actionIndex = 1;
		}
	}, 5000);
}

function stopFurby() {
	startButton.textContent = "Start";
	playing = false;
	clearInterval(furbyInterval);
	furbyInterval = null;
}

function toggleControlPanel() {
	if (controlPanelVisible) {
		controlPanelVisible = false;
		controlPanel.classList.remove("visible");
	} else {
		controlPanelVisible = true;
		controlPanel.classList.add("visible");
	}
}

function handleKeyDown(e) {
	if (e.key === "h") {
		toggleControlPanel();
	} else if (e.key === "s") {
		toggleFurby();
	}
}

function scrollToLine(lineNo) {
	const line = editorView.state.doc.line(lineNo).from;
	editorView.dispatch({
		selection: { anchor: line }
	});
	editorView.dispatch({
		effects: EditorView.scrollIntoView(
			line,
			{ y: "center", x: "center" }
		),
	})
}

document.addEventListener('DOMContentLoaded', async function () {
	const response = await fetch('actionList.json');
	const data = await response.json();
	actionList = data.actions;
	
	const initialContent = "";
	const editorContent = actionList.reduce(
		(previousValue, currentValue) => previousValue + currentValue.text + "\n",
		initialContent
	);

	
	startButton = document.getElementById("startButton");
	startButton.addEventListener("click", toggleFurby);

	controlPanel = document.getElementById("controlPanel");
	const editorContainer = document.getElementById("codePanel");

	hideButton = document.getElementById("hideButton");
	hideButton.addEventListener("click", toggleControlPanel);

	furbyStatus = document.getElementById("furbyStatus");

	actionNumber = document.getElementById("actionNumber")
	actionNumber.value = actionIndex;

	// const addMarks = StateEffect.define();
	// const filterMarks = StateEffect.define();

	// const markField = StateField.define({
	// 	create() { return Decoration.none },
	// 	update(value, tr) {
	// 		value = value.map(tr.changes)
	// 		for (let effect of tr.effects) {
	// 			if (effect.is(addMarks)) value = value.update({ add: effect.value, sort: true })
	// 			else if (effect.is(filterMarks)) value = value.update({ filter: effect.value })
	// 		}
	// 		return value
	// 	},
	// 	provide: f => EditorView.decorations.from(f)
	// });

	// const strikeMark = Decoration.mark({
	// 	attributes: { style: "background-color: red" }
	// });

	const changeFontSize = EditorView.theme({
		"&": {
			fontSize: "25pt",
		},
		".cm-line.cm-activeLine": {
			backgroundColor: "#424757"
		},
		".cm-gutterElement.cm-activeLineGutter": {
			backgroundColor: "#424757"
		}
	}, { dark: true });

	editorView = new EditorView({
		doc: editorContent,
		extensions: [basicSetup, css(), EditorState.readOnly.of(true), oneDark, changeFontSize],
		parent: editorContainer
	});
	
}, false);

document.addEventListener("keydown", handleKeyDown);

socket.on('connected', () => {
	console.log('furby connected');
	furbyStatus.textContent = "Connected";
});

socket.on('disconnected', () => {
	console.log('furby disconnected');
	furbyStatus.textContent = "Disconnected";
});	

socket.on('hello', () => {
	console.log('hello');
	socket.emit('status');
});	


