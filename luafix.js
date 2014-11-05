"use strict";

var fs = require("fs");
var luaparse = require("luaparse");
var T = require("./typecheck.js");
var V = require("./variables.js");
var S = require("./support.js");
var F = require("./format.js");

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



function Process(body,vars,level,errs) {
	vars = vars || {};
	for (var i = 0; i < body.length; i++) {
		var s = body[i];
		if (s.type === "FunctionDeclaration") {
			// Declares an identifier
			V.vwrite(vars, s.identifier, "function", s.isLocal ? level : 0);
		}
		if (s.type === "AssignmentStatement") {
			for (var j = 0; j < s.variables.length; j++) {
				V.vwrite(vars, s.variables[j], T.type(s.init[j], vars, errs), 0);
			}
		}
		if (s.type === "LocalStatement") {
			for (var j = 0; j < s.variables.length; j++) {
				V.vwrite(
					vars,
					s.variables[j],
					T.type(s.init[j], vars, errs),
					level
				);
			}
		}
		if (s.type === "CallStatement") {
			T.type(s.expression, vars, errs);
			for (var j = 0; j < s.expression.arguments.length; j++) {
				T.type(
					s.expression.arguments[j],
					vars,
					errs
				);
			}
		}
		if (s.type === "IfClause") {
			var cond = T.type(s.condition, vars, errs);
			if (T.typeCheck(
					cond,
					["number","string","table","function","nil"]
				)) {
				errs.push(
					["Condition in clause is always " + cond
					+ ", always passing condition.",s]
				);
			}
			//
			Process(s.body,vars,level,errs);
		}

		if (s.type === "IfStatement") {
			for (var i = 0; i < s.clauses.length; i++) {
				Process(clauses[i],vars,level + 1,errs);
			}
		}
	}
	// Processes a body
}


//
// Standard Library
var vars = [];
V.vwrite(vars,"print","function");
V.vwrite(vars,"pack","function");
V.vwrite(vars,"unpack","function");
V.vwrite(vars,"math","table");
V.vwrite(vars,"string","table");
V.vwrite(vars,"table","table");
V.vwrite(vars,"coroutine","table");
V.vwrite(vars,"_G","table");
//

var errs = [];

Process(tree.body,vars,0,errs);
console.log(Array(45).join('\n'));
console.log("\n\n\n\n\n");
F.Heading("ERRORS");
F.Center(errs.length + " type errors reported");
F.Heading("ERRORS");

for (var i = 0; i < errs.length; i++) {
	console.log("\n");
	F.Center(i+1,"~");
	console.log("\t",errs[i][0]);
	console.log("\t\tin");
	console.log(F.Tab(F.Pretty(errs[i][1]),2));
}

console.log("\n\n\n");
F.Line();
console.log("\n\n\n");

console.log(F.Pretty(tree.body))