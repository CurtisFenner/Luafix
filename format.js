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
	t = t || 1;
	return strr("\t",t) + s.replace(/\n/g, "\n" + strr("\t",t) ).replace(/\n\t+$/,"\n");

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
	var t = expr.type;
	if (t === "StringLiteral") {
		return "\"SomeStringLiteral\"";
	}
	if (expr.value !== undefined) {
		return expr.value + "";
	}
	if (expr.name !== undefined) {
		return expr.name + "";
	}
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
		var name = Pretty(expr.identifier).replace(/[()]/g,"");
		var k = "function " + name + "(";
		for (var i = 0; i < expr.parameters.length; i++) {
			k += Pretty(expr.parameters[i]) + ", ";
		}
		k = k.substring(0,k.length-2);
		k += ")\n";
		k += Tab(Pretty(expr.body),1);
		k += "end";
		if (expr.isLocal) {
			k = "local " + k;
		}
		return k;
	}
	if (t === "CallStatement") {
		return Pretty(expr.expression);
	}
	if (t === "IfClause") {
		var k = "if " + Pretty(expr.condition) + " then\n";
		k += Tab(Pretty(expr.body));
		return k;
	}
	if (t === "ElseClause") {
		var k = "else\n";
		k += Tab(Pretty(expr.body));
		return k;
	}
	if (t === "IfStatement") {
		var k = "";
		for (var i = 0; i < expr.clauses.length; i++) {
			k += Pretty(expr.clauses[i]);
		}
		return k + "end";
	}
	if (t === "ReturnStatement") {
		var k = "return ";
		for (var i = 0; i < expr.arguments.length; i++) {
			k += Pretty(expr.arguments[i]) + ", ";
		}
		k = k.substring(0,k.length-2);
		return k;
	}
	if (t === "AssignmentStatement") {
		var k = "";
		for (var i = 0; i < expr.variables.length; i++) {
			k += Pretty(expr.variables[i]) + ", ";
		}
		k = k.substring(0,k.length-2);
		k += " = ";
		for (var i = 0; i < expr.init.length; i++) {
			k += Pretty(expr.init[i]) + ", " ;
		}
		k = k.substring(0,k.length-2);
		return k;
	}
	if (t === "UnaryExpression") {
		return "(" + expr.operator + " " + Pretty(expr.argument) + ")";
	}
	return "????????";
}

function Show(text) {
	var line = "";
	text += "\n";
	var wrap = 0;
	var nowrap = ".0123456789abcdefghijklmnopqrstuvwxyz" +
		"ABCDEFGHJIKLMNOPQRSTUVWXYZ_";
	var wrappable = " \t#,+*-/%~><";
	var T = 8;
	var w = T;
	var lasttabs = 0;
	for (var i = 0; i < text.length; i++) {
		var c = text.charAt(i);
		if (wrappable.indexOf(c) >= 0) {
			wrap = i;
		}
		if (c == "\n") {
			wrap = 0;
			w = T;
			var pre = strr("\t",lasttabs);
			if (lasttabs > 0) {
				pre = "..." + pre;
			}
			console.log(pre + "\t" + line);
			lasttabs = 0; // line.replace(/[^\t]/g,"").length;
			line = "";
			continue;
		}
		w++;
		if (c == "\t") {
			w += T - 1;
		}
		line += c;
		if (w > W) {
			var p = line.substring(0,wrap)
			console.log("\t" + p);
			lasttabs = p.replace(/[^\t]/g,"").length + 1;
			line = line.substring(wrap);
			wrap = 0;
			w = T;
		}
	}
}

exports.Pretty = Pretty;
exports.strr = strr;
exports.Tab = Tab;
exports.Heading = Heading;
exports.Center = Center;
exports.Line = Line;
exports.Show = Show;
