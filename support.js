"use strict";

function collapse(arr,into) {
	if (!(into instanceof Array)) {
		var a = [];
		collapse(arr,a);
		return a;
	}
	if (arr instanceof Array) {
		for (var i = 0; i < arr.length; i++) {
			collapse(arr[i],into);
		}
	} else {
		if (!into.contains(arr)) {
			into.push(arr);
		}
	}
}



function PrintStack(msg) {
	console.log( (new Error()).stack );
	throw("PRINT STACK ANGRY: " + msg);
}

exports.collapse = collapse;
exports.PrintStack = PrintStack;