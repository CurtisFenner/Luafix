var nothing = function() { };

var Tag = {};
Tag.Tag = function(obj, vars) {
	if (!vars) {
		console.log("Tag not passed vars when given",
			JSON.stringify(obj).replace(/\n+/g," ").substring(0,200) );
	}
	vars = vars || [];
	vars.objects = vars.objects || [];
	vars.id = vars.id || 0;
	vars.parent = null;
	//
	vars.id++;
	obj.id = vars.id;
	vars.objects.push(obj);
	obj.parent = vars.parent;
	vars.parent = obj;
	if (obj instanceof Array) {
		Tag._Tuple(obj, vars);
	} else if (Tag[obj.type]) {
		Tag[obj.type](obj, vars);
	} else {
		console.log("!!!!!!!!", "LuaFix does not recognize", obj.type, "!!!!!!!!");
	}
	vars.parent = obj.parent;
};

Tag.Chunk = function(chunk, vars) {
	vars.push([]);
	// Chunks have their own scope. They don't clean it up. Parents have to do
	// that.
	var body = chunk.body;
	for (var i = 0; i < body.length; i++) {
		Tag.Tag(body[i], vars);
	}
};

Tag._Tuple = function(tuple, vars) {
	for (var i = 0; i < tuple.length; i++) {
		Tag.Tag(tuple[i], vars);
	}
};

Tag.AssignmentStatement = function(assign, vars) {
	Tag.Tag(assign.variables, vars);
	Tag.Tag(assign.init, vars);
};

Tag.NumericLiteral = nothing;
Tag.StringLiteral = nothing;
Tag.NilLiteral = nothing;
Tag.BooleanLiteral = nothing;

Tag.BinaryExpression = function(op, vars) {
	Tag.Tag(op.left, vars);
	Tag.Tag(op.right, vars);
};

Tag.Identifier = function(v, vars) {
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

Tag.IfStatement = function(check, vars) {
	for (var i = 0; i < check.clauses.length; i++) {
		Tag.Tag(check.clauses[i], vars);
	}
};

Tag.IfClause = function(clause, vars) {
	Tag.Tag(clause.condition, vars);
	Tag.Tag(clause.body, vars);
};
Tag.ElseifClause = Tag.IfClause;

Tag.ElseClause = function(clause, vars) {
	Tag.Tag(clause.body, vars);
};

Tag.CallStatement = function(call, vars) {
	Tag.Tag(call.expression, vars);
};

Tag.CallExpression = function(call, vars) {
	Tag.Tag(call.base, vars);
	Tag.Tag(call.arguments, vars);
};

Tag.LocalStatement = function(stat, vars) {
	var left = stat.variables;
	Tag.Tag(left, vars);
	for (var i = 0; i < left.length; i++) {
		vars.peek().push(left[i]);
		left[i].definition = left[i]; // TODO ?
	}
	Tag.Tag(stat.init, vars);
}



exports.Tag = Tag;