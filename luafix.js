"use strict";
var fs = require("fs");
var luaparse = require("luaparse");

Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}



function luaFile(fname) {
	return fs.readFileSync(fname,"ascii");
}

function luaTree(fname) {
	return luaparse.parse(luaFile(fname));
}


/*
Tree:
comments: List of comment data
body: Array of elements inside
	FunctionDeclaration


Tree:
	type: string FunctionDeclaration / Chunk / AssignmentStatement, etc
	comments: array of Comments
	body: Array of trees (lexical / execution order)

FunctionDeclaration
	identifier: Identifier | null | member expression
	isLocal: boolean
	parameters: array of Identifiers

IfStatement
	clauses: array of clauses

IfClause
	condition: an expression (e.g., BinaryExpression)
	body

ReturnStatement
	arguments: array of arguments

TableConstructorExpression
	fields: array of TableValues

TableValue
	value: an expression

LocalStatement
	variables: identifier list
	init: Array of expressions

ForNumericStatement
	variable: identifier
	start: expression
	end: expression
	step: null | expression
	body

CallStatement
	expression: CallExpression

CallExpression
	base: expression
	arguments: array of expressions

MemberExpression
	indexer: "." | ":"
	identifier
	base

IndexExpression
	base: the table - any expression
	index: expression

BinaryExpression
	left: expression, literal, identifier
	right: expression, literal, identifier
	operator: string
LogicalExpression
	same as above but for and and or

AssignmentStatement
	variables -> init
	(arrays)

Identifier
	name: string?
	type: "Identifier"

*/

var tree = luaTree("simple.lua");

// Consider the type of any given expression
// Statements / declarations don't have types, but modify
// the types of all known identifiers

// LIST OF TYPES
// string
// number
// nil
// boolean
// ["function",[a,b,..],[c,d,..]] (function of [a,b,..] -> [c,d,..])
	// function - bare means no statements about internal types
// ["table",[[a,b],[c,d],..]] (table mapping a to b, c to d, etc)
	// table - bare means no statements about internal types
// coroutine
	// ought to be "of a function" and with state, but, what to do?
// instance (ROBLOX object) (NOT nil)
//
// any (any type)
// truthy (not nil and not false)
	// super type of string, number, function, table, instance, etc.

function concatable(expression) {
	// Has a metatable?
	// TODO: FINISH METATABLE
	var typ = type(expression);
	return typ === "string" || typ === "number";
}

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

function typeCheck(types, allow) {
	types = collapse(types);
	allow = collapse(allow);
	for (var i = 0; i < types.length; i++) {
		var okay = false;
		for (var j = 0; j < allow.length; j++) {
			if (allow[j] === types[i]) {
				okay = true;
			}
		}
		if (!okay) {
			return false;
		}
	}
	return true;
}

function PrintStack(msg) {
	console.log( (new Error()).stack );
	throw("PRINT STACK ANGRY: " + msg);
}


function type(expression, vars, errors) {
	var errs = errors;
	if (!errors) {
		PrintStack("No errors passed to 'type'");
	}
	// Return type only
	if (expression.type === "BinaryExpression"
		|| expression.type === "LogicalExpression") {
		// METATABLES!!!!
		var op = expression.operator;
		var LT = collapse(type(expression.left,vars,errors));
		var RT = collapse(type(expression.right,vars,errors));
		if (op === "..") {
			var LO = typeCheck(LT,["number","string"]);
			var RO = typeCheck(RT,["number","string"]);
			if (!LO || !RO) {
				errors.push(
					[
						"Cannot concatenate on types " + LT + " and " + RT,
						expression
					]
				);
			}
			return "string";
		}
		if (op === "+" || op === "-" || op === "*" || op === "/"
			|| op === "^") {
			var LO = typeCheck(LT,["number","string"]);
			var RO = typeCheck(RT,["number","string"]);
			if (!LO || !RO) {
				errors.push(
					[
						"Cannot " + op + " on types " + LT + " and " + RT,
						expression
					]
				);
			}
			return "number";
		}
		if (op === ">" || op === "<" || op === ">=" || op === "<=") {
			var okay = LT.length === 1 && RT.length === 1 && LT[0] === RT[0];
			okay = okay && typeCheck(LT,["number","string"]);
			okay = okay && typeCheck(RT,["number","string"]);
			if (!okay) {
				errors.push(
					[
						"Cannot compare (" + op + ") on types " + LT +
						" and " + RT,
						expression
					]
				);
			}
			return "boolean";
		}
		if (op === "==" || op === "~=") {
			return "boolean";
		}
		if (op === "and" || op === "or") {
			return collapse(
				[
					type(expression.left,vars,errors),
					type(expression.right,vars,errors)
				]
			);
		}
	}
	if (expression.type === "Identifier") {
		return vread(vars,expression);
	}
	if (expression.type === "MemberExpression"
		|| expression.type === "IndexExpression") {
		var bt = type(expression.base,vars,errors);
		if (!typeCheck(bt,"table")) {
			errors.push(["Cannot index " + bt + " with '" +
				expression.indexer + "'",
				expression]);
		}
		return vread(vars,expression);
	}
	if (expression.type === "NumericLiteral") {
		return "number";
	}
	if (expression.type === "StringLiteral") {
		return "string";
	}
	if (expression.type === "TableConstructorExpression") {
		return "table"; // TODO
	}
	if (expression.type === "FunctionDeclaration") {
		return "function"; // TODO
	}
	if (expression.type === "CallExpression") {
		var bt = type(expression.base,vars,errs);
		if (!typeCheck(bt,"function")) {
			errs.push([
				"Cannot call type " + bt + " (requires a function)",
				expression
			]);
		}
		return "any"; //TODO
	}
	if (expression.type === "UnaryExpression") {
		var arg = expression.argument;
		var argt = type(arg,vars,errs);
		if (expression.operator === "not") {
			return "boolean";
		}
		if (expression.operator === "-") {
			if (!typeCheck(argt,["string","number"])) {
				errors.push(
					["Cannot negate (-) type " + argt,
					arg]
				);
			}
			return "number";
		}
		if (expression.operator === "#") {
			if (!typeCheck(argt,"table")) {
				errors.push(
					["Cannot find length (#) of type " + argt,
					arg]
				);
			}
			return "number"; // METATABLES
		}
	}
	PrintStack("'type' reached end without matching a tree");
	return "any";
}

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

