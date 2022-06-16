# FIRSTLang
Free Interactive Robot Steering Tool: A custom scripting language that can be used to control a (virtual) robot!

## How to use
```
import {evaluate} from 'firstlang'

evaluate("for 10 turn(10) forward(5) end")
```

## Examples
```
start = 1
finish = 3
for i = start to finish
  forward(i)
  turn(10)
end

myColor = "black"

color(myColor)
```

This will output the following:
`["forward 1", "turn 10", "forward 2", "turn 10", "color black"]`
