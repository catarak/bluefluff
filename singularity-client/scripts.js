const { EditorView, basicSetup } = window.CM.codemirror;
const { javascript } = window.CM["@codemirror/lang-javascript"];
const { EditorState, StateEffect, StateField, EditorSelection } = window.CM["@codemirror/state"];
const { oneDark } = window.CM['@codemirror/theme-one-dark'];
const { Range, Decoration } = window.CM["@codemirror/view"];

let actionList = null;
let currentAction = 0;
let playing = false;
let controlPanelVisible = true;
let controlPanel = null;
let editorView = null;
let actionIndex = 1;
let furbyInterval = null;

function startFurby() {
	actionIndex = 1;
	furbyInterval = setInterval(() => {
		scrollToLine(actionIndex);
		actionIndex += 1;
	}, 1000);
}

function stopFurby() {
	clearInterval(furbyInterval);
}

function handleClickPlay(e) {
	const button = e.target;
	if (!playing) {
		button.textContent = "Stop";
		playing = true;
		startFurby();
	} else {
		button.textContent = "Start";
		playing = false;
		stopFurby();
	}
}

function handleKeyDown(e) {
	if (e.key === "h") {
		if (controlPanelVisible) {
			controlPanelVisible = false;
			controlPanel.classList.remove("visible");
		} else {
			controlPanelVisible = true;
			controlPanel.classList.add("visible");
		}
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
		(previousValue, currentValue) => previousValue + currentValue.Action + "\n",
		initialContent
	);

	
	const startButton = document.getElementById("startButton");
	startButton.addEventListener("click", handleClickPlay);
	controlPanel = document.getElementById("controlPanel");
	const editorContainer = document.getElementById("codePanel");

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
			fontSize: "20pt",
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
		extensions: [basicSetup, javascript(), EditorState.readOnly.of(true), oneDark, changeFontSize],
		parent: editorContainer
	});

	setTimeout(() => {
		scrollToLine(1)
	}, 5000);

	

}, false);

document.addEventListener("keydown", handleKeyDown);

