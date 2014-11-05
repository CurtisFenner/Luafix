"use strict";

function strr(s,r) {
	var k = "";
	for (var i = 0; i < r; i++) {
		k += s;
	}
	return k;
}

var W = 80;
exports.W = W;

function Heading(str) {
	Center(str,"#");
}

function Center(str,c) {
	str = " " + (str + "").trim() + " ";
	var left = W / 2 - str.length/2 << 0;
	var right = W - left - str.length;
	console.log(strr(c || " ",left) + str + strr(c || " ",right));
}

function Tab(s,t) {
	return strr("\t",t) + s.replace(/\n\t*/g, "\n" + strr("\t",t) );
}

function Line(c) {
	console.log( strr(c || "-",W) + "\n");
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
		k = k.substring(0,k.length-2);
		k += ")\n";
		k += Tab(Pretty(expr.body),1) + "\n";
		k += "end";
		return k;
	}
	if (t === "CallStatement") {
		return Pretty(expr.expression);
	}
	if (t === "IfStatement") {
		var k = "";
		for (var i = 0; i < expr.clauses.length; i++) {
			k += Pretty(expr.clauses[i]);
		}
		return k;
	}
	return "????";
}

exports.Pretty = Pretty;
exports.strr = strr;
exports.Tab = Tab;
exports.Heading = Heading;
exports.Center = Center;
exports.Line = Line;