function Process(body,vars,level,errs) {
	vars = vars || {};
	for (var i = 0; i < body.length; i++) {
		var s = body[i];
		if (s.type === "FunctionDeclaration") {
			// Declares an identifier
			vwrite(vars, s.identifier, "function", s.isLocal ? level : 0);
		}
		if (s.type === "AssignmentStatement") {
			for (var j = 0; j < s.variables.length; j++) {
				vwrite(vars, s.variables[j], type(s.init[j], vars, errs), 0);
			}
		}
		if (s.type === "LocalStatement") {
			for (var j = 0; j < s.variables.length; j++) {
				vwrite(vars, s.variables[j], type(s.init[j], vars, errs), level);
			}
		}
		if (s.type === "CallStatement") {
			type(s.expression,vars,errs);
			for (var j = 0; j < s.expression.arguments.length; j++) {
				type(s.expression.arguments[j],vars,errs);
			}
		}
	}
	// Processes a body
}

function strr(s,r) {
	var k = "";
	for (var i = 0; i < r; i++) {
		k += s;
	}
	return k;
}



function Tab(s,t) {
	return strr("\t",t) + s.replace(/\n\t*/g, "\n" + strr("\t",t) );
}

// TODO!
function Pretty( expr ) {
	if (typeof expr != typeof {}) {
		return "" + expr;
	}
	if (expr instanceof Array) {
		var s = "";
		for (var i = 0; i < expr.length; i++) {
			s += Pretty(expr[i]) + "\n";
		}
		return s;
	}
	if (expr.value) {
		return expr.value + "";
	}
	if (expr.name) {
		return expr.name + "";
	}
	var t = expr.type;
	if (t === "BinaryExpression" || t === "LogicalExpression") {
		return "(" + Pretty(expr.left) + " " + expr.operator +
			" " + Pretty(expr.right) + ")";
	}
	if (t === "MemberExpression") {
		return "(" + Pretty(expr.base) + ")" +
			expr.indexer + Pretty(expr.identifier);
	}
	if (t === "CallExpression") {
		var k = "(" + Pretty(expr.base) + ")(";
		for (var i = 0; i < expr.arguments.length; i++) {
			k += Pretty(expr.arguments[i]) + ",";
		} 
		return k.substring(0,k.length-1) + ")";
	}
	if (t === "FunctionDeclaration") {
		var k = "function " + Pretty(expr.identifer).replace(/[()]/g,"") + "(";
		for (var i = 0; i < expr.parameters.length; i++) {
			k += Pretty(expr.parameters[i]) + ", ";
		}
		k = k.substring(0,k.length-1);
		k += ")";
		k += Tab(Pretty(expr.body),1) + "\n";
		k += "end";
	}
	if (t === "CallStatement") {
		return Pretty(expr.expression);
	}
	return "????";
}

//
// Standard Library
var vars = [];
vwrite(vars,"print","function");
vwrite(vars,"pack","function");
vwrite(vars,"unpack","function");
vwrite(vars,"math","table");
vwrite(vars,"string","table");
vwrite(vars,"table","table");
vwrite(vars,"coroutine","table");
vwrite(vars,"_G","table");
//

var errs = [];
var W = 20 + (" ERRORS ").length + 20;
Process(tree.body,vars,0,errs);
console.log(Array(45).join('\n'));
console.log("\n\n\n\n\n");
console.log(strr("#",20) + " ERRORS " + strr("#",20));
console.log("\t",errs.length + " type error" + (errs.length != 1 ? "s" : "") + " reported");
console.log(strr("#",20) + " ERRORS " + strr("#",20));
for (var i = 0; i < errs.length; i++) {
	console.log("\n");
	console.log(strr("#",10) + " " + (i+1) + " " + strr("#",W - 12 - ("" + (i+1)).length   ) );
	console.log("\t",errs[i][0]);
	console.log("\t\tin",Pretty(errs[i][1]).replace(/\n/g,"\n\t\t"));
}

console.log("\n\n\n");
console.log(   strr("#",W) + "\n\n" );
console.log(Pretty(tree.body))