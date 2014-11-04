function permute(str)
	if #str <= 1 then
		return {str};
	end
	local t = {};
	for i = 1, #str do
		local sub = str:sub(1,i-1) .. str:sub(i+1);
		local ts = permute(sub);
		for j = 1, #ts do
			table.insert(t, str:sub(i,i) .. ts[j])
		end
	end
	return t
end

local list = {1,2,3,4,5};
table.sort(list, function(a,b)
return math.sin(a) > math.sin(b);
end);
print(unpack(list));

function subsequences(str)
	if #str == 0 then
		return {""};
	end
	local t = {};
	remainder = subsequences(str:sub(2));
	for _, rsub in pairs(remainder) do
		table.insert(t, rsub);
		table.insert(t, str:sub(1,1) .. rsub);
	end
	return t;
end

function removeDuplicates(list)
	local used = {};
	local result = {};
	for i = 1, #list do
		local value = list[i]
		if not used[value] then
			used[value] = true
			table.insert(result,value)
		end
	end
	return result;
end

function subanagrams(word)
	local subs = subsequences(word);
	local subanas = {};
	for i = 1, #subs do
		local perms = removeDuplicates(permute(subs[i]));
		for j = 1, #perms do
			table.insert(subanas, perms[j])
		end
	end
	return subanas
end




Dictionary = {
	"amp","eel","map","peel","ample","example"
};


-- Filters a list to only contain dictionary words
function filter(list,dictionary)
	local hash = {}
	for i = 1, #dictionary do
		hash[dictionary[i]] = true;
	end
	local result = {};
	for i = 1, #list do
		if hash[list[i]] then
			table.insert(result,list[i]);
		end
	end
	return result;
end


for i = 1, #Dictionary do
	print(Dictionary[i])
	print( "",unpack( filter( subanagrams(Dictionary[i]) , Dictionary ) ) );
end

print("fin");