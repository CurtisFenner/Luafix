var nothing = function() { };

// A *type* is an object
// {types:{}, metas:{}}
// Where metas point to table declarations...?
// Types are strings from this list
// nil, boolean, number, string, table, function, coroutine, any

var Type = {};
Type.Type = function(obj, vars) {
	if (!vars) {
		console.log("Type not passed vars when given",
			(obj + "").substring(0,200));
	}
};

Type.Chunk = function(chunk, vars) {
	vars.push([]);
	// Chunks have their own scope. They don't clean it up. Parents have to do
	// that.
	var body = chunk.body;
	for (var i = 0; i < body.length; i++) {
		Type.Type(body[i], vars);
	}
};

Type._Tuple = function(tuple, vars) {
	var a = [];
	for (var i = 0; i < tuple.length; i++) {
		a[i] = Type.Type(tuple[i], vars);
	}
	return a;
};

Type.AssignmentStatement = function(assign, vars) {
	Type.Type(assign.variables, vars);
	Type.Type(assign.init, vars);
	// Ignore multiple returns (which actual ruins a lot)
	// TODO

};

Type.NumericLiteral = nothing;
Type.StringLiteral = nothing;
Type.BooleanLiteral = nothing;
Type.NilLiteral = nothing;

Type.BinaryExpression = function(op, vars) {
	Type.Type(op.left, vars);
	Type.Type(op.right, vars);
};

Type.Identifier = function(v, vars) {
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

Type.IfStatement = function(check, vars) {
	for (var i = 0; i < check.clauses.length; i++) {
		Type.Type(check.clauses[i], vars);
	}
};

Type.IfClause = function(clause, vars) {
	Type.Type(clause.condition, vars);
	Type.Type(clause.body, vars);
};
Type.ElseifClause = Type.IfClause;

Type.ElseClause = function(clause, vars) {
	Type.Type(clause.body, vars);
};

Type.CallStatement = function(call, vars) {
	Type.Type(call.expression, vars);
}

Type.CallExpression = function(call, vars) {
	Type.Type(call.base, vars);
	Type.Type(call.arguments, vars);
}

exports.Type = Type;