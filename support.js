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


function Intersection(a,b) {
	var c = [];
	for (var i = 0; i < a.length; i++) {
		if (b.contains(a[i])) {
			c.push(a[i]);
		}
	}
	return collapse(c);
}



function PrintStack(msg) {
	console.log( (new Error()).stack );
	throw("PRINT STACK ANGRY: " + msg);
}

exports.collapse = collapse;
exports.PrintStack = PrintStack;
exports.Intersection = Intersection;