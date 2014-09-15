/*\
title: $:/plugin/bj/widgets/edit-table.js
type: application/javascript
module-type: widget


\*/
/*\
The grid widget.

This example renders a table made up of tiddlers titled `MySheet_A_1`, `MySheet_A_2`, `MySheet_A_3`, ... , `MySheet_B_1`, `MySheet_B_2`, `MySheet_B_3` etc.

```
<$grid prefix="MySheet" rows=2 cols=2/>
```

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var GridEditorWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.hack();
	this.addEventListeners([
		{type: "tclip-delete-row", handler: "handledelrow"},
		{type: "tclip-new-row", handler: "handlenewrow"}
	]);
};

/*
Inherit from the base widget class
*/
GridEditorWidget.prototype = new Widget();

GridEditorWidget.prototype.handledelrow = function(event) {
	var row = event.param ;


	this.childbody = this.children[0].children[0];//really should search down the tree for the element?

	this.childbody.children[this.rows - 1].removeChildDomNodes();
		// Remove the child widget
	this.childbody.children.splice(this.rows,1);
	this.delrow(row);
	this.rows = this.rows - 1 ;
	
	//this.execute();
	return false;
};
GridEditorWidget.prototype.hack = function(){
	var node=this;
	while(node && node.parentWidget) {
		node = node.parentWidget;
		if(node.parseTreeNode.type == "transclude" && node.parseTreeNode.attributes.tiddler.value == "$:/core/ui/EditTemplate") {
			node.parseTreeNode.attributes.tiddler.value = "$:/core/ui/Edit2Template";
			break;
		}
	}
}
GridEditorWidget.prototype.handlenewrow = function(event) {
	this.insertItem (this.rows);
	this.rows = this.rows + 1;
	//this.execute();
	return false;
};
GridEditorWidget.prototype.insertItem = function(index) {
	// Create, insert and render the new child widgets
this.childbody = this.children[0].children[0];//really should search down the tree for the element
	var widget = this.makeChildWidget(this.newrow(index));
	widget.parentDomNode = this.childbody.parentDomNode; // Hack to enable findNextSiblingDomNode() to work
	widget.parentWidget = this.childbody;
	this.childbody.children.splice(index,0,widget);
	//var nextSibling = widget.findNextSiblingDomNode();
	widget.render(this.childbody.parentDomNode,null);

	return true;
};
/*
Render this widget into the DOM
*/

GridEditorWidget.prototype.render = function(parent,nextSibling) {
	// Save the parent dom node
	this.parentDomNode = parent;
	// Compute our attributes
	this.computeAttributes();
	// Execute our logic
	this.execute();
	// Create a root domNode to contain our widget
	var domNode = this.create(parent,nextSibling);
	// Assign classes to our domNode
	var classes = this["class"].split(" ") || [];
	classes.push("tw-grid-frame");
	domNode.className = classes.join(" ");
	// Insert the root domNode for this widget
	this.domNodes.push(domNode);
	parent.insertBefore(domNode,nextSibling);
	// Render the child widgets into the domNode
	this.renderChildren(domNode,null);
};

