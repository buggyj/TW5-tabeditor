/*\
title: $:/macros/squelsh.js
type: application/javascript
module-type: macro
\*/
(function(){
/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
/*
Information about this macro
returns value of key in a data json tiddler
note that macros are not connected with the refresh mechanism -use with caution.
*/
exports.name = "squelsh";

exports.params = [
	{ name: "tid" }
];
/*
Run the macro
*/
function pad (x) {
	var padding ='';
	for (var i = 0; i < x; i++) padding = padding +'|';
	return padding;
}
exports.run = function(tid) {
	var cell=[], tiddler = this.wiki.getTiddler(tid);
	if (!tiddler) { alert("no "+ tid);return "";}
	// convert fields into a js array
	for (var atr in tiddler.fields){ 
		var cur = atr.split(":");	
		if (cur.length == 2) {
			if ((/^([0-9]+)$/.test(cur[0]) && (/^([0-9]+)$/.test(cur[1])))) {
				try {	
					cell[cur[0]][cur[1]] = tiddler.fields[atr];
				} catch(e) { 
						cell[cur[0]]=[];
						cell[cur[0]][cur[1]] = tiddler.fields[atr];
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
	return rowstrings.join('\n')+'\n';
}
})();
