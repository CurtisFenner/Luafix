"use strict";

var FALSY = ["nil","false"];
var TRUTHY = ["true","function","table","number","string"];

var V = require("./variables.js");
var S = require("./support.js");

function typeCheck(types, allow) {
	types = S.collapse(types);
	allow = S.collapse(allow);
	if (allow.contains("any")) {
		return true;
	}
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

function concatable(expression) {
	// Has a metatable?
	// TODO: FINISH METATABLE
	var typ = T.type(expression);
	return typ === "string" || typ === "number";
}

function type(expression, vars, errors) {
	var M = errors.typeMemoize;
	for (var i = 0; i < M.length; i++) {
		if (M[i][0] === expression) {
			return M[i][1];
		}
	}
	var k = typeunm(expression, vars, errors);
	M.push([expression, k]);
	return k;
}

function typeunm(expression, vars, errors) {
	if (!errors) {
		PrintStack("No errors passed to 'type'");
	}
	// Return type only
	if (expression.type === "BinaryExpression"
		|| expression.type === "LogicalExpression") {
		// METATABLES!!!!
		var op = expression.operator;
		var LT = S.collapse(type(expression.left,vars,errors));
		var RT = S.collapse(type(expression.right,vars,errors));
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
			var u = S.Intersection(LT,RT);
			if (u.length == 0 && !LT.contains("any") && !RT.contains("any")) {
				var msg = "No overlap between types " + LT + " and " + RT +
				" in comparison. (" + op + " will always be " + 
				(op == "~=") + ")";
				errors.push(
					[msg,
					expression]
				);
			}
			return "boolean";
		}
		if (op === "and") {
			if (typeCheck(LT,FALSY)) {
				errors.push(
					["[And short circuiting] " + LT +" is always falsy so " +
					"right parameter (" + RT + ") is always ignored",
					expression]
				);
			}
			return S.collapse(
				[
					type(expression.left,vars,errors),
					type(expression.right,vars,errors)
				]
			);
		}
		if (op === "or") {
			if (typeCheck(LT,"boolean") &&
				typeCheck(RT, TRUTHY)) {
				errors.push(
					["Logical or warning: \"" + LT + " or " + RT +
						"\" is always truthy and types don't match",
					expression]
				);
			}
			if (typeCheck(LT,TRUTHY)) {
				errors.push(
					["[Or short circuiting] " + LT +" is always truthy so " +
					"right parameter (" + RT + ") is always ignored",
					expression]
				);
			}
			return S.collapse(
				[
					type(expression.left,vars,errors),
					type(expression.right,vars,errors)
				]
			);
		}
	}
	if (expression.type === "Identifier") {
		return V.vread(vars,expression);
	}
	if (expression.type === "MemberExpression"
		|| expression.type === "IndexExpression") {
		var bt = type(expression.base,vars,errors);
		if (!typeCheck(bt,"table")) {
			errors.push(["Cannot index " + bt + " with '" +
				expression.indexer + "'",
				expression]);
		}
		return V.vread(vars,expression);
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
		var bt = type(expression.base,vars,errors);
		if (!typeCheck(bt,"function")) {
			errors.push([
				"Cannot call type " + bt + " (requires a function)",
				expression
			]);
		}
		for (var i = 0; i < expression.arguments.length; i++) {
			type(expression.arguments[i], vars, errors);
		}
		return "any"; //TODO
	}
	if (expression.type === "UnaryExpression") {
		var arg = expression.argument;
		var argt = type(arg,vars,errors);
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

exports.type = type;
exports.typeCheck = typeCheck;