GridEditorWidget.prototype.create = function(parent,nextSibling) {
	// Create a simple div element to contain the table
	return this.document.createElement("div");
};
GridEditorWidget.prototype.createfields = function() {
		var tiddler = $tw.wiki.getTiddler(this.variableName);
		var content = $tw.wiki.getTiddlerText(this.variableName);
		var dataRow = content.split("\n");
		var updatefields ={};
		
		for (var row=0; row<dataRow.length; row++) { 
				var pieces = dataRow[row].replace(/\"\"\"\|\"\"\"/g,"&bar;").split("|");
				for (var i=1;i<pieces.length;i++) {
					pieces[i]= pieces[i].replace(/\&bar;/g,"|"); 
					if (pieces[i]) updatefields[row+":"+(i-1)] = pieces[i];
					this.rows = row + 1 ;
					this.cols = i - 1;
				}
		} 
		$tw.wiki.addTiddler(new $tw.Tiddler(tiddler.fields,updatefields));
};
GridEditorWidget.prototype.delrow = function(n) {
	// 	function findCategory (tableOfCats, category) {	
		var tiddler = $tw.wiki.getTiddler(this.variableName);
		var content = $tw.wiki.getTiddlerText(this.variableName);
		var dataRow = content.split("\n");
		var updatefields ={},delfields ={};

		for (var atr in tiddler.fields){ 
			var cur = atr.split(":");	
			if (cur.length == 2) {
				if ((/^([0-9]+)$/.test(cur[0]) && (/^([0-9]+)$/.test(cur[1])))) {
					if (cur[0]==n) {
						updatefields[atr]=null;
					}
					else if (cur[0]>n) {
						var temp = cur[0]-1;
						updatefields[temp +":"+cur[1]]=tiddler.fields[atr];
						updatefields[atr]=null;
					}
				}
			}
		}
		$tw.wiki.addTiddler(new $tw.Tiddler(tiddler.fields,updatefields));
};
GridEditorWidget.prototype.delall= function(n) {
	// 	function findCategory (tableOfCats, category) {	
		var tiddler = $tw.wiki.getTiddler(this.variableName);
		var content = $tw.wiki.getTiddlerText(this.variableName);
		var dataRow = content.split("\n");
		var updatefields ={},delfields ={};

		for (var atr in tiddler.fields){ 
			var cur = atr.split(":");	
			if (cur.length == 2) {
				if ((/^([0-9]+)$/.test(cur[0]) && (/^([0-9]+)$/.test(cur[1])))) {
					updatefields[atr]=null;
				}
			}
		}
		$tw.wiki.addTiddler(new $tw.Tiddler(tiddler.fields,updatefields));
};
GridEditorWidget.prototype.endbutton = function(tr,row) {
	var item ={
		type: "button" ,
		attributes: {
			message: {type: "string", value: "tclip-delete-row" },
			param: {type: "string", value: row},
			class: {type: "string", value: "tc-btn-invisible"}
		},
			children: [{
				type: "transclude",
				attributes: {
					tiddler: {
						type: "string",
						value: "$:/core/images/delete-button"
			}}}
		]};

	var td = {type: "element",tag: "td", children:[]};
	td.children.push(item);
	tr.children.push(td);
};
GridEditorWidget.prototype.newbutton = function(tbody) {
	var item ={
		type: "button" ,
		attributes: {
			message: {type: "string", value: "tclip-new-row" },
			class: {type: "string", value: "tc-btn-invisible"}
		},
			children: [{
				type: "transclude",
				attributes: {
					tiddler: {
						type: "string",
						value: "$:/core/images/new-button"
			}}}
		]};
	var tr = {type:"element",tag:"tr",
					attributes: {"class": {type: "string", value: this["class"]}},
					children: []};

	var td = {type: "element",tag: "td", children:[]};
	td.children.push(item);
	tr.children.push(td);
	tbody.children.push(tr);
};
GridEditorWidget.prototype.newrow = function(row) {
	var tr = {type:"element",tag:"tr",
					attributes: {"class": {type: "string", value: this["class"]}},
					children: []};
	for(var col=0; col<this.cols; col++) {
		var td = {type: "element",tag: "td", children:[]};

		var edtextarea ={
			type: "edit-text" ,
			attributes: {
				tiddler: {type: "string", value: this.variableName },
				tag: {type: "string", value: "textarea"},
				field: {type: "string", value: row+":"+col}
			}
		}
		
		var ed ={
			type: "edit-text" ,
			attributes: {
				tiddler: {type: "string", value: this.variableName },
				field: {type: "string", value: row+":"+col}
			}
		}

	if (row == 0) {
		td.children.push(ed);
	}
	else {
		td.children.push(edtextarea);
	}

		tr.children.push(td);
	}
	if (row == 0) {
		 this.newbutton(tr);
	}
	else {
		this.endbutton(tr,row);
	}
	return tr;

};
GridEditorWidget.prototype.execute = function() {
	// Get the widget attributes
	this.template = this.getAttribute("template");
	this.editTemplate = this.getAttribute("editTemplate");
	this.editField = "text";
	this.variableName = this.getAttribute("tiddler",this.getVariable("currentTiddler"));
	this.editTitle = this.variableName;
	this.prefix = this.getAttribute("prefix","Grid");
	this.rows = parseInt(this.getAttribute("rows","5"),10);
	this.cols = parseInt(this.getAttribute("cols","5"),10);
	this["class"] = "reactive-table";
	this.createfields();
	// Build the child widget tree
	var table = {type: "element",tag: "table", children:[]};
	var tbody = {type: "element",tag: "tbody", children:[]};	
	for(var row=0; row<this.rows; row++) {	
		tbody.children.push(this.newrow(row));
	}
	table.children.push(tbody);
	// Append the contents enclosed by the grid widget
	var children = [table];
	if (this.parseTreeNode && this.parseTreeNode.children) {
		//children = children.concat(this.parseTreeNode.children);
	}
	// Make all of the child widgets
	this.makeChildWidgets(children);

};

GridEditorWidget.prototype.getTableCellTitle = function(col,row) {
	var val;
	try {
		this.json = (!!this.json)?this.json:$tw.wiki.getTiddlerData(this.jsontid);
		val=this.json[this.index][col][row];
	  return (!!val)?val:null;
	} catch(e){ 
		
		return null;
	}
	var c = String.fromCharCode(col % 26 + "A".charCodeAt(0));
	col = Math.floor(col/26);
	while(col>0) {
		c = String.fromCharCode(col % 26 + "A".charCodeAt(0) - 1) + c;
		col = Math.floor(col/26);
	}
	return this.prefix + "_" + c + "_" + (row + 1);
};

GridEditorWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes.tiddler || changedAttributes["class"]) {
		this.refreshSelf();
		return true;
	} else {
		if(changedTiddlers[this.jsontid]) {
			
			this.refreshSelf();
			return true;
		}
		else
			return this.refreshChildren(changedTiddlers);
	}
};
function pad (x) {
	var padding ='';
	for (var i = 0; i < x; i++) padding = padding +'|';
	return padding;
}
GridEditorWidget.prototype.squelsh = function() {
	var cell=[], tiddler = this.wiki.getTiddler(this.variableName);
	if (!tiddler) { alert("no "+ tid);return "";}
	// convert fields into a js array
	for (var atr in tiddler.fields){ 
		var cur = atr.split(":");	
		if (cur.length == 2) {
			if ((/^([0-9]+)$/.test(cur[0]) && (/^([0-9]+)$/.test(cur[1])))) {
				try {	
					cell[cur[0]][cur[1]] = tiddler.fields[atr].replace(/\n/g,"<br>").replace(/\|/g,'"""|"""');
				} catch(e) { 
						cell[cur[0]]=[];
						cell[cur[0]][cur[1]] = tiddler.fields[atr].replace(/\n/g,"<br>").replace(/\|/g,'"""|"""');
				}
			}
		}
	}
	//covert array to a wiki table
	var  rowstrings =[],max=0;
	for (var i = 0; i < cell.length; i++) { 
		if (cell[i] && cell[i].length>max) 	max = cell[i].length;
	}
	for (var i = 0; i < cell.length; i++) { 
		if (!cell[i]) 	rowstrings[i] = pad(max+1);
		else 			rowstrings[i] = '|'+cell[i].join('|')+ pad(max-cell[i].length+1); 
	}
	//alert(rowstrings.join());
	this.delall();
	return rowstrings.join('\n')+'\n';
}

