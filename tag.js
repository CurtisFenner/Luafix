var Tag = {};
Tag.Tag = function(obj, vars) {
	vars.id++;
	obj.id = vars.id;
	if (obj instanceof Array) {
		Tag._Tuple(obj, vars);
		return;
	}
	if (Tag[obj.type]) {
		Tag[obj.type](obj, vars);
	} else {
		console.log(">> NO ACTION FOR TAGGING ", obj);
		console.log("(of ",obj.type,")");
	}
};

Tag.Chunk = function(chunk, vars) {
	vars.push([]); // Chunks have their own variables.
	// CHUNKS DO NOT CLEAN UP THEIR STACK BECAUSE OF REPEAT UNTIL
	var body = chunk.body;
	for (var i = 0; i < body.length; i++) {
		Tag.Tag(body[i]);
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
			}
		}
	}
}

exports = Tag;