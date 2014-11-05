"use strict";
var S = require("./support.js");

function nameFromIden(t) {
	if (typeof t === typeof "string") {
		return t;
	}
	if (t.type === "Identifier") {
		return t.name;
	}
	return nameFromIden(t.base) + t.indexer + nameFromIden(t.identifier);
}

function vwrite(vars,iden,value,level) {
	level = level || 0;
	var name = nameFromIden(iden);
	// Writes a *type* not a value perse
	while (vars.length <= level) {
		vars.push({});
	}

	for (var i = level; i < vars.length; i++) {
		if (vars[i][name]) {
			level = i;
			break;
		}
	}
	// name exists at vars[level]
	// Store its type there.
	vars[level][name] = value;
}


// vars the variable database
// iden the identifier expression (MemberExpression or Identifier or the like)
// ref a boolean to return a function resulting in the type --
// used for passing values by reference
function vread(vars,iden,ref) {
	var name = nameFromIden(iden);
	for (var i = vars.length - 1; i >= 0; i--) {
		if (vars[i][name]) {
			if (ref) {
				return (function() {
					return vars[i][name];
				});
			} else {
				return vars[i][name];
			}
		}
	}
	return "nil";
}

exports.vread = vread;
exports.vwrite = vwrite;
exports.nameFromIden = nameFromIden;