/*
Get the tiddler being edited and current value
*/
GridEditorWidget.prototype.getEditInfo = function() {
	// Get the edit value
	var self = this,
		value,
		update;

	// Get the current tiddler and the field name
	var tiddler = this.wiki.getTiddler(this.editTitle);
	if(tiddler) {
		// If we've got a tiddler, the value to display is the field string value
		value = tiddler.getFieldString(this.editField);
	} else {
		// Otherwise, we need to construct a default value for the editor
		value = "|&nbsp;|&nbsp;|\n|&nbsp;|&nbsp;|\n" ;

		if(this.editDefault !== undefined) {
			value = this.editDefault;
		}
	}
	update = function(value) {
		var tiddler = self.wiki.getTiddler(self.editTitle),
			updateFields = {
				title: self.editTitle
			};
		updateFields[self.editField] = value;
		self.wiki.addTiddler(new $tw.Tiddler(self.wiki.getCreationFields(),tiddler,updateFields,self.wiki.getModificationFields()));
	};

	return {value: value, update: update};
};

GridEditorWidget.prototype.saveChanges = function(text,deleting) {
	if (deleting) {
		this.deleted = true;
	} else if (this.deleted) {
		return;
	}
	var editInfo = this.getEditInfo();
	if(text !== editInfo.value) {
		editInfo.update(text);
	}
};

GridEditorWidget.prototype.save = function(deleting) {
	this.saveChanges(this.squelsh(),deleting);	
};



exports["edit-grid"] = GridEditorWidget;


})();
