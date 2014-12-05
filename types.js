"use strict";

var nothing = function() { };

// A *type* is an object
// {types:{}, metas:{}}
// Where metas point to table declarations...?
// Types are strings from this list
// nil, boolean, number, string, table, function, coroutine, any, false

function Assign(var, type) {
	throw "Not implemented";
}

function subset(a, b) {
	for (var i = 0; i < a.length; i++) {
		if (!b.contains(a[i])) {
			return false;
		}
	}
	return true;
}

var Type = {};
Type.Type = function(obj) {
	if (obj instanceof Array) {
		return Type._Tuple(obj);
	} else if (Type[obj.type]) {
		return Type[obj.type](obj);
	} else {
		console.log("!!!!!!!!", "LuaFix Types does not recognize", obj.type,
			"!!!!!!!!");
	}
};

Type.Chunk = function(chunk) {
	// Chunks have their own scope. They don't clean it up. Parents have to do
	// that.
	var body = chunk.body;
	for (var i = 0; i < body.length; i++) {
		Type.Type(body[i]);
	}
};

Type._Tuple = function(tuple) {
	var a = [];
	for (var i = 0; i < tuple.length; i++) {
		a[i] = Type.Type(tuple[i]);
	}
	return a;
};

Type.AssignmentStatement = function(assign) {
	// Type.Type(assign.variables);
	// Type.Type(assign.init);
	var right = Type.Type(assign.init);
	var vars = assign.variables;
	for (var i = 0; i < vars.length; i++) {
		Assign(vars[i], right[i]);
	}
	// Ignore multiple returns (which actual ruins a lot)
	// TODO
};

Type.BinaryExpression = function(op) {
	var left = Type.Type(op.left);
	var right = Type.Type(op.right);
	var operator = op.operator;
	/* if (!left.metas.contains(null)) {
		// Left definitely has a metatable...
		// Technically this should be "metamethod of plus"
	} */
	// Assume not meta
	// TODO
	if (!subset(left.types, ["number", "string"])) {
		error(op, op.left + " is not a number or a string in " + operator
			+ " expression");
	}
	return {types:["number"], metas:[null] };
};

Type.Identifier = function(v) {
	// Search for v.name in vars
	for (var i = vars.length - 1; i >= 0; i--) {
		var scope = vars[i];
		for (var j = 0; j < scope.length; j++) {
			if (scope[j].name == v.name) {
				v.definition = scope[j];
				return;
			}
		}
	}
}

Type.IfStatement = function(check) {
	for (var i = 0; i < check.clauses.length; i++) {
		Type.Type(check.clauses[i]);
	}
};

Type.IfClause = function(clause) {
	Type.Type(clause.condition);
	Type.Type(clause.body);
};
Type.ElseifClause = Type.IfClause;

Type.ElseClause = function(clause) {
	Type.Type(clause.body);
};

Type.CallStatement = function(call) {
	Type.Type(call.expression);
}

Type.CallExpression = function(call) {
	Type.Type(call.base);
	Type.Type(call.arguments);
}

exports.Type = Type;