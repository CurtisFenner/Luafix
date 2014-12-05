"use strict";

var fs = require("fs");
var luaparse = require("luaparse");
var T = require("./typecheck.js");
var V = require("./variables.js");
var S = require("./support.js");
var F = require("./format.js");
var Tag = require("./tag.js").Tag;
var Type = require("./types.js").Type;

Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
};

Array.prototype.peek = function() {
	return this[this.length-1];
};



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




var tree = luaTree("simple.lua");

// Jobs:
// * Tag all identifiers with their declaration (or null if global)
// * Tag all tree objects with an ID representing their lexical order
//   (no skips, starting at 1)

Tag.Tag(tree);
Type.Type(tree);

var errors = [];

console.log("");
F.Heading("ERRORS & WARNINGS");
F.Center(errors.length + " type errors/warnings reported");
F.Heading("ERRORS & WARNINGS");

for (var i = 0; i < errors.length; i++) {
	F.Center(i+1,"~");
	F.Show(errors[i][0] + " in");
	F.Show(F.Pretty(errors[i][1]));
}

console.log("");
F.Line();
console.log("");

F.Show(F.Pretty(tree.body))