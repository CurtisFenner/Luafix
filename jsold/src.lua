Tablets={}

	function Tablet(Colr,Txt,Plr)
		local TabModel=Instance.new('Model',workspace)
		local Tab=Instance.new('Part',TabModel) 
		Tab.Anchored=true 
		Tab.Locked=true 
		Tab.CanCollide=false 
		Tab.FormFactor=('Custom') 
		Tab.Size=Vector3.new(4,5,0.2)
		Tab.BrickColor=BrickColor.new(Colr) 
		Tab.Transparency=0.3
		local Box=Instance.new('SelectionBox',Tab) 
		Box.Transparency=0.3 
		Box.Color=Tab.BrickColor 
		Box.Adornee=Tab
		local g=Instance.new("BillboardGui",Tab) 
		g.Adornee=Tab 
		g.Active=false
		g.Size=UDim2.new(12,0,6) 
		g.StudsOffset=Vector3.new(0,4,0)
		local l=Instance.new("TextLabel",g) 
		l.Size=UDim2.new(1,0,1,0)
		l.BackgroundTransparency=1 
		l.TextColor3=Color3.new(0,0,0)
		l.TextStrokeColor3=Color3.new(Colr) 
		l.TextStrokeTransparency=1
		l.Font="SourceSansBold" 
		l.TextWrapped=true 
		l.Active=false
		l.FontSize="Size18" 
		l.Text=Txt g.ExtentsOffset=Vector3.new(0,0,1)
		local Click=Instance.new('ClickDetector',Tab) 
		Click.MaxActivationDistance=math.huge
		Click.MouseClick:connect(function(Pl) if Plr==Plr then Tab:Destroy()
		----------------------------------
		end
		end)
		table.insert(Tablets,TabModel)
	end

local starttime = tick()

game:GetService("RunService").Heartbeat:connect(function()
		ypcall(function()
			for _,Player in pairs(game.Players:GetPlayers()) do
				local PlayerTablets = {}
				for i,v in pairs(Tablets) do
					if v.TabModel.Parent ~= nil and v.Tab.Parent ~= nil and v.Plr == Player.Name then
						table.insert(PlayerTablets, v)
					end
				end
				for i = 1, #PlayerTablets do
					ypcall(function()
						local tab = PlayerTablets[i].Tab
						local pos = nil
						ypcall(function()
							pos = Player.Character.Head.CFrame
						end)
						local x = math.sin(time()/#PlayerTablets + (math.pi*2)/#PlayerTablets*i) * (#PlayerTablets+6)
						local z = math.cos(time()/#PlayerTablets + (math.pi*2)/#PlayerTablets*i) * (#PlayerTablets+6)
						local cPos = tab.Position
						local ePos = Vector3.new(x, 0, z) + (pos.p or Vector3.new(0, -5, 0))
						local nPos = (ePos-cPos)*.25
						cPos = cPos + nPos
						local t = (tick() - starttime) % 360
						local change = 0.625
						PlayerTablets[i].Size = math.sin(t) * change + 2.375
						tab.CFrame = CFrame.new(cPos,cPos,cPos)
						tab.CFrame = CFrame.new(cPos, (pos.p or Vector3.new(0, -5, 0))) * CFrame.Angles(math.rad(11.25), 0, 0)
					end)
				end
			end
		end)
end)


wait(5)
for _, Plr in pairs(game.Players:GetPlayers()) do
Tablet('Lime green','TESTING TABLET ROT' or tostring(error),Plr)
end
