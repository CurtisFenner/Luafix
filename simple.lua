a = 5;
b = a * a
c = {a,a,a}
d = (#c - 2)
print(d)

function fac(n,p)
	if n == 0 then
		return p
	else
		return fac(n-1,p * n)
	end
end

tern = (a == 3) and b or c;