function loadFile(fname)
	local lines = {};
	for line in io.lines(fname) do
		table.insert(lines, line);
	end
	return lines;
end

function stripUnnecessary(lines)
	-- Eliminates empty lines
	-- Removes comments
	for _, line in pairs(lines) do
		
	end
end