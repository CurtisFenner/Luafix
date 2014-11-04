"use strict";

function underscoredCompare(key,str) {
	for (var i = 0; i < key.length; i++) {
		if (str.charAt(i) == key.charAt(i) || key.charAt(i) == "_") {
			// kay
		} else {
			return false;
		}
	}
	return true;
}

function StripUnprogram(programtext) {
	var strings = [];
	var program = [];
	var modes = [];
	//
	//
	var moves = [];
	//
	// [ symbols, newmode, DON'T include this symbol in new mode  ]

	moves.program = [];
	moves.program.push( ["\"","doublestring"] );
	moves.program.push( ["'","singlestring"] );
	moves.program.push( ["[[","squarestring"] );
	moves.program.push( ["--","comment"]);
	moves.program.push( ["--[[","multicomment"]);
	//
	moves.doublestring = [];
	moves.doublestring.push( ["\\_","doublestring"]);
	moves.doublestring.push( ["\n","error",false,"\"Strings\" may not contain newlines"]);
	moves.doublestring.push( ["\"","program",true]);
	//
	moves.singlestring = [];
	moves.singlestring.push( ["\n","error",false,"'Strings' may not contain newlines"]);
	moves.singlestring.push( ["'","program",true] );
	moves.singlestring.push( ["\\_","singlestring"]);
	//
	moves.comment = [];
	moves.comment.push( ["\n","program"]);
	//
	moves.multicomment = [];
	moves.multicomment.push( ["]]","program"]);
	//
	moves.squarestring = [];
	moves.squarestring.push(["]]","program"]);
	//
	moves.error = [];
	//
	var mode = "program";
	for (var i = 0; i < programtext.length; ) {
		var s = programtext.substring(i);
		var ops = moves[mode];
		var mark = mode;
		var nextmode = mode;
		var to = i + 1;
		for (var j = 0; j < ops.length; j++) {
			if (underscoredCompare(ops[j][0], s)) {
				nextmode = ops[j][1];
				if (!ops[j][2]) {
					mark = nextmode;
				}
				to = ops[j][0].length + i;
			}
		}
		program.push(programtext.substring(i,to));
		modes.push( mark );
		//
		mode = nextmode;
		i = to;
	}
	//
	var r = [];
	for (var i = 0; i < program.length;) {
		var j = i;
		var m = "";
		var mode = modes[i];
		while (mode == modes[j]) {
			j++;
		}
		for (var k = i; k < j; k++) {
			m += program[k];
		}
		if (mode.indexOf("string") >= 0) {
			m = "__STR__" + Math.abs(m.hashCode());
		} else if (mode != "program") {
			m = "";
		}
		r.push(m);
		i = j;
	}
	return r.join("");
}

function Fragments(programtext) {
	while (true) {
		var old = programtext;
		programtext = programtext.replace(
			/([a-zA-Z0-9_}\])]+)\s+([a-zA-Z0-9_]+)/g,"$1;$2"
		);
		if (old == programtext) {
			break;
		}
	}
	programtext = programtext.replace(/\s*;\s*;\s*/g,";");
	programtext = programtext.replace(/@/,"").replace(/\s+/," ");
	// Space around operators
	// Multi character operators:
	//		==, ~=, >=, <=, ..
	programtext = programtext.replace(/([-+*^\/%#,()[\]{}:])/g," $1 ");
	programtext = programtext.replace(/([^\.])\.([^\.])/g,"$1 . $2").replace(/\.\./g," .. ");
	programtext = programtext.replace(/([^=~<>])=([^=])/g,"$1 = $2");
	programtext = programtext.replace(/([=~<>])=/g," $1= ");
	programtext = programtext.replace(/;/g," ; ");
	return programtext.trim().split(/\s+/);
}

function Parse(fragments) {
	var r = [];
	var back = [];
	var open = [["program",0]];
	// open is a stack of opening operations
	for (var i = 0; i < fragments.length; i++) {
		var peek = open.peek()[0];
		var f = fragments[i];
		var to = (open.peek() || [0,0])[1];

		var opens = {};
		var closes = {};

		opens["then"] = true;
		closes["then"] = true;

		opens["while"] = true;

		opens["do"] = true;
		closes["do"] = peek == "while" || peek == "for" || peek == "in";

		opens["else"] = true;
		closes["else"] = true;

		opens["elseif"] = true;
		closes["elseif"] = true;

		opens["function"] = true;

		opens["for"] = true;

		opens["in"] = true;
		closes["in"] = true;

		opens["repeat"] = true;

		closes["until"] = true;

		closes["end"] = true;

		opens["if"] = true;

		opens["("] = true;
		opens["["] = true;
		opens["{"] = true;

		closes[")"] = true;
		closes["]"] = true;
		closes["}"] = true;

		if (closes[f]) {
			open.pop();
		}
		back.push([to,open.length]);
		if (opens[f]) {
			open.push([f,i]);
		}
	}
	for (var i = 0; i < fragments.length; i++) {
		r.push("<span style=float:right;>" + back[i][0] + "</span>" + ("<span class=tab></span>").repeat(back[i][1]-1) + fragments[i]);
	}
	return r;
}

function Report(programtext) {
	var report = [];
	var k = StripUnprogram(programtext);
	k = Parse(Fragments(k)).join("<br>");
	report.push(k);
	return report.join("<br><br>");
}

htmlbutton.onclick = function(){
	htmlreport.innerHTML = Report(htmlinput.value);
}

String.prototype.hashCode = function(){
	var hash = 0;
	for (var i = 0; i < this.length; i++) {
		var character = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
Array.prototype.peek = function() {
	return this[this.length-1];
}
String.prototype.repeat = function( num ) {
	return new Array( num + 1 ).join( this );
}
