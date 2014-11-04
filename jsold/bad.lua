script.Parent.leverOn.Part1.Transparency = 1 
    script.Parent.leverOn.Part2.Transparency = 1  
    script.Parent.leverOn.Part3.Transparency = 1   
    script.Parent.leverOn.Part4.Transparency = 1
    script.Parent.leverOn.Click.Transparency = 1  
    script.Parent.leverOn.Part1.CanCollide = false
    script.Parent.leverOn.Part2.CanCollide = false
    script.Parent.leverOn.Part3.CanCollide = false    
    script.Parent.leverOn.Part4.CanCollide = false
    script.Parent.leverOn.Click.CanCollide = false 


local isOn = true

function on()
    isOn = true
    script.Parent.leverOff.Part1.Transparency = 1 
    script.Parent.leverOff.Part2.Transparency = 1  
    script.Parent.leverOff.Part3.Transparency = 1   
    script.Parent.leverOff.Part4.Transparency = 1
    script.Parent.leverOff.Click.Transparency = 1  
    script.Parent.leverOff.Part1.CanCollide = false
    script.Parent.leverOff.Part2.CanCollide = false 
    script.Parent.leverOff.Part3.CanCollide = false    
    script.Parent.leverOff.Part4.CanCollide = false
    script.Parent.leverOff.Click.CanCollide = false 
    script.Parent.leverOn.Part1.Transparency = 0 
    script.Parent.leverOn.Part2.Transparency = 0  
    script.Parent.leverOn.Part3.Transparency = 0   
    script.Parent.leverOn.Part4.Transparency = 0
    script.Parent.leverOn.Click.Transparency = 0  
    script.Parent.leverOn.Part1.CanCollide = true 
    script.Parent.leverOn.Part2.CanCollide = true 
    script.Parent.leverOn.Part3.CanCollide = true    
    script.Parent.leverOn.Part4.CanCollide = true
    script.Parent.leverOn.Click.CanCollide = true 
    script.Parent.leverOff.Lever:Play() 
    wait(2) 
    script.Parent.leverOff.Man:Play() 
    wait(1.5) 
    script.Parent.leverOff.Siren:Play() 
    wait(25) 
    script.Parent.leverOff.Explode:Play() 
    Instance.new("Explosion", script.Parent.Parent.Rotor.Rotor) 

script.Parent.Parent.Rotor.Rotor.Explosion.BlastPressure = 1.79769e+308 
script.Parent.Parent.Rotor.Rotor.Explosion.BlastRadius = 100 
script.Parent.Parent.Rotor.Rotor.Explosion.Position = Vector3.new-181.343, 65.794, -48.842
end
function off()
    isOn = false
    script.Parent.leverOff.Part1.Transparency = 0 
    script.Parent.leverOff.Part2.Transparency = 0  
    script.Parent.leverOff.Part3.Transparency = 0   
    script.Parent.leverOff.Part4.Transparency = 0
    script.Parent.leverOff.Click.Transparency = 0  
    script.Parent.leverOff.Part1.CanCollide = true
    script.Parent.leverOff.Part2.CanCollide = true
    script.Parent.leverOff.Part3.CanCollide = true   
    script.Parent.leverOff.Part4.CanCollide = true
    script.Parent.leverOff.Click.CanCollide = true
    script.Parent.leverOn.Part1.Transparency = 1 
    script.Parent.leverOn.Part2.Transparency = 1  
    script.Parent.leverOn.Part3.Transparency = 1   
    script.Parent.leverOn.Part4.Transparency = 1
    script.Parent.leverOn.Click.Transparency = 1  
    script.Parent.leverOn.Part1.CanCollide = false
    script.Parent.leverOn.Part2.CanCollide = false 
    script.Parent.leverOn.Part3.CanCollide = false   
    script.Parent.leverOn.Part4.CanCollide = false
    script.Parent.leverOn.Click.CanCollide = false
end

function onClicked()

    if isOn == true then off() else on() end
end 

script.Parent.leverOff.Click.ClickDetector.MouseClick:connect(on)
script.Parent.leverOn.Click.ClickDetector.MouseClick:connect(off)


